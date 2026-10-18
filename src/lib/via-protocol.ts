import { WebHidDevice, WebHidInputReportEvent } from '@/lib/webhid-engine';

/**
 * VIA / QMK raw HID command IDs.
 * Source of truth: qmk_firmware `quantum/via.h` (`enum via_command_id`).
 */
export const VIA_PROTOCOL = {
  GET_PROTOCOL_VERSION: 0x01,
  GET_KEYBOARD_VALUE: 0x02,
  SET_KEYBOARD_VALUE: 0x03,
  DYNAMIC_KEYMAP_GET_KEYCODE: 0x04,
  DYNAMIC_KEYMAP_SET_KEYCODE: 0x05,
  DYNAMIC_KEYMAP_RESET: 0x06,
  CUSTOM_MENU_SET_VALUE: 0x07,
  CUSTOM_MENU_GET_VALUE: 0x08,
  CUSTOM_MENU_SAVE: 0x09,
  EEPROM_RESET: 0x0a,
  DYNAMIC_KEYMAP_GET_LAYER_COUNT: 0x11,
  DYNAMIC_KEYMAP_GET_BUFFER: 0x12,
  DYNAMIC_KEYMAP_SET_BUFFER: 0x13,
} as const;

/** `enum via_keyboard_value_id` */
export const VIA_KEYBOARD_VALUE = {
  UPTIME: 0x01,
  LAYOUT_OPTIONS: 0x02,
  SWITCH_MATRIX_STATE: 0x03,
  FIRMWARE_VERSION: 0x04,
} as const;

/** `enum via_channel_id` */
export const VIA_CHANNEL = {
  CUSTOM: 0,
  QMK_BACKLIGHT: 1,
  QMK_RGBLIGHT: 2,
  QMK_RGB_MATRIX: 3,
  QMK_AUDIO: 4,
  QMK_LED_MATRIX: 5,
} as const;

/** `enum via_qmk_rgblight_value` / `via_qmk_rgb_matrix_value` — identical IDs. */
export const VIA_LIGHTING_VALUE = {
  BRIGHTNESS: 1,
  EFFECT: 2,
  EFFECT_SPEED: 3,
  COLOR: 4,
} as const;

/** Lighting channels worth probing, most capable first. */
export const LIGHTING_CHANNELS = [
  VIA_CHANNEL.QMK_RGB_MATRIX,
  VIA_CHANNEL.QMK_RGBLIGHT,
  VIA_CHANNEL.QMK_BACKLIGHT,
  VIA_CHANNEL.QMK_LED_MATRIX,
] as const;

/** VIA reports and commands are fixed 32-byte payloads. */
const REPORT_LENGTH = 32;

/**
 * VIA always addresses its raw HID interface with report ID 0
 * (`COMMAND_START` in the VIA app). The report ID is part of the framing, so
 * this is not negotiable per-device.
 */
const REPORT_ID = 0;

export class ViaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ViaError';
  }
}

export interface ViaCapabilities {
  /** The board actually answered a VIA command. */
  responded: boolean;
  protocolMajor: number | null;
  protocolMinor: number | null;
  layerCount: number | null;
  firmwareVersion: number | null;
  /** First lighting channel that answered, or null when the board has no RGB. */
  lightingChannel: number | null;
  error?: string;
}

export interface ViaTransportOptions {
  /** Per-command reply timeout. VIA boards are fast; 1s is generous. */
  timeoutMs?: number;
  /** Diagnostics hook so the UI packet log can show real traffic. */
  onCommand?: (direction: 'OUT' | 'IN', command: number, bytes: Uint8Array | null) => void;
}

const byte = (n: number) => n & 0xff;

/**
 * Serialised request/response transport for a VIA/QMK raw HID interface.
 *
 * Every VIA reply echoes the command ID in byte 0 (and, for keymap and
 * custom-value commands, the identifying arguments after it). Replies are
 * matched on those bytes, so a late reply to a previous command can never be
 * mistaken for the current one.
 */
export class ViaTransport {
  private readonly device: WebHidDevice;
  private readonly timeoutMs: number;
  private readonly onCommand?: ViaTransportOptions['onCommand'];
  private queue: Promise<unknown> = Promise.resolve();
  private disposed = false;

