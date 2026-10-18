'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ConnectedDeviceInfo,
  DetectedKeyboard,
  FormFactor,
  HidPacketLog,
  JevAdvisorDecisionResponse,
  KeyboardProfile,
  LayerIndex,
  LightingConfig,
  MacroSlot,
  PerKeyTriggerConfig,
  SocdPair,
  SwitchSoundProfile,
  ThemeMode,
  ViaProbeResult,
  WorkspaceTab,
} from '@/types/keyboard';
import {
  createDefaultProfile,
  getAllKeysForLayout,
  PRESET_PROFILES,
  SIMULATOR_DEVICES,
} from '@/lib/keyboard-data';
import {
  dispatchHidPacket,
  isWebHidSupported,
  WebHidDevice,
} from '@/lib/webhid-engine';
import {
  checkWebHidSupport,
  findConfigDevice,
  getGrantedInterfaces,
  groupInterfaces,
  probeViaBoard,
  requestInterfaces,
  subscribeToHidHotplug,
} from '@/lib/hid-detect';
import { ViaTransport } from '@/lib/via-protocol';
import { pushLighting, summariseLightingReport } from '@/lib/via-lighting';
import { playSwitchSound } from '@/lib/sound-engine';

export interface ChatterEvent {
  id: string;
  keyId: string;
  deltaMs: number;
  isBounceWarning: boolean;
  timestamp: string;
}

interface KeyboardContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Device & WebHID
  webHidSupported: boolean;
  device: ConnectedDeviceInfo;
  connectWebHidDevice: () => Promise<void>;
  selectSimulatorDevice: (deviceId: string) => void;
  /** Interfaces/keyboards this origin can see, grouped per physical board. */
  detectedKeyboards: DetectedKeyboard[];
  /** True while a scan/pair/probe is in flight. */
  detecting: boolean;
  /** Re-runs navigator.hid.getDevices() without prompting the user. */
  rescanKeyboards: () => Promise<void>;
  /** Opens the config interface of a detected board and probes it. */
  useDetectedKeyboard: (keyboardId: string) => Promise<void>;
  /** True when the active device answered VIA and can be written to. */
  writableBoardConnected: boolean;
  packetLogs: HidPacketLog[];
  clearPacketLogs: () => void;

  // Profile & Staged Changes
  profiles: KeyboardProfile[];
  activeProfile: KeyboardProfile;
  hasUnsavedChanges: boolean;
  selectProfile: (profileId: string) => void;
  createNewProfile: (name: string) => void;
  duplicateActiveProfile: () => void;
  deleteProfile: (profileId: string) => void;
  importProfileJson: (jsonStr: string) => boolean;
  commitPendingChangesToBoard: () => Promise<void>;
  discardPendingChanges: () => void;

  // Selection & Layers
  selectedKeyIds: string[];
  setSelectedKeyIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectKey: (keyId: string, multi?: boolean) => void;
  selectKeyGroup: (group: 'all' | 'wasd' | 'alphas' | 'modifiers' | 'none') => void;
  activeLayer: LayerIndex;
  setActiveLayer: (layer: LayerIndex) => void;

  // Keymap & Hardware Mutators
  setFormFactor: (ff: FormFactor) => void;
  setSystemMode: (mode: 'win' | 'mac') => void;
  setPollingRate: (hz: 125 | 250 | 500 | 1000 | 2000 | 4000 | 8000) => void;
  setTachyonMode: (enabled: boolean) => void;
  setSleepMinutes: (mins: number) => void;
  assignKeycodeToSelected: (codeOrLabel: string) => void;
  resetLayerMappings: (layer: LayerIndex) => void;

  // Magnetic / Hall-Effect Mutators
  getTriggerForKey: (keyId: string) => PerKeyTriggerConfig;
  updateTriggerForSelected: (patch: Partial<PerKeyTriggerConfig>) => void;
  updateGlobalTrigger: (patch: Partial<PerKeyTriggerConfig>) => void;
  resetSelectedTriggersToGlobal: () => void;
  toggleSocdPair: (pairId: string) => void;
  addSocdPair: (key1Id: string, key2Id: string, mode: SocdPair['mode']) => void;
  removeSocdPair: (pairId: string) => void;
  updateSocdMode: (pairId: string, mode: SocdPair['mode']) => void;

  // Lighting Mutators
  updateLighting: (patch: Partial<LightingConfig>) => void;
  paintKeyColor: (keyId: string, hex: string | null) => void;
  clearPerKeyColors: () => void;

  // Macro Mutators
  updateMacroSlot: (slot: MacroSlot) => void;

  // Jev Advisor Applier
  applyJevSynthesizedConfig: (cfg: JevAdvisorDecisionResponse['synthesizedConfig']) => void;

  // Live Keyboard Input & Hardware Diagnostics
  pressedKeys: Set<string>;
  testedKeys: Set<string>;
  peakNkro: number;
  totalKeystrokes: number;
  chatterEvents: ChatterEvent[];
  chatterThresholdMs: number;
  setChatterThresholdMs: (ms: number) => void;
  resetDiagnostics: () => void;
  keyTravelMm: Record<string, number>;
  lastActiveKeyId: string;

  // Switch Sound Profile
  soundProfile: SwitchSoundProfile;
  setSoundProfile: (p: SwitchSoundProfile) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

