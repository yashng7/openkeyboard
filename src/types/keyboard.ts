export type ThemeMode = 'dark' | 'light' | 'ocean' | 'nier' | 'catppuccin';

export type WorkspaceTab =
  | 'overview'
  | 'keymap'
  | 'magnetic'
  | 'lighting'
  | 'macros'
  | 'hardware-test'
  | 'jev-advisor'
  | 'profiles';

export type FormFactor = '60%' | '65%' | '75%' | 'tkl' | '100%';

export type LayerIndex = 0 | 1 | 2 | 3;

export type SwitchSoundProfile =
  | 'lekker_he'
  | 'oil_king_thock'
  | 'holy_panda'
  | 'box_jade_clicky'
  | 'off';

export interface KeyCapDefinition {
  id: string;
  row: number;
  col: number;
  defaultLabel: string;
  defaultCode: string; // e.g. "KeyA", "Space", "Escape"
  width: number; // in standard key units (1u = 1)
  gapBefore?: number; // horizontal spacer in key units before this key
  category: 'alpha' | 'modifier' | 'function' | 'navigation' | 'numpad' | 'system';
}

export interface PerKeyTriggerConfig {
  actuationMm: number; // 0.1 to 4.0 mm
  rapidTrigger: boolean;
  rtPressMm: number; // 0.05 to 2.0 mm
  rtReleaseMm: number; // 0.05 to 2.0 mm
  continuousRt: boolean; // resets only at full top-out
  topDeadzoneMm: number; // 0.0 to 1.0 mm
  bottomDeadzoneMm: number; // 0.0 to 1.0 mm
}

export type SocdResolutionMode =
  | 'last_priority' // Snap Tap / Rappy Snappy: latest pressed key wins immediately
  | 'neutral' // Both pressed = neither active
  | 'key1_priority' // Key A always overrides Key B
  | 'key2_priority'; // Key B always overrides Key A

export interface SocdPair {
  id: string;
  name: string;
  key1Id: string;
  key2Id: string;
  mode: SocdResolutionMode;
  enabled: boolean;
}

export interface DksBinding {
  id: string;
  keyId: string;
  enabled: boolean;
  stage1Down15mm: string; // e.g., "KeyW" (Walk)
  stage2Bottom36mm: string; // e.g., "ShiftLeft+KeyW" (Sprint)
  stage3Up36mm: string;
  stage4Release15mm: string;
}

export type LightingEffectId =
  | 'wave_spectrum'
  | 'reactive_ripple'
  | 'breathing_pulse'
  | 'cyberpunk_matrix'
  | 'heatmap_typing'
  | 'aurora_borealis'
  | 'static_solid'
  | 'custom_per_key'
  | 'blackout';

export interface LightingConfig {
  effect: LightingEffectId;
  brightness: number; // 0 to 100
  speed: number; // 1 to 100
  direction: 'left_to_right' | 'right_to_left' | 'center_out' | 'top_down';
  primaryHex: string;
  secondaryHex: string;
  underglowEnabled: boolean;
  underglowHex: string;
  perKeyColors: Record<string, string>; // keyId -> hex color
}

export interface MacroStep {
  id: string;
  action: 'down' | 'up' | 'tap' | 'delay';
  keyCode?: string;
  keyLabel?: string;
  delayMs: number;
}

export type MacroTriggerMode = 'once' | 'hold_loop' | 'toggle_loop' | 'repeat_n';

export interface MacroSlot {
  slot: number; // 1 to 8
  name: string;
  mode: MacroTriggerMode;
  repeatCount: number;
  steps: MacroStep[];
  assignedKeyId?: string;
}

export interface HidPacketLog {
  id: string;
  timestamp: string;
  direction: 'OUT' | 'IN';
  commandName: string;
  reportId: number;
  hexBytes: string;
  status: 'confirmed' | 'simulated' | 'error';
}

export interface ConnectedDeviceInfo {
  id: string;
  name: string;
  vendorName: string;
  vendorId: number;
  productId: number;
  connectionMode: 'webhid' | 'simulator';
  transport: 'USB-C Wired (8K)' | '2.4GHz Dongle (4K)' | 'Bluetooth 5.3';
  firmwareVersion: string;
  pcbSensor: string;
  switchType: string;
  batteryPercent: number | null;
  charging: boolean;
  formFactor: FormFactor;
  supportsMagnetic: boolean;
}

export interface KeyboardProfile {
  id: string;
  name: string;
  description: string;
  genreTag: 'FPS' | 'MOBA' | 'Rhythm' | 'Coding' | 'General';
  updatedAt: string;
  formFactor: FormFactor;
  systemMode: 'win' | 'mac';
  pollingRateHz: 125 | 250 | 500 | 1000 | 2000 | 4000 | 8000;
  tachyonLowLatency: boolean;
  sleepMinutes: number;
  nkroEnabled: boolean;
  debounceMs: number;
  globalTrigger: PerKeyTriggerConfig;
  perKeyTriggers: Record<string, PerKeyTriggerConfig>;
  socdPairs: SocdPair[];
  dksBindings: DksBinding[];
  layers: Record<LayerIndex, Record<string, string>>; // layer -> (keyId -> mapped label/code)
  lighting: LightingConfig;
  macros: MacroSlot[];
}

export interface JevAdvisorDecisionResponse {
  success: boolean;
  latencyMs: number;
  model: string;
  usedLiveJev: boolean;
  decisions: {
    recommendedGenre: {
      choice: 'fps_tac' | 'rhythm_speed' | 'moba_mmo' | 'coding_ergo' | 'hybrid_daily';
      confidence: number;
      probabilities: Record<string, number>;
    };
    actuationAggressivenessScore: {
      score: number; // 0 to 3
      confidence: number;
      label: string;
    };
    enableSocdSnapTap: {
      noul: number; // 0.0 to 1.0
    };
    enableRapidTrigger: {
      noul: number; // 0.0 to 1.0
    };
  };
  synthesizedConfig: {
    profileName: string;
    summary: string;
    wasdActuationMm: number;
    generalActuationMm: number;
    rapidTrigger: boolean;
    rtPressMm: number;
    rtReleaseMm: number;
    enableSocdAD: boolean;
    socdMode: SocdResolutionMode;
    pollingRateHz: 125 | 250 | 500 | 1000 | 2000 | 4000 | 8000;
    tachyonLowLatency: boolean;
    lightingEffect: LightingEffectId;
    primaryHex: string;
    secondaryHex: string;
  };
}