  constructor(device: WebHidDevice, options: ViaTransportOptions = {}) {
    this.device = device;
    this.timeoutMs = options.timeoutMs ?? 1000;
    this.onCommand = options.onCommand;
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    if (this.disposed) return Promise.reject(new ViaError('Transport disposed'));
    const run = this.queue.then(fn, fn);
    // Keep the chain alive even when a command rejects.
    this.queue = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  private async sendBytes(payload: Uint8Array): Promise<void> {
    if (!this.device.opened) await this.device.open();
    await this.device.sendReport(REPORT_ID, payload);
  }

  /**
   * Sends one command and waits for the matching reply.
   * `echoArgs` are the argument bytes the board must echo back.
   */
  private command(
    command: number,
    args: number[] = [],
    echoArgs: number[] = args,
    timeoutMs = this.timeoutMs
  ): Promise<Uint8Array> {
    return this.enqueue(
      () =>
        new Promise<Uint8Array>((resolve, reject) => {
          let settled = false;

          const cleanup = () => {
            clearTimeout(timer);
            try {
              this.device.removeEventListener?.('inputreport', onReport);
            } catch {
              // Device may already be gone.
            }
          };

          const succeed = (bytes: Uint8Array) => {
            if (settled) return;
            settled = true;
            cleanup();
            this.onCommand?.('IN', command, bytes);
            resolve(bytes);
          };

          const fail = (err: Error) => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(err);
          };

          const onReport = (event: unknown) => {
            const e = event as WebHidInputReportEvent;
            const data = e?.data;
            if (!data || data.byteLength < 1) return;
            // Byte 0 echoes the command ID.
            if (data.getUint8(0) !== byte(command)) return;
            // Bytes 1..n echo the arguments for the commands we care about.
            for (let i = 0; i < echoArgs.length; i++) {
              if (1 + i >= data.byteLength) return;
              if (data.getUint8(1 + i) !== byte(echoArgs[i])) return;
            }
            const copy = new Uint8Array(data.byteLength);
            for (let i = 0; i < data.byteLength; i++) copy[i] = data.getUint8(i);
            succeed(copy);
          };

          const timer = setTimeout(
            () => fail(new ViaError(`Timed out waiting for command 0x${command.toString(16).toUpperCase()}`)),
            timeoutMs
          );

          this.device.addEventListener('inputreport', onReport);

          const payload = new Uint8Array(REPORT_LENGTH);
          payload[0] = byte(command);
          for (let i = 0; i < Math.min(args.length, REPORT_LENGTH - 1); i++) {
            payload[1 + i] = byte(args[i]);
          }

          // Only report the frame as sent once the HID stack accepted it.
          this.sendBytes(payload)
            .then(() => this.onCommand?.('OUT', command, payload))
            .catch((err) => fail(err instanceof Error ? err : new ViaError('HID write failed')));
        })
    );
  }

  /** Returns null instead of throwing when the board does not answer. */
  private async commandOrNull(
    command: number,
    args: number[] = [],
    echoArgs: number[] = args,
    timeoutMs = this.timeoutMs
  ): Promise<Uint8Array | null> {
    try {
      return await this.command(command, args, echoArgs, timeoutMs);
    } catch {
      return null;
    }
  }

  /** Probes are allowed to fail fast, but never slower than the caller asked. */
  private get probeTimeout(): number {
    return Math.min(600, this.timeoutMs);
  }

  async getProtocolVersion(): Promise<{ major: number; minor: number } | null> {
    const reply = await this.commandOrNull(VIA_PROTOCOL.GET_PROTOCOL_VERSION, [], [], this.probeTimeout);
    if (!reply || reply.length < 3) return null;
    return { major: reply[1], minor: reply[2] };
  }

  /** Layer count, when the firmware is new enough to report it. */
  async getLayerCount(): Promise<number | null> {
    const reply = await this.commandOrNull(VIA_PROTOCOL.DYNAMIC_KEYMAP_GET_LAYER_COUNT, [], [], this.probeTimeout);
    return reply && reply.length >= 2 ? reply[1] : null;
  }

