import {
  DetectedInterface,
  DetectedKeyboard,
  FormFactor,
  HidInterfaceKind,
  ViaProbeResult,
} from '@/types/keyboard';
import { WebHidDevice, WebHidCollection, WebHidInputReportEvent } from '@/lib/webhid-engine';

// ---------------------------------------------------------------------------
// WebHID usage constants
// ---------------------------------------------------------------------------

const USAGE_PAGE_GENERIC_DESKTOP = 0x01;
const USAGE_PAGE_CONSUMER = 0x0c;
const USAGE_PAGE_VIA_RAW_HID = 0xff60;

const USAGE_KEYBOARD = 0x06;
const USAGE_MOUSE = 0x02;
const USAGE_KEYPAD = 0x07;
const USAGE_CONSUMER_CONTROL = 0x01;
const USAGE_VIA_RAW = 0x61;

/**
 * VIA / QMK raw HID command IDs (quantum/via.h, `enum via_command_id`).
 * The board echoes the command ID back in byte 0 of the reply.
 */
export const VIA_CMD_GET_PROTOCOL_VERSION = 0x01;
export const VIA_CMD_GET_KEYBOARD_VALUE = 0x02;
export const VIA_VALUE_FIRMWARE_VERSION = 0x04;
export const VIA_CMD_DYNAMIC_KEYMAP_GET_LAYER_COUNT = 0x11;

/** VIA raw HID uses fixed 32-byte reports. */
const VIA_REPORT_LENGTH = 32;

// ---------------------------------------------------------------------------
// Interface classification
// ---------------------------------------------------------------------------

/**
 * Chrome refuses to send or receive any reports defined in a top-level
 * collection that carries a "protected" usage — generic keyboard, mouse and
 * friends. See the security/privacy section of the WebHID docs
 * (services/device/public/cpp/hid/hid_report_utils.cc).
 *
 * This is why a plain keyboard cannot be keylogged over WebHID, and why we can
 * only configure boards through their *vendor* collection.
 */
export function isProtectedCollection(usagePage?: number, usage?: number): boolean {
  if (usagePage !== USAGE_PAGE_GENERIC_DESKTOP) return false;
  return usage === USAGE_KEYBOARD || usage === USAGE_MOUSE || usage === USAGE_KEYPAD;
}

function allCollections(device: WebHidDevice): WebHidCollection[] {
  const out: WebHidCollection[] = [];
  const walk = (cols?: WebHidCollection[]) => {
    for (const c of cols ?? []) {
      out.push(c);
      walk(c.children);
    }
  };
  walk(device.collections);
  return out;
}

/** Picks the report ID declared by the report descriptor for the given collection. */
function pickOutputReportId(collections: WebHidCollection[]): number {
  for (const c of collections) {
    const id = c.outputReports?.[0]?.reportId;
    if (typeof id === 'number') return id;
  }
  // Devices that do not use report IDs report id 0.
  return 0;
}

export function classifyInterfaces(device: WebHidDevice): DetectedInterface[] {
  const collections = allCollections(device);

  const seen = new Set<HidInterfaceKind>();
  const interfaces: DetectedInterface[] = [];

  for (const c of collections) {
    const usagePage = typeof c.usagePage === 'number' ? c.usagePage : null;
    const usage = typeof c.usage === 'number' ? c.usage : null;

    let kind: HidInterfaceKind;
    let label: string;

    if (usagePage === USAGE_PAGE_VIA_RAW_HID && usage === USAGE_VIA_RAW) {
      kind = 'via_raw_hid';
      label = 'VIA / QMK Raw HID (configurable)';
    } else if (isProtectedCollection(usagePage ?? undefined, usage ?? undefined)) {
      if (usage === USAGE_KEYBOARD) {
        kind = 'boot_keyboard';
        label = 'Boot Keyboard (reports blocked by Chrome)';
      } else if (usage === USAGE_MOUSE) {
        kind = 'mouse';
        label = 'Mouse (reports blocked by Chrome)';
      } else {
        kind = 'unknown';
        label = 'Protected Generic Desktop collection';
      }
    } else if (usagePage === USAGE_PAGE_CONSUMER && usage === USAGE_CONSUMER_CONTROL) {
      kind = 'consumer_control';
      label = 'Consumer Control / media keys';
    } else if (usagePage !== null && usagePage >= 0xff00) {
      kind = 'vendor_defined';
      label = `Vendor-defined page 0x${usagePage.toString(16).toUpperCase()}`;
    } else {
      kind = 'unknown';
      label = usagePage !== null ? `Usage page 0x${usagePage.toString(16).toUpperCase()}` : 'Unknown collection';
    }

    // Collapse duplicate usages (a board may declare the same collection twice).
    if (seen.has(kind) && kind !== 'vendor_defined' && kind !== 'unknown') continue;
    seen.add(kind);

    const protectedCollection = isProtectedCollection(usagePage ?? undefined, usage ?? undefined);

    interfaces.push({
      kind,
      label,
      usagePage,
      usage,
      outputReportId: pickOutputReportId([c]),
      protectedCollection,
      configurable: kind === 'via_raw_hid' || kind === 'vendor_defined',
    });
  }

  return interfaces;
}

