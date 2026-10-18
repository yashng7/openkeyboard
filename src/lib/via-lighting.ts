import { LightingConfig } from '@/types/keyboard';
import { VIA_LIGHTING_VALUE, ViaTransport } from '@/lib/via-protocol';

export interface LightingSkippedField {
  field: string;
  reason: string;
}

export interface LightingWriteReport {
  /** Lighting channel the board answered on, or null when it has no RGB control. */
  channel: number | null;
  wrote: string[];
  skipped: LightingSkippedField[];
  /** Values were read back from the board and matched what we sent. */
  verified: boolean;
  error?: string;
}

/** Converts `#rrggbb` to the 16-bit-hue / 8-bit-sat / 8-bit-val triple VIA expects. */
export function hexToHsv(hex: string): { hue: number; sat: number; val: number } {
  const match = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!match) return { hue: 0, sat: 0, val: 0 };

  const int = parseInt(match[1], 16);
  const r = ((int >> 16) & 0xff) / 255;
  const g = ((int >> 8) & 0xff) / 255;
  const b = (int & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hueDegrees = 0;
  if (delta !== 0) {
    if (max === r) hueDegrees = ((g - b) / delta) % 6;
    else if (max === g) hueDegrees = (b - r) / delta + 2;
    else hueDegrees = (r - g) / delta + 4;
    hueDegrees *= 60;
    if (hueDegrees < 0) hueDegrees += 360;
  }

  return {
    hue: Math.round((hueDegrees / 360) * 65535),
    sat: Math.round(max === 0 ? 0 : (delta / max) * 255),
    val: Math.round(max * 255),
  };
}

const percentToByte = (percent: number) => Math.max(0, Math.min(255, Math.round((percent / 100) * 255)));

const CHANNEL_LABEL: Record<number, string> = {
  1: 'backlight',
  2: 'RGBLight',
  3: 'RGB Matrix',
  5: 'LED Matrix',
};

/**
 * Pushes the profile's lighting state to a real VIA/QMK board.
 *
 * Brightness, speed and colour are portable across every QMK lighting
 * implementation. The *effect* value is an index into the board's own effect
 * list, which lives in its VIA definition — so it is only written when the
 * caller supplies a confirmed index. Everything is saved to the board's EEPROM
 * and then read back to prove the write landed.
 */
export async function pushLighting(
  transport: ViaTransport,
  config: LightingConfig,
  options: { effectIndex?: number } = {}
): Promise<LightingWriteReport> {
  const report: LightingWriteReport = {
    channel: null,
    wrote: [],
    skipped: [],
    verified: false,
  };

  const channel = await transport.detectLightingChannel();
  report.channel = channel;

  if (channel === null) {
    report.error = 'The board answered VIA but exposed no lighting channel.';
    report.skipped.push(
      { field: 'brightness', reason: 'no lighting channel' },
      { field: 'speed', reason: 'no lighting channel' },
      { field: 'colour', reason: 'no lighting channel' },
      { field: 'effect', reason: 'no lighting channel' }
    );
    return report;
  }

  const label = CHANNEL_LABEL[channel] ?? `channel ${channel}`;
  const brightness = percentToByte(config.brightness);
  const speed = percentToByte(config.speed);
  const { hue, sat, val } = hexToHsv(config.primaryHex);

  try {
    await transport.setCustomValue(channel, VIA_LIGHTING_VALUE.BRIGHTNESS, [brightness]);
    report.wrote.push(`Brightness → ${config.brightness}% on ${label}`);
  } catch (err) {
    report.skipped.push({ field: 'brightness', reason: err instanceof Error ? err.message : 'write failed' });
  }

  try {
    await transport.setCustomValue(channel, VIA_LIGHTING_VALUE.EFFECT_SPEED, [speed]);
    report.wrote.push(`Speed → ${config.speed}%`);
  } catch (err) {
    report.skipped.push({ field: 'speed', reason: err instanceof Error ? err.message : 'write failed' });
  }

  try {
    await transport.setCustomValue(channel, VIA_LIGHTING_VALUE.COLOR, [
      (hue >> 8) & 0xff,
      hue & 0xff,
      sat,
      val,
    ]);
    report.wrote.push(`Colour → ${config.primaryHex}`);
  } catch (err) {
    report.skipped.push({ field: 'colour', reason: err instanceof Error ? err.message : 'write failed' });
  }

  if (typeof options.effectIndex === 'number') {
    try {
      await transport.setCustomValue(channel, VIA_LIGHTING_VALUE.EFFECT, [options.effectIndex]);
      report.wrote.push(`Effect index → ${options.effectIndex}`);
    } catch (err) {
      report.skipped.push({ field: 'effect', reason: err instanceof Error ? err.message : 'write failed' });
    }
  } else {
    report.skipped.push({
      field: 'effect',
      reason: `"${config.effect}" has no confirmed index for this board — effect IDs differ per firmware.`,
    });
  }

  try {
    await transport.saveCustomValue(channel);
  } catch (err) {
    report.error = `Changes were sent but the save command failed: ${
      err instanceof Error ? err.message : 'unknown error'
    }`;
    return report;
  }

  // Read back what we just wrote. A tolerance of 2 absorbs 0-255 rounding.
  try {
    const [readBrightness] = await transport.getCustomValue(channel, VIA_LIGHTING_VALUE.BRIGHTNESS, 1);
    const [readSpeed] = await transport.getCustomValue(channel, VIA_LIGHTING_VALUE.EFFECT_SPEED, 1);
    report.verified =
      Math.abs(readBrightness - brightness) <= 2 && Math.abs(readSpeed - speed) <= 2;
    if (!report.verified) {
      report.error = `Read-back mismatch (brightness ${readBrightness}/${brightness}, speed ${readSpeed}/${speed}).`;
    }
  } catch (err) {
    report.error = `Wrote and saved, but read-back failed: ${
      err instanceof Error ? err.message : 'unknown error'
    }`;
  }

  return report;
}

export function summariseLightingReport(report: LightingWriteReport): string {
  if (report.error && report.wrote.length === 0) return report.error;

  const wrote = report.wrote.length > 0 ? report.wrote.join(', ') : 'nothing';
  const skipped = report.skipped.length > 0 ? `Skipped: ${report.skipped.map((s) => s.field).join(', ')}.` : '';
  const verified = report.verified ? 'Verified on the board.' : 'Saved to the board (read-back unconfirmed).';

  return `${wrote}. ${verified} ${skipped}`.trim();
}
