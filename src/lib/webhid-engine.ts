import { HidPacketLog } from '@/types/keyboard';

// Minimal WebHID TypeScript declarations for browser safety
export interface WebHidCollection {
  usagePage?: number;
  usage?: number;
  children?: WebHidCollection[];
  inputReports?: Array<{ reportId: number; items?: unknown[] }>;
  outputReports?: Array<{ reportId: number; items?: unknown[] }>;
  featureReports?: Array<{ reportId: number; items?: unknown[] }>;
}

export interface WebHidInputReportEvent {
  data: DataView;
  reportId: number;
  device: WebHidDevice;
}

export interface WebHidDevice {
  opened: boolean;
  vendorId: number;
  productId: number;
  productName: string;
  collections: WebHidCollection[];
  open(): Promise<void>;
  close(): Promise<void>;
  sendReport(reportId: number, data: Uint8Array | BufferSource): Promise<void>;
  sendFeatureReport(reportId: number, data: Uint8Array | BufferSource): Promise<void>;
  receiveFeatureReport?(reportId: number): Promise<DataView>;
  addEventListener(type: string, listener: (event: unknown) => void): void;
  removeEventListener?(type: string, listener: (event: unknown) => void): void;
  forget?(): Promise<void>;
}

export function isWebHidSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return 'hid' in navigator;
}

export function encodeHidCommandPacket(
  commandName: string,
  opcode: number,
  payloadBytes: number[]
): { reportId: number; bytes: Uint8Array; hexString: string } {
  const bytes = new Uint8Array(32);
  bytes[0] = 0xa0; // OpenKeyboard / Vendor Protocol Header
  bytes[1] = opcode & 0xff;
  bytes[2] = payloadBytes.length & 0xff;

  for (let i = 0; i < Math.min(payloadBytes.length, 28); i++) {
    bytes[3 + i] = payloadBytes[i] & 0xff;
  }

  // Simple checksum in last byte
  let checksum = 0;
  for (let i = 0; i < 31; i++) {
    checksum = (checksum + bytes[i]) & 0xff;
  }
  bytes[31] = checksum;

  const hexString = Array.from(bytes.slice(0, 12))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  return {
    reportId: 0x00,
    bytes,
    hexString: `${hexString} ... [CRC:${checksum.toString(16).padStart(2, '0').toUpperCase()}]`,
  };
}

export async function dispatchHidPacket(
  rawDevice: WebHidDevice | null,
  commandName: string,
  opcode: number,
  payloadBytes: number[]
): Promise<HidPacketLog> {
  const { reportId, bytes, hexString } = encodeHidCommandPacket(commandName, opcode, payloadBytes);
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

  if (rawDevice && rawDevice.opened) {
    try {
      await rawDevice.sendReport(reportId, bytes);
      return {
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp,
        direction: 'OUT',
        commandName,
        reportId,
        hexBytes: hexString,
        status: 'confirmed',
      };
    } catch (err) {
      // Report the failure honestly. Chrome blocks reports on protected
      // (keyboard/mouse) collections, so this is the normal outcome for boot
      // interfaces — never claim an ACK we did not get.
      return {
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp,
        direction: 'OUT',
        commandName,
        reportId,
        hexBytes: hexString,
        status: 'error',
        error: err instanceof Error ? err.message : 'HID write rejected',
      };
    }
  }

  return {
    id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp,
    direction: 'OUT',
    commandName,
    reportId,
    hexBytes: hexString,
    status: 'simulated',
  };
}