// ---------------------------------------------------------------------------
// Vendor identification
// ---------------------------------------------------------------------------

/**
 * WebHID exposes HID interfaces, not keyboards. A single physical board normally
 * produces several entries (boot keyboard, NKRO keyboard, consumer control,
 * vendor/VIA page) that all share one vendorId/productId pair.
 */
export const VENDOR_NAMES: Record<number, string> = {
  0x31e3: 'Wooting',
  0x3434: 'Keychron',
  0x3554: 'Wuque Studio',
  0x342d: 'Wuque / QK',
  0x19f5: 'NuPhy',
  0x3151: 'MonsGeek / Akko',
  0x352d: 'DrunkDeer',
  0x1532: 'Razer',
  0x046d: 'Logitech G',
  0x320f: 'Glorious',
  0x362d: 'Luminkey',
  0x0c45: 'Sonix / Womier',
  0x05ac: 'Apple',
};

/** Vendors known to build Hall-effect / magnetic-switch boards. */
export const MAGNETIC_VENDOR_IDS = new Set<number>([
  0x31e3, // Wooting
  0x3434, // Keychron (Q HE series)
  0x3554, // Wuque Studio
  0x19f5, // NuPhy HE
  0x3151, // MonsGeek / Akko HE
  0x352d, // DrunkDeer
  0x1532, // Razer analog
  0x046d, // Logitech Rapid
  0x362d, // Luminkey
]);

export const WEBHID_FILTERS = [
  // VIA / QMK raw HID — the standard configurable interface.
  { usagePage: USAGE_PAGE_VIA_RAW_HID, usage: USAGE_VIA_RAW },
  // Vendor-defined magnetic HID pages.
  { usagePage: 0xff00 },
  { usagePage: 0xff53 },
  // Known board vendors (matches all of their interfaces).
  ...Object.keys(VENDOR_NAMES).map((vid) => ({ vendorId: Number(vid) })),
];

export function vendorNameFor(vendorId: number): string {
  return VENDOR_NAMES[vendorId] ?? `HID Vendor 0x${vendorId.toString(16).toUpperCase().padStart(4, '0')}`;
}

/** Best-effort form factor from the product name; boards rarely expose this. */
export function guessFormFactor(productName: string, vendorId: number): {
  formFactor: FormFactor;
  source: DetectedKeyboard['formFactorSource'];
} {
  // Strip '%' and match digits next to letters too ("Field75", "60HE"), which
  // a plain \b word boundary would miss.
  const n = (productName || '').toLowerCase().replace(/%/g, ' ');
  const hasNumber = (nums: string) => new RegExp(`(^|[^0-9])(${nums})([^0-9]|$)`).test(n);

  if (/\bfull(?:[- ]?size)?\b/.test(n) || hasNumber('100|104|108')) {
    return { formFactor: '100%', source: 'name-match' };
  }
  if (/\b(tkl|tenkeyless)\b/.test(n) || hasNumber('80|87')) {
    return { formFactor: 'tkl', source: 'name-match' };
  }
  if (hasNumber('75|84')) return { formFactor: '75%', source: 'name-match' };
  if (hasNumber('65|67|68')) return { formFactor: '65%', source: 'name-match' };
  if (hasNumber('60|61|64')) return { formFactor: '60%', source: 'name-match' };

  // Fall back to the vendor's house style rather than pretending to know.
  if (vendorId === 0x31e3) return { formFactor: '60%', source: 'vendor-default' };
  return { formFactor: '75%', source: 'vendor-default' };
}

// ---------------------------------------------------------------------------
// Grouping interfaces into physical keyboards
// ---------------------------------------------------------------------------