  async getFirmwareVersion(): Promise<number | null> {
    const reply = await this.commandOrNull(
      VIA_PROTOCOL.GET_KEYBOARD_VALUE,
      [VIA_KEYBOARD_VALUE.FIRMWARE_VERSION],
      [VIA_KEYBOARD_VALUE.FIRMWARE_VERSION],
      this.probeTimeout
    );
    if (!reply || reply.length < 6) return null;
    return ((reply[2] << 24) | (reply[3] << 16) | (reply[4] << 8) | reply[5]) >>> 0;
  }

  /** Reads the keycode at a matrix position. Reply: [cmd, layer, row, col, hi, lo] */
  async getKey(layer: number, row: number, col: number): Promise<number> {
    const reply = await this.command(VIA_PROTOCOL.DYNAMIC_KEYMAP_GET_KEYCODE, [layer, row, col]);
    if (reply.length < 6) throw new ViaError('Short reply for GET_KEYCODE');
    return (reply[4] << 8) | reply[5];
  }

  /**
   * Writes a keycode. The board echoes the resulting value, which is our
   * read-back verification — a wrong cell or rejected write shows up here.
   */
  async setKey(layer: number, row: number, col: number, keycode: number): Promise<number> {
    const reply = await this.command(VIA_PROTOCOL.DYNAMIC_KEYMAP_SET_KEYCODE, [
      layer,
      row,
      col,
      (keycode >> 8) & 0xff,
      keycode & 0xff,
    ]);
    if (reply.length < 6) throw new ViaError('Short reply for SET_KEYCODE');
    return (reply[4] << 8) | reply[5];
  }

  /** Reads `length` bytes of a custom-menu value. Reply data starts at byte 3. */
  async getCustomValue(channel: number, valueId: number, length = 1, timeoutMs = this.timeoutMs): Promise<number[]> {
    const reply = await this.command(
      VIA_PROTOCOL.CUSTOM_MENU_GET_VALUE,
      [channel, valueId],
      [channel, valueId],
      timeoutMs
    );
    const out: number[] = [];
    for (let i = 0; i < length; i++) {
      if (3 + i >= reply.length) break;
      out.push(reply[3 + i]);
    }
    return out;
  }

  async setCustomValue(channel: number, valueId: number, value: number[]): Promise<void> {
    await this.command(VIA_PROTOCOL.CUSTOM_MENU_SET_VALUE, [channel, valueId, ...value], [channel, valueId]);
  }

  async saveCustomValue(channel: number): Promise<void> {
    await this.command(VIA_PROTOCOL.CUSTOM_MENU_SAVE, [channel], [channel]);
  }

  /** Wipes the dynamic keymap back to the firmware default. */
  async resetDynamicKeymap(): Promise<void> {
    await this.command(VIA_PROTOCOL.DYNAMIC_KEYMAP_RESET);
  }

  /** Probes everything the UI needs to decide what it is allowed to write. */
  async getCapabilities(): Promise<ViaCapabilities> {
    const version = await this.getProtocolVersion();

    if (!version) {
      return {
        responded: false,
        protocolMajor: null,
        protocolMinor: null,
        layerCount: null,
        firmwareVersion: null,
        lightingChannel: null,
        error: 'No VIA reply — this may not be QMK/VIA firmware, or the vendor interface is not exposed.',
      };
    }

    const layerCount = await this.getLayerCount();
    const firmwareVersion = await this.getFirmwareVersion();
    const lightingChannel = await this.detectLightingChannel();

    return {
      responded: true,
      protocolMajor: version.major,
      protocolMinor: version.minor,
      layerCount,
      firmwareVersion,
      lightingChannel,
    };
  }

  /** First lighting channel that answers a brightness read. */
  async detectLightingChannel(): Promise<number | null> {
    for (const channel of LIGHTING_CHANNELS) {
      try {
        const value = await this.getCustomValue(channel, VIA_LIGHTING_VALUE.BRIGHTNESS, 1, 400);
        if (value.length === 1) return channel;
      } catch {
        // Channel not implemented on this board — try the next one.
      }
    }
    return null;
  }

  dispose(): void {
    this.disposed = true;
  }
}
