'use client';

import React from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FolderKanban,
  Keyboard,
  Magnet,
  Palette,
  Sparkles,
  Terminal,
  Volume2,
  Wifi,
} from 'lucide-react';
import { useKeyboard } from '@/context/KeyboardContext';
import { SwitchSoundProfile, ThemeMode, WorkspaceTab } from '@/types/keyboard';

interface NavItemConfig {
  id: WorkspaceTab;
  label: string;
  sublabel: string;
  color: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'overview',
    label: 'Connect & Hub',
    sublabel: 'WebHID, Polling & Board Info',
    color: '#5dde89',
    icon: Cpu,
  },
  {
    id: 'keymap',
    label: 'Keymap & Layers',
    sublabel: 'Remap Keys, Fn1–Fn3 & Hyper',
    color: '#60a5fa',
    icon: Keyboard,
  },
  {
    id: 'magnetic',
    label: 'Magnetic & SOCD',
    sublabel: 'Rapid Trigger, 0.1mm & Snap Tap',
    color: '#f472b6',
    icon: Magnet,
    badge: 'HE',
  },
  {
    id: 'lighting',
    label: 'RGB Studio',
    sublabel: 'Per-Key Painter & Effects',
    color: '#c084fc',
    icon: Palette,
  },
  {
    id: 'macros',
    label: 'Macro Studio',
    sublabel: 'Record & Bind M1–M8 Sequences',
    color: '#fbbf24',
    icon: Terminal,
  },
  {
    id: 'hardware-test',
    label: 'Hardware Test',
    sublabel: 'NKRO Matrix & Chatter Check',
    color: '#38bdf8',
    icon: Activity,
  },
  {
    id: 'jev-advisor',
    label: 'Jev AI Advisor',
    sublabel: 'TypeSafe Jev-1.13 Auto-Tuner',
    color: '#a78bfa',
    icon: Sparkles,
    badge: 'JEV',
  },
  {
    id: 'profiles',
    label: 'Profiles & Themes',
    sublabel: 'Import/Export, udev & M3 UI',
    color: '#94a3b8',
    icon: FolderKanban,
  },
];

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'nier', label: 'NieR' },
  { id: 'catppuccin', label: 'Mocha' },
];

const SOUND_PROFILES: { id: SwitchSoundProfile; label: string }[] = [
  { id: 'lekker_he', label: 'Lekker HE (Linear)' },
  { id: 'oil_king_thock', label: 'Oil King (Deep Thock)' },
  { id: 'holy_panda', label: 'Holy Panda (Tactile)' },
  { id: 'box_jade_clicky', label: 'Box Jade (Clicky)' },
  { id: 'off', label: 'Muted (Silent)' },
];

export function AppSidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    device,
    activeProfile,
    theme,
    setTheme,
    soundProfile,
    setSoundProfile,
  } = useKeyboard();

  return (
    <aside className={`app-sidebar ${sidebarCollapsed ? 'app-sidebar-collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-badge">
          <Keyboard size={20} style={{ color: '#5dde89' }} />
        </div>
        {!sidebarCollapsed && (
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-name">OpenKeyboard</span>
              <span className="brand-version">v1.0</span>
            </div>
            <span className="brand-subtitle">WebHID Control Panel</span>
          </div>
        )}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setSidebarCollapsed((c) => !c)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Connected Hardware Pill */}
      {!sidebarCollapsed && (
        <div className="sidebar-device-card">
          <div className="sidebar-device-top">
            <span
              className={`status-dot ${
                device.connectionMode === 'webhid' ? 'status-dot-live' : 'status-dot-sim'
              }`}
            />
            <span className="sidebar-device-mode">
              {device.connectionMode === 'webhid' ? 'WebHID Live' : 'Virtual Simulator'}
            </span>
            <span className="sidebar-polling-badge">{activeProfile.pollingRateHz}Hz</span>
          </div>
          <div className="sidebar-device-name">{device.name}</div>
          <div className="sidebar-device-meta">
            <span>{activeProfile.formFactor.toUpperCase()}</span>
            <span>•</span>
            <span>{activeProfile.systemMode === 'mac' ? 'macOS' : 'Windows'}</span>
            {device.batteryPercent !== null && (
              <>
                <span>•</span>
                <span>{device.batteryPercent}% Bat</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation Rail */}
      <nav className="app-sidebar-nav" aria-label="Control panel sections">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`app-sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? `${item.label} — ${item.sublabel}` : undefined}
            >
              <Icon className="app-sidebar-nav-icon" size={20} style={{ color: item.color }} />
              {!sidebarCollapsed && (
                <div className="nav-item-text">
                  <span className="nav-item-label">{item.label}</span>
                  <span className="nav-item-sub">{item.sublabel}</span>
                </div>
              )}
              {!sidebarCollapsed && item.badge && (
                <span className="nav-item-badge" style={{ borderColor: item.color, color: item.color }}>
                  {item.badge}
                </span>
              )}
              {!sidebarCollapsed && <ChevronRight className="app-sidebar-nav-arrow" size={16} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls: Switch Sound & Quick Theme */}
      {!sidebarCollapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-control-row">
            <label className="sidebar-control-label">
              <Volume2 size={14} style={{ color: '#5dde89' }} />
              <span>Switch Acoustics</span>
            </label>
            <select
              className="sidebar-select"
              value={soundProfile}
              onChange={(e) => setSoundProfile(e.target.value as SwitchSoundProfile)}
            >
              {SOUND_PROFILES.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-theme-strip" role="group" aria-label="Color Theme">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-chip ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="sidebar-credit">
            <Wifi size={12} style={{ color: '#5dde89' }} />
            <span>Zero-Driver WebHID • Powered by Jev</span>
          </div>
        </div>
      )}
    </aside>
  );
}