export function groupInterfaces(interfaces: WebHidDevice[], previouslyGranted: boolean): DetectedKeyboard[] {
  const byPhysicalDevice = new Map<string, DetectedKeyboard>();

  for (const device of interfaces) {
    const groupId = `webhid-${device.vendorId}-${device.productId}`;
    const detectedInterfaces = classifyInterfaces(device);

    const existing = byPhysicalDevice.get(groupId);
    if (existing) {
      for (const iface of detectedInterfaces) {
        const dup = existing.interfaces.some(
          (i) => i.kind === iface.kind && i.usagePage === iface.usagePage && i.usage === iface.usage
        );
        if (!dup) existing.interfaces.push(iface);
      }
      if (existing.configInterfaceIndex === null) {
        const idx = existing.interfaces.findIndex((i) => i.configurable);
        existing.configInterfaceIndex = idx >= 0 ? idx : null;
      }
      existing.isConfigurable = existing.configInterfaceIndex !== null;
      continue;
    }

    const { formFactor, source } = guessFormFactor(device.productName, device.vendorId);
    const configIndex = detectedInterfaces.findIndex((i) => i.configurable);

    byPhysicalDevice.set(groupId, {
      id: groupId,
      name: device.productName || `${vendorNameFor(device.vendorId)} Keyboard`,
      vendorName: vendorNameFor(device.vendorId),
      vendorId: device.vendorId,
      productId: device.productId,
      formFactor,
      formFactorSource: source,
      interfaces: detectedInterfaces,
      configInterfaceIndex: configIndex >= 0 ? configIndex : null,
      isConfigurable: configIndex >= 0,
      knownMagneticVendor: MAGNETIC_VENDOR_IDS.has(device.vendorId),
      probe: null,
      previouslyGranted,
    });
  }

  return [...byPhysicalDevice.values()];
}

// ---------------------------------------------------------------------------
// Detection entry points
// ---------------------------------------------------------------------------

export interface HidSupport {
  supported: boolean;
  secureContext: boolean;
  reason?: string;
}

export function checkWebHidSupport(): HidSupport {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { supported: false, secureContext: false, reason: 'Not running in a browser context.' };
  }
  const secureContext = window.isSecureContext;
  if (!('hid' in navigator)) {
    return {
      supported: false,
      secureContext,
      reason: 'This browser has no WebHID API. Use Chrome, Edge, Brave or Opera.',
    };
  }
  if (!secureContext) {
    return {
      supported: false,
      secureContext,
      reason: 'WebHID requires a secure context (HTTPS or http://localhost).',
    };
  }
  return { supported: true, secureContext };
}

function hidApi() {
  return (navigator as unknown as {
    hid: {
      getDevices(): Promise<WebHidDevice[]>;
      requestDevice(options: { filters: unknown[]; exclusionFilters?: unknown[] }): Promise<WebHidDevice[]>;
      addEventListener(type: string, listener: (event: unknown) => void): void;
      removeEventListener(type: string, listener: (event: unknown) => void): void;
    };
  }).hid;
}

/**
 * Lists keyboards the user has ALREADY granted this origin access to.
 * This never prompts, and it is the only way to "detect" a keyboard without a
 * user gesture — WebHID deliberately has no enumerate-everything API.
 */
export async function getGrantedInterfaces(): Promise<WebHidDevice[]> {
  const support = checkWebHidSupport();
  if (!support.supported) return [];
  try {
    return await hidApi().getDevices();
  } catch {
    return [];
  }
}

export async function scanGrantedKeyboards(): Promise<DetectedKeyboard[]> {
  const devices = await getGrantedInterfaces();
  return groupInterfaces(devices, true);
}

/** Opens the browser's device picker. Must be called from a user gesture. */
export async function requestInterfaces(): Promise<WebHidDevice[]> {
  const support = checkWebHidSupport();
  if (!support.supported) {
    throw new Error(support.reason ?? 'WebHID is unavailable.');
  }
  return (await hidApi().requestDevice({ filters: WEBHID_FILTERS })) ?? [];
}

export async function pairKeyboards(): Promise<DetectedKeyboard[]> {
  const devices = await requestInterfaces();
  if (!devices || devices.length === 0) return [];
  return groupInterfaces(devices, false);
}

/**
 * Picks the interface Chrome will actually let us talk to — a vendor-defined or
 * VIA raw HID collection. Boot keyboard / mouse collections are unusable.
 */
export function findConfigDevice(devices: WebHidDevice[]): WebHidDevice | null {
  for (const device of devices) {
    if (classifyInterfaces(device).some((i) => i.configurable)) return device;
  }
  return null;
}

/**
 * Notifies when a previously-granted board is plugged in or removed.
 * Devices that were never granted do not fire these events.
 */