const STORAGE_KEY_PROFILES = 'openkeyboard_profiles_v1';
const STORAGE_KEY_THEME = 'openkeyboard_theme_v1';

/**
 * Builds the UI's device identity from what the board actually reported.
 * Anything we could not confirm is left explicitly unknown rather than invented.
 */
function buildConnectedDeviceInfo(
  keyboard: DetectedKeyboard,
  probe: ViaProbeResult | null
): ConnectedDeviceInfo {
  const firmwareVersion =
    probe?.responded && probe.firmwareVersion !== null
      ? `0x${probe.firmwareVersion.toString(16).padStart(8, '0').toUpperCase()}`
      : probe?.responded
        ? `VIA ${probe.protocolMajor}.${probe.protocolMinor}`
        : 'Unreported';

  return {
    id: keyboard.id,
    name: keyboard.name,
    vendorName: keyboard.vendorName,
    vendorId: keyboard.vendorId,
    productId: keyboard.productId,
    connectionMode: 'webhid',
    transport: 'USB Wired (rate unknown)',
    firmwareVersion,
    pcbSensor: probe?.responded ? 'VIA/QMK raw HID (verified)' : 'Vendor HID (unverified)',
    switchType: keyboard.knownMagneticVendor
      ? 'Hall-effect / magnetic (vendor-listed)'
      : 'Unverified switch type',
    batteryPercent: null,
    charging: false,
    formFactor: keyboard.formFactor,
    supportsMagnetic: keyboard.knownMagneticVendor,
  };
}

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [webHidSupported, setWebHidSupported] = useState(false);
  const [device, setDevice] = useState<ConnectedDeviceInfo>(SIMULATOR_DEVICES[1]); // Default Keychron Q1 HE 75%
  const [packetLogs, setPacketLogs] = useState<HidPacketLog[]>([]);
  const [detectedKeyboards, setDetectedKeyboards] = useState<DetectedKeyboard[]>([]);
  const [detecting, setDetecting] = useState(false);

  const [profiles, setProfiles] = useState<KeyboardProfile[]>(PRESET_PROFILES);
  const [activeProfile, setActiveProfile] = useState<KeyboardProfile>(() => createDefaultProfile());
  const savedProfileSnapshotRef = useRef<KeyboardProfile>(createDefaultProfile());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
  const [activeLayer, setActiveLayer] = useState<LayerIndex>(0);
  const [soundProfile, setSoundProfile] = useState<SwitchSoundProfile>('lekker_he');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live hardware test & ADC travel state
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [peakNkro, setPeakNkro] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [chatterEvents, setChatterEvents] = useState<ChatterEvent[]>([]);
  const [chatterThresholdMs, setChatterThresholdMs] = useState(25);
  const [keyTravelMm, setKeyTravelMm] = useState<Record<string, number>>({});
  const [lastActiveKeyId, setLastActiveKeyId] = useState<string>('KeyW');

  const lastPressTimestampRef = useRef<Record<string, number>>({});
  const soundProfileRef = useRef<SwitchSoundProfile>(soundProfile);
  soundProfileRef.current = soundProfile;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Hydrate theme & profiles from localStorage
  useEffect(() => {
    setWebHidSupported(isWebHidSupported());

    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
      if (savedTheme && ['dark', 'light', 'ocean', 'nier', 'catppuccin'].includes(savedTheme)) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }

      const rawProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (rawProfiles) {
        const parsed = JSON.parse(rawProfiles) as KeyboardProfile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed);
          setActiveProfile(parsed[0]);
          savedProfileSnapshotRef.current = parsed[0];
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Seed initial startup packet log
    dispatchHidPacket(null, 'HANDSHAKE_READ_WORKSPACE', 0x01, [0x01, 0x75, 0x08]).then((pkt) => {
      setPacketLogs([pkt]);
    });
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    } catch {
      // Ignore
    }
  }, []);

  const appendPacket = useCallback(async (commandName: string, opcode: number, bytes: number[]) => {
    // Staging preview only: never push the synthetic framing to real hardware.
    const pkt = await dispatchHidPacket(null, commandName, opcode, bytes);
    setPacketLogs((prev) => [pkt, ...prev.slice(0, 49)]);
  }, []);

  /** Logs genuine VIA traffic observed on the wire. */
  const logBoardFrame = useCallback(
    (direction: 'OUT' | 'IN', command: number, bytes: Uint8Array | null) => {
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const hex = Array.from(bytes ?? [])
        .slice(0, 12)
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      setPacketLogs((prev) => [
        {
          id: `via-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp,
          direction,
          commandName: `VIA_0x${command.toString(16).padStart(2, '0').toUpperCase()}`,
          reportId: 0,
          hexBytes: hex || '—',
          status: 'confirmed',
        },
        ...prev.slice(0, 49),
      ]);
    },
    []
  );

  const clearPacketLogs = useCallback(() => {
    setPacketLogs([]);
  }, []);

  // Physical Keyboard Listener for Live ADC Travel, NKRO Matrix, Chatter Test, and Switch Acoustics
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack typing inside inputs/textareas for space/enter navigation, but still show visual press
      const code = e.code || 'KeyA';
      if (e.repeat) return;

      playSwitchSound(soundProfileRef.current, false);
      setLastActiveKeyId(code);

      const now = performance.now();
      const prevTime = lastPressTimestampRef.current[code];
      if (prevTime !== undefined) {
        const delta = Math.round(now - prevTime);
        if (delta < 350) {
          const timeStr = new Date().toTimeString().split(' ')[0];
          setChatterEvents((prev) => [
            {
              id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              keyId: code,
              deltaMs: delta,
              isBounceWarning: delta <= chatterThresholdMs,
              timestamp: timeStr,
            },
            ...prev.slice(0, 29),
          ]);
        }
      }
      lastPressTimestampRef.current[code] = now;

      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        setPeakNkro((oldPeak) => Math.max(oldPeak, next.size));
        return next;
      });

      setTestedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      setTotalKeystrokes((c) => c + 1);
      setKeyTravelMm((prev) => ({ ...prev, [code]: 3.85 }));
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code || 'KeyA';
      playSwitchSound(soundProfileRef.current, true);

      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });

      setKeyTravelMm((prev) => ({ ...prev, [code]: 0.0 }));
    };

    const onBlur = () => {
      setPressedKeys(new Set());
      setKeyTravelMm({});
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [chatterThresholdMs]);

  // Map of keyboardId -> raw HID interfaces, needed to open the config collection later.
  const hidInterfacesRef = useRef<Map<string, WebHidDevice[]>>(new Map());
  const viaTransportRef = useRef<ViaTransport | null>(null);

  const rememberInterfaces = useCallback((interfaces: WebHidDevice[]) => {
    const map = new Map<string, WebHidDevice[]>();
    for (const iface of interfaces) {
      const id = `webhid-${iface.vendorId}-${iface.productId}`;
      const list = map.get(id) ?? [];
      list.push(iface);
      map.set(id, list);
    }
    hidInterfacesRef.current = map;
    return map;
  }, []);

  const activateDetectedKeyboard = useCallback(
    async (keyboard: DetectedKeyboard) => {
      const interfaces = hidInterfacesRef.current.get(keyboard.id) ?? [];
      const configDevice = findConfigDevice(interfaces);

      if (!configDevice) {
        viaTransportRef.current?.dispose();
        viaTransportRef.current = null;
        setDevice(buildConnectedDeviceInfo(keyboard, null));
        showToast(
          `${keyboard.name} detected, but it exposes no writable vendor interface — Chrome blocks reports on its keyboard collection.`
        );
        return;
      }

      try {
        if (!configDevice.opened) await configDevice.open();
      } catch (err) {
        viaTransportRef.current?.dispose();
        viaTransportRef.current = null;
        showToast(err instanceof Error ? err.message : 'Could not open the HID interface.');
        return;
      }

      const probe = await probeViaBoard(configDevice);

      // A live VIA transport is the only thing allowed to write to the board.
      viaTransportRef.current?.dispose();
      viaTransportRef.current = probe.responded
        ? new ViaTransport(configDevice, { onCommand: logBoardFrame })
        : null;

      setDetectedKeyboards((prev) => prev.map((k) => (k.id === keyboard.id ? { ...k, probe } : k)));
      setDevice(buildConnectedDeviceInfo(keyboard, probe));
      setActiveProfile((prev) => ({ ...prev, formFactor: keyboard.formFactor }));

      await appendPacket('WEBHID_DEVICE_OPEN', 0x02, [
        (keyboard.vendorId >> 8) & 0xff,
        keyboard.vendorId & 0xff,
        (keyboard.productId >> 8) & 0xff,
        keyboard.productId & 0xff,
      ]);
      await appendPacket('VIA_GET_PROTOCOL_VERSION', 0x01, [0x01]);

      if (probe.responded) {
        const layers = probe.layerCount !== null ? `, ${probe.layerCount} layers` : '';
        showToast(
          `${keyboard.name} connected — VIA protocol ${probe.protocolMajor}.${probe.protocolMinor}${layers}`
        );
      } else {
        showToast(
          `${keyboard.name} connected, but it did not answer the VIA handshake. Treat its settings as unverified.`
        );
      }
    },
    [appendPacket, logBoardFrame, showToast]
  );

  const rescanKeyboards = useCallback(async () => {
    if (!checkWebHidSupport().supported) {
      setDetectedKeyboards([]);
      return;
    }
    setDetecting(true);
    try {
      const interfaces = await getGrantedInterfaces();
      rememberInterfaces(interfaces);
      setDetectedKeyboards(groupInterfaces(interfaces, true));
    } finally {
      setDetecting(false);
    }
  }, [rememberInterfaces]);

  const useDetectedKeyboard = useCallback(
    async (keyboardId: string) => {
      const found = detectedKeyboards.find((k) => k.id === keyboardId);
      if (found) await activateDetectedKeyboard(found);
    },
    [activateDetectedKeyboard, detectedKeyboards]
  );

  const connectWebHidDevice = useCallback(async () => {
    if (!checkWebHidSupport().supported) {
      showToast(checkWebHidSupport().reason ?? 'WebHID is unavailable in this browser.');
      return;
    }
    setDetecting(true);
    try {
      const interfaces = await requestInterfaces();
      if (interfaces.length === 0) return;
      rememberInterfaces(interfaces);
      const boards = groupInterfaces(interfaces, false);
      setDetectedKeyboards(boards);
      const target = boards.find((b) => b.isConfigurable) ?? boards[0];
      if (target) await activateDetectedKeyboard(target);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to open WebHID device');
    } finally {
      setDetecting(false);
    }
  }, [activateDetectedKeyboard, rememberInterfaces, showToast]);

  const bootScannedRef = useRef(false);

  // Auto-detect on load. getDevices() needs no prompt, but only returns boards
  // the user already granted this origin — WebHID has no enumerate-all API.
  useEffect(() => {
    if (bootScannedRef.current) return;
    bootScannedRef.current = true;

    const support = checkWebHidSupport();
    setWebHidSupported(support.supported);
    if (!support.supported) return;

    void (async () => {
      const interfaces = await getGrantedInterfaces();
      rememberInterfaces(interfaces);
      const boards = groupInterfaces(interfaces, true);
      setDetectedKeyboards(boards);
      const target = boards.find((b) => b.isConfigurable);
      if (target) await activateDetectedKeyboard(target);
    })();
  }, [activateDetectedKeyboard, rememberInterfaces]);

  // Hotplug — only fires for devices already granted to this origin.
  useEffect(() => {
    if (!webHidSupported) return;
    return subscribeToHidHotplug(() => {
      void rescanKeyboards();
    });
  }, [webHidSupported, rescanKeyboards]);

  // If the board we are writing to disappears, drop the transport so no later
  // write targets a device that is no longer there.
  useEffect(() => {
    if (device.connectionMode !== 'webhid' || detecting) return;
    if (detectedKeyboards.some((k) => k.id === device.id)) return;
    viaTransportRef.current?.dispose();
    viaTransportRef.current = null;
  }, [detectedKeyboards, device.id, device.connectionMode, detecting]);

  const selectSimulatorDevice = useCallback(
    (deviceId: string) => {
      const found = SIMULATOR_DEVICES.find((d) => d.id === deviceId);
      if (!found) return;
      viaTransportRef.current?.dispose();
      viaTransportRef.current = null;
      setDevice(found);
      setActiveProfile((prev) => ({ ...prev, formFactor: found.formFactor }));
      appendPacket('SIMULATOR_MOUNT_BOARD', 0x03, [
        (found.vendorId >> 8) & 0xff,
        found.vendorId & 0xff,
      ]);
      showToast(`Switched simulator to ${found.name} (${found.formFactor.toUpperCase()})`);
    },
    [appendPacket, showToast]
  );

  // Helper to stage changes to activeProfile
  const stageProfileUpdate = useCallback(
    (updater: (prev: KeyboardProfile) => KeyboardProfile, cmdName: string, opcode: number, payload: number[]) => {
      setActiveProfile((prev) => {
        const next = { ...updater(prev), updatedAt: new Date().toISOString() };
        return next;
      });
      setHasUnsavedChanges(true);
      appendPacket(cmdName, opcode, payload);
    },
    [appendPacket]
  );

  const commitPendingChangesToBoard = useCallback(async () => {
    savedProfileSnapshotRef.current = activeProfile;
    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === activeProfile.id);
      const updated = exists
        ? prev.map((p) => (p.id === activeProfile.id ? activeProfile : p))
        : [activeProfile, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    setHasUnsavedChanges(false);

    const transport = viaTransportRef.current;
    if (!transport) {
      showToast(
        `Saved "${activeProfile.name}" to browser storage only. Connect a writable VIA board to push settings to hardware.`
      );
      return;
    }

    try {
      const report = await pushLighting(transport, activeProfile.lighting);
      const summary = summariseLightingReport(report);
      showToast(`"${activeProfile.name}" — ${summary}`);
    } catch (err) {
      showToast(
        `Saved "${activeProfile.name}" locally, but the board write failed: ${
          err instanceof Error ? err.message : 'unknown error'
        }`
      );
    }
  }, [activeProfile, showToast]);

  const discardPendingChanges = useCallback(() => {
    setActiveProfile(savedProfileSnapshotRef.current);
    setHasUnsavedChanges(false);
    showToast('Discarded unsaved hardware changes');
  }, [showToast]);

  const selectProfile = useCallback(
    (profileId: string) => {
      const found = profiles.find((p) => p.id === profileId);
      if (!found) return;
      setActiveProfile(found);
      savedProfileSnapshotRef.current = found;
      setHasUnsavedChanges(false);
      appendPacket('LOAD_PROFILE_SLOT', 0x10, [0x01]);
      showToast(`Activated profile: ${found.name}`);
    },
    [profiles, appendPacket, showToast]
  );

  const createNewProfile = useCallback(
    (name: string) => {
      const fresh: KeyboardProfile = {
        ...createDefaultProfile(),
        id: `profile-${Date.now()}`,
        name: name.trim() || 'Custom Hardware Profile',
        formFactor: device.formFactor,
        updatedAt: new Date().toISOString(),
      };
      setProfiles((prev) => {
        const next = [fresh, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
        } catch {}
        return next;
      });
      setActiveProfile(fresh);
      savedProfileSnapshotRef.current = fresh;
      setHasUnsavedChanges(false);
      showToast(`Created profile "${fresh.name}"`);
    },
    [device.formFactor, showToast]
  );

  const duplicateActiveProfile = useCallback(() => {
    const copy: KeyboardProfile = {
      ...activeProfile,
      id: `profile-${Date.now()}`,
      name: `${activeProfile.name} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setProfiles((prev) => {
      const next = [copy, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
      } catch {}
      return next;
    });
    setActiveProfile(copy);
    savedProfileSnapshotRef.current = copy;
    showToast(`Duplicated "${copy.name}"`);
  }, [activeProfile, showToast]);

  const deleteProfile = useCallback(
    (profileId: string) => {
      if (profiles.length <= 1) {
        showToast('Cannot delete the last remaining profile');
        return;
      }
      const remaining = profiles.filter((p) => p.id !== profileId);
      setProfiles(remaining);
      try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(remaining));
      } catch {}
      if (activeProfile.id === profileId) {
        setActiveProfile(remaining[0]);
        savedProfileSnapshotRef.current = remaining[0];
      }
      showToast('Profile deleted');
    },
    [profiles, activeProfile.id, showToast]
  );

  const importProfileJson = useCallback(
    (jsonStr: string): boolean => {
      try {
        const parsed = JSON.parse(jsonStr) as KeyboardProfile;
        if (!parsed || !parsed.name || !parsed.globalTrigger) {
          showToast('Invalid OpenKeyboard profile JSON');
          return false;
        }
        const imported: KeyboardProfile = {
          ...parsed,
          id: `profile-${Date.now()}`,
          updatedAt: new Date().toISOString(),
        };
        setProfiles((prev) => {
          const next = [imported, ...prev];
          try {
            localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
          } catch {}
          return next;
        });
        setActiveProfile(imported);
        savedProfileSnapshotRef.current = imported;
        showToast(`Imported profile "${imported.name}"`);
        return true;
      } catch {
        showToast('Failed to parse profile JSON');
        return false;
      }
    },
    [showToast]
  );

  // Key Selection Helpers
  const toggleSelectKey = useCallback((keyId: string, multi = false) => {
    setLastActiveKeyId(keyId);
    setSelectedKeyIds((prev) => {
      if (!multi) {
        return [keyId];
      }
      return prev.includes(keyId) ? prev.filter((k) => k !== keyId) : [...prev, keyId];
    });
  }, []);

  const selectKeyGroup = useCallback(
    (group: 'all' | 'wasd' | 'alphas' | 'modifiers' | 'none') => {
      const allKeys = getAllKeysForLayout(activeProfile.formFactor);
      if (group === 'none') {
        setSelectedKeyIds([]);
      } else if (group === 'wasd') {
        setSelectedKeyIds(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
      } else if (group === 'all') {
        setSelectedKeyIds(allKeys.map((k) => k.id));
      } else if (group === 'alphas') {
        setSelectedKeyIds(allKeys.filter((k) => k.category === 'alpha').map((k) => k.id));
      } else if (group === 'modifiers') {
        setSelectedKeyIds(allKeys.filter((k) => k.category === 'modifier').map((k) => k.id));
      }
    },
    [activeProfile.formFactor]
  );

  // Hardware & Keymap Mutators
  const setFormFactor = useCallback(
    (ff: FormFactor) => {
      stageProfileUpdate((prev) => ({ ...prev, formFactor: ff }), 'SET_LAYOUT_GEOMETRY', 0x11, [ff.length]);
      setDevice((prev) => ({ ...prev, formFactor: ff }));
    },
    [stageProfileUpdate]
  );

  const setSystemMode = useCallback(
    (mode: 'win' | 'mac') => {
      stageProfileUpdate(
        (prev) => ({ ...prev, systemMode: mode }),
        'SET_OS_MODE',
        0x12,
        [mode === 'mac' ? 1 : 0]
      );
    },
    [stageProfileUpdate]
  );

  const setPollingRate = useCallback(
    (hz: 125 | 250 | 500 | 1000 | 2000 | 4000 | 8000) => {
      stageProfileUpdate(
        (prev) => ({ ...prev, pollingRateHz: hz }),
        'SET_POLLING_RATE_HZ',
        0x14,
        [(hz >> 8) & 0xff, hz & 0xff]
      );
    },
    [stageProfileUpdate]
  );

  const setTachyonMode = useCallback(
    (enabled: boolean) => {
      stageProfileUpdate(
        (prev) => ({ ...prev, tachyonLowLatency: enabled }),
        'SET_TACHYON_SCAN',
        0x15,
        [enabled ? 1 : 0]
      );
    },
    [stageProfileUpdate]
  );

  const setSleepMinutes = useCallback(
    (mins: number) => {
      stageProfileUpdate((prev) => ({ ...prev, sleepMinutes: mins }), 'SET_SLEEP_TIMEOUT', 0x16, [mins & 0xff]);
    },
    [stageProfileUpdate]
  );

  const assignKeycodeToSelected = useCallback(
    (codeOrLabel: string) => {
      if (selectedKeyIds.length === 0) {
        showToast('Select at least one key on the keyboard first');
        return;
      }
      stageProfileUpdate(
        (prev) => {
          const currentLayerMap = { ...(prev.layers[activeLayer] || {}) };
          for (const keyId of selectedKeyIds) {
            currentLayerMap[keyId] = codeOrLabel;
          }
          return {
            ...prev,
            layers: {
              ...prev.layers,
              [activeLayer]: currentLayerMap,
            },
          };
        },
        'WRITE_KEYMAP_MATRIX',
        0x20,
        [activeLayer, selectedKeyIds.length, codeOrLabel.charCodeAt(0) & 0xff]
      );
      showToast(`Assigned "${codeOrLabel}" to ${selectedKeyIds.length} key(s) on Layer ${activeLayer}`);
    },
    [selectedKeyIds, activeLayer, stageProfileUpdate, showToast]
  );

  const resetLayerMappings = useCallback(
    (layer: LayerIndex) => {
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          layers: {
            ...prev.layers,
            [layer]: {},
          },
        }),
        'RESET_KEYMAP_LAYER',
        0x21,
        [layer]
      );
      showToast(`Reset Layer ${layer} to default factory mappings`);
    },
    [stageProfileUpdate, showToast]
  );

  // Magnetic / Hall-Effect Trigger Helpers
  const getTriggerForKey = useCallback(
    (keyId: string): PerKeyTriggerConfig => {
      return activeProfile.perKeyTriggers[keyId] || activeProfile.globalTrigger;
    },
    [activeProfile.perKeyTriggers, activeProfile.globalTrigger]
  );

  const updateTriggerForSelected = useCallback(
    (patch: Partial<PerKeyTriggerConfig>) => {
      if (selectedKeyIds.length === 0) return;
      const actByte = patch.actuationMm ? Math.round(patch.actuationMm * 20) : 36;
      stageProfileUpdate(
        (prev) => {
          const nextMap = { ...prev.perKeyTriggers };
          for (const keyId of selectedKeyIds) {
            const current = nextMap[keyId] || prev.globalTrigger;
            nextMap[keyId] = { ...current, ...patch };
          }
          return { ...prev, perKeyTriggers: nextMap };
        },
        'SET_HE_KEY_TRIGGER',
        0x30,
        [selectedKeyIds.length, actByte, patch.rapidTrigger ? 1 : 0]
      );
    },
    [selectedKeyIds, stageProfileUpdate]
  );

  const updateGlobalTrigger = useCallback(
    (patch: Partial<PerKeyTriggerConfig>) => {
      const actByte = patch.actuationMm ? Math.round(patch.actuationMm * 20) : 36;
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          globalTrigger: { ...prev.globalTrigger, ...patch },
        }),
        'SET_HE_GLOBAL_TRIGGER',
        0x31,
        [actByte]
      );
    },
    [stageProfileUpdate]
  );

  const resetSelectedTriggersToGlobal = useCallback(() => {
    stageProfileUpdate(
      (prev) => {
        const nextMap = { ...prev.perKeyTriggers };
        for (const keyId of selectedKeyIds) {
          delete nextMap[keyId];
        }
        return { ...prev, perKeyTriggers: nextMap };
      },
      'CLEAR_PER_KEY_TRIGGER',
      0x32,
      [selectedKeyIds.length]
    );
    showToast(`Reset ${selectedKeyIds.length} key(s) to global actuation profile`);
  }, [selectedKeyIds, stageProfileUpdate, showToast]);

  const toggleSocdPair = useCallback(
    (pairId: string) => {
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          socdPairs: prev.socdPairs.map((p) => (p.id === pairId ? { ...p, enabled: !p.enabled } : p)),
        }),
        'TOGGLE_SOCD_SNAP_TAP',
        0x35,
        [0x01]
      );
    },
    [stageProfileUpdate]
  );

  const addSocdPair = useCallback(
    (key1Id: string, key2Id: string, mode: SocdPair['mode']) => {
      if (key1Id === key2Id) {
        showToast('SOCD requires two distinct keys');
        return;
      }
      const newPair: SocdPair = {
        id: `socd-${Date.now()}`,
        name: `Opposite Pair (${key1Id.replace('Key', '')} + ${key2Id.replace('Key', '')})`,
        key1Id,
        key2Id,
        mode,
        enabled: true,
      };
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          socdPairs: [...prev.socdPairs, newPair],
        }),
        'BIND_SOCD_PAIR',
        0x36,
        [key1Id.charCodeAt(0) & 0xff, key2Id.charCodeAt(0) & 0xff, 1]
      );
      showToast(`Created SOCD pair: ${key1Id} + ${key2Id}`);
    },
    [stageProfileUpdate, showToast]
  );

  const removeSocdPair = useCallback(
    (pairId: string) => {
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          socdPairs: prev.socdPairs.filter((p) => p.id !== pairId),
        }),
        'REMOVE_SOCD_PAIR',
        0x37,
        [0x00]
      );
    },
    [stageProfileUpdate]
  );

  const updateSocdMode = useCallback(
    (pairId: string, mode: SocdPair['mode']) => {
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          socdPairs: prev.socdPairs.map((p) => (p.id === pairId ? { ...p, mode } : p)),
        }),
        'SET_SOCD_RESOLUTION',
        0x38,
        [mode === 'last_priority' ? 1 : 2]
      );
    },
    [stageProfileUpdate]
  );

  // Lighting Mutators
  const updateLighting = useCallback(
    (patch: Partial<LightingConfig>) => {
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          lighting: { ...prev.lighting, ...patch },
        }),
        'SET_RGB_ENGINE',
        0x40,
        [patch.brightness ?? 85, patch.speed ?? 60]
      );
    },
    [stageProfileUpdate]
  );

  const paintKeyColor = useCallback(
    (keyId: string, hex: string | null) => {
      stageProfileUpdate(
        (prev) => {
          const nextColors = { ...prev.lighting.perKeyColors };
          if (hex === null) {
            delete nextColors[keyId];
          } else {
            nextColors[keyId] = hex;
          }
          return {
            ...prev,
            lighting: {
              ...prev.lighting,
              perKeyColors: nextColors,
            },
          };
        },
        'SET_LED_PER_KEY',
        0x41,
        [keyId.charCodeAt(0) & 0xff]
      );
    },
    [stageProfileUpdate]
  );

  const clearPerKeyColors = useCallback(() => {
    stageProfileUpdate(
      (prev) => ({
        ...prev,
        lighting: { ...prev.lighting, perKeyColors: {} },
      }),
      'CLEAR_CUSTOM_LED_MAP',
      0x42,
      [0x00]
    );
    showToast('Cleared custom per-key LED colors');
  }, [stageProfileUpdate, showToast]);

  // Macro Mutators
  const updateMacroSlot = useCallback(
    (slotObj: MacroSlot) => {
      stageProfileUpdate(
        (prev) => ({
          ...prev,
          macros: prev.macros.map((m) => (m.slot === slotObj.slot ? slotObj : m)),
        }),
        'WRITE_MACRO_SLOT',
        0x50,
        [slotObj.slot, slotObj.steps.length]
      );
      showToast(`Updated Macro Slot M${slotObj.slot}`);
    },
    [stageProfileUpdate, showToast]
  );

  // Apply Jev Synthesized Profile
  const applyJevSynthesizedConfig = useCallback(
    (cfg: JevAdvisorDecisionResponse['synthesizedConfig']) => {
      const wasdConfig: PerKeyTriggerConfig = {
        actuationMm: cfg.wasdActuationMm,
        rapidTrigger: cfg.rapidTrigger,
        rtPressMm: cfg.rtPressMm,
        rtReleaseMm: cfg.rtReleaseMm,
        continuousRt: cfg.rapidTrigger,
        topDeadzoneMm: 0.1,
        bottomDeadzoneMm: 0.15,
      };

      stageProfileUpdate(
        (prev) => ({
          ...prev,
          name: cfg.profileName,
          description: cfg.summary,
          pollingRateHz: cfg.pollingRateHz,
          tachyonLowLatency: cfg.tachyonLowLatency,
          globalTrigger: {
            ...prev.globalTrigger,
            actuationMm: cfg.generalActuationMm,
            rapidTrigger: cfg.rapidTrigger,
            rtPressMm: cfg.rtPressMm,
            rtReleaseMm: cfg.rtReleaseMm,
          },
          perKeyTriggers: {
            ...prev.perKeyTriggers,
            KeyW: { ...wasdConfig },
            KeyA: { ...wasdConfig },
            KeyS: { ...wasdConfig },
            KeyD: { ...wasdConfig },
          },
          socdPairs: [
            {
              id: 'socd-ad',
              name: 'Counter-Strafe Horizontal (A + D)',
              key1Id: 'KeyA',
              key2Id: 'KeyD',
              mode: cfg.socdMode,
              enabled: cfg.enableSocdAD,
            },
          ],
          lighting: {
            ...prev.lighting,
            effect: cfg.lightingEffect,
            primaryHex: cfg.primaryHex,
            secondaryHex: cfg.secondaryHex,
            perKeyColors: {
              KeyW: cfg.primaryHex,
              KeyA: cfg.primaryHex,
              KeyS: cfg.primaryHex,
              KeyD: cfg.primaryHex,
            },
          },
        }),
        'APPLY_JEV_CALIBRATION',
        0x99,
        [Math.round(cfg.wasdActuationMm * 20), cfg.rapidTrigger ? 1 : 0, cfg.enableSocdAD ? 1 : 0]
      );
      showToast(`Applied Jev Calibration: "${cfg.profileName}"`);
    },
    [stageProfileUpdate, showToast]
  );

  const resetDiagnostics = useCallback(() => {
    setTestedKeys(new Set());
    setPeakNkro(0);
    setTotalKeystrokes(0);
    setChatterEvents([]);
    lastPressTimestampRef.current = {};
    showToast('Reset hardware test counters & chatter telemetry');
  }, [showToast]);

  // A board is writable only when it is the active device AND it answered VIA.
  const writableBoardConnected =
    device.connectionMode === 'webhid' &&
    (detectedKeyboards.find((k) => k.id === device.id)?.probe?.responded ?? false);

  return (
    <KeyboardContext.Provider
      value={{
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        webHidSupported,
        device,
        connectWebHidDevice,
        selectSimulatorDevice,
        detectedKeyboards,
        detecting,
        rescanKeyboards,
        useDetectedKeyboard,
        writableBoardConnected,
        packetLogs,
        clearPacketLogs,
        profiles,
        activeProfile,
        hasUnsavedChanges,
        selectProfile,
        createNewProfile,
        duplicateActiveProfile,
        deleteProfile,
        importProfileJson,
        commitPendingChangesToBoard,
        discardPendingChanges,
        selectedKeyIds,
        setSelectedKeyIds,
        toggleSelectKey,
        selectKeyGroup,
        activeLayer,
        setActiveLayer,
        setFormFactor,
        setSystemMode,
        setPollingRate,
        setTachyonMode,
        setSleepMinutes,
        assignKeycodeToSelected,
        resetLayerMappings,
        getTriggerForKey,
        updateTriggerForSelected,
        updateGlobalTrigger,
        resetSelectedTriggersToGlobal,
        toggleSocdPair,
        addSocdPair,
        removeSocdPair,
        updateSocdMode,
        updateLighting,
        paintKeyColor,
        clearPerKeyColors,
        updateMacroSlot,
        applyJevSynthesizedConfig,
        pressedKeys,
        testedKeys,
        peakNkro,
        totalKeystrokes,
        chatterEvents,
        chatterThresholdMs,
        setChatterThresholdMs,
        resetDiagnostics,
        keyTravelMm,
        lastActiveKeyId,
        soundProfile,
        setSoundProfile,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard(): KeyboardContextValue {
  const ctx = useContext(KeyboardContext);
  if (!ctx) {
    throw new Error('useKeyboard must be used inside a KeyboardProvider');
  }
  return ctx;
}