export function subscribeToHidHotplug(onChange: (kind: 'connect' | 'disconnect') => void): () => void {
  const support = checkWebHidSupport();
  if (!support.supported) return () => {};

  const handler = (event: unknown) => {
    const type = (event as { type?: string }).type;
    if (type === 'connect' || type === 'disconnect') onChange(type);
  };

  const hid = hidApi();
  hid.addEventListener('connect', handler);
  hid.addEventListener('disconnect', handler);
  return () => {
    hid.removeEventListener('connect', handler);
    hid.removeEventListener('disconnect', handler);
  };
}

// ---------------------------------------------------------------------------
// Live handshake: prove the board is really there
// ---------------------------------------------------------------------------

/**
 * Real request/response against a VIA/QMK raw HID interface.
 * Returns null when the device exposes no configurable vendor interface.
 */
export async function openConfigInterface(device: WebHidDevice): Promise<WebHidDevice | null> {
  if (!device.opened) await device.open();
  return device;
}

function viaOutputReportId(device: WebHidDevice): number {
  const collections = device.collections ?? [];
  // Prefer the VIA raw HID collection, then any collection with a declared report.
  const viaCollection = collections.find((c) => c.usagePage === USAGE_PAGE_VIA_RAW_HID && c.usage === USAGE_VIA_RAW);
  const fromVia = pickOutputReportId(viaCollection ? [viaCollection] : []);
  if (viaCollection?.outputReports?.length) return fromVia;
  return pickOutputReportId(collections);
}

/** Sends one 32-byte command and waits for the matching reply report. */
function viaRequest(
  device: WebHidDevice,
  reportId: number,
  payload: Uint8Array,
  expectCommand: number,
  timeoutMs: number
): Promise<DataView | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: DataView | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      device.removeEventListener?.('inputreport', onReport);
      resolve(value);
    };

    const onReport = (event: unknown) => {
      const e = event as WebHidInputReportEvent;
      // The board echoes the command ID in byte 0 of the reply.
      if (e?.data && e.data.byteLength > 0 && e.data.getUint8(0) === expectCommand) {
        finish(e.data);
      }
    };

    const timer = setTimeout(() => finish(null), timeoutMs);
    device.addEventListener('inputreport', onReport);

    const data = new Uint8Array(VIA_REPORT_LENGTH);
    data.set(payload.subarray(0, VIA_REPORT_LENGTH));

    // Some vendor interfaces only answer on feature reports; try output then feature.
    device
      .sendReport(reportId, data)
      .catch(() => device.sendFeatureReport(reportId, data))
      .catch(() => finish(null));
  });
}

/**
 * Asks a real board for its VIA protocol version, firmware version and layer
 * count. A non-null `responded: true` means a genuine keyboard answered.
 */
export async function probeViaBoard(device: WebHidDevice, timeoutMs = 800): Promise<ViaProbeResult> {
  const reportId = viaOutputReportId(device);

  const versionReply = await viaRequest(
    device,
    reportId,
    Uint8Array.from([VIA_CMD_GET_PROTOCOL_VERSION]),
    VIA_CMD_GET_PROTOCOL_VERSION,
    timeoutMs
  );

  if (!versionReply) {
    return {
      responded: false,
      protocolMajor: null,
      protocolMinor: null,
      firmwareVersion: null,
      layerCount: null,
      error: 'No reply. The interface may not be VIA/QMK, or the board needs its vendor software.',
    };
  }

  const protocolMajor = versionReply.getUint8(1);
  const protocolMinor = versionReply.getUint8(2);

  const firmwareReply = await viaRequest(
    device,
    reportId,
    Uint8Array.from([VIA_CMD_GET_KEYBOARD_VALUE, VIA_VALUE_FIRMWARE_VERSION]),
    VIA_CMD_GET_KEYBOARD_VALUE,
    timeoutMs
  );

  const layersReply = await viaRequest(
    device,
    reportId,
    Uint8Array.from([VIA_CMD_DYNAMIC_KEYMAP_GET_LAYER_COUNT]),
    VIA_CMD_DYNAMIC_KEYMAP_GET_LAYER_COUNT,
    timeoutMs
  );

  const firmwareVersion = firmwareReply
    ? (firmwareReply.getUint8(2) << 24) |
      (firmwareReply.getUint8(3) << 16) |
      (firmwareReply.getUint8(4) << 8) |
      firmwareReply.getUint8(5)
    : null;

  return {
    responded: true,
    protocolMajor,
    protocolMinor,
    firmwareVersion: firmwareVersion !== null ? (firmwareVersion >>> 0) : null,
    layerCount: layersReply ? layersReply.getUint8(1) : null,
  };
}
