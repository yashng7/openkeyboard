'use client';

import React, { useState } from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { ThemeMode } from '@/types/keyboard';
import {
  Check,
  Copy,
  Download,
  FolderKanban,
  Palette,
  Plus,
  Terminal,
  Trash2,
  Upload,
} from 'lucide-react';

const THEME_CARDS: { id: ThemeMode; name: string; desc: string; previewBg: string; accent: string }[] = [
  {
    id: 'dark',
    name: 'OpenMouse Dark (Default M3)',
    desc: 'Deep carbon obsidian surfaces with emerald #5dde89 & sky highlights.',
    previewBg: '#12151a',
    accent: '#5dde89',
  },
  {
    id: 'light',
    name: 'Daylight Alabaster (Light M3)',
    desc: 'High-contrast crisp studio paper surfaces for bright environments.',
    previewBg: '#f4f6fa',
    accent: '#0d9488',
  },
  {
    id: 'ocean',
    name: 'Deep Abyssal Ocean',
    desc: 'Submarine navy surfaces with bioluminescent cyan & aqua accents.',
    previewBg: '#0b192c',
    accent: '#38bdf8',
  },
  {
    id: 'nier',
    name: 'YoRHa Bunker (NieR Automata)',
    desc: 'Warm tactical sand & olive military terminal palette.',
    previewBg: '#2b2923',
    accent: '#dad4bb',
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    desc: 'Soothing pastel lavender, mauve, and rosewater dark theme.',
    previewBg: '#1e1e2e',
    accent: '#cba6f7',
  },
];

export function ProfilesSettingsPanel() {
  const {
    profiles,
    activeProfile,
    selectProfile,
    createNewProfile,
    duplicateActiveProfile,
    deleteProfile,
    importProfileJson,
    theme,
    setTheme,
    device,
    showToast,
  } = useKeyboard();

  const [newProfileName, setNewProfileName] = useState('');
  const [importText, setImportText] = useState('');

  const udevRuleText = `# /etc/udev/rules.d/70-openkeyboard.rules
# Grants Chromium WebHID (hidraw) permissions without root
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="${device.vendorId.toString(16).padStart(4, '0')}", ATTRS{idProduct}=="${device.productId.toString(16).padStart(4, '0')}", TAG+="uaccess"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="31e3", TAG+="uaccess"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="3434", TAG+="uaccess"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="3554", TAG+="uaccess"`;

  const handleExportJson = () => {
    const dataStr = JSON.stringify(activeProfile, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProfile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.openkeyboard.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported profile JSON file');
  };

  const handleCopyUdev = () => {
    navigator.clipboard.writeText(udevRuleText);
    showToast('Copied Linux WebHID udev rules to clipboard');
  };

  return (
    <div className="panel-grid">
      {/* Left Card: Profile Library & JSON Import/Export */}
      <section className="m3-card span-6">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <FolderKanban size={20} style={{ color: '#5dde89' }} />
              <h2>Hardware Profile Library</h2>
            </div>
            <p className="card-subtitle">
              Switch between saved profiles, duplicate configurations, or share `.openkeyboard.json` files.
            </p>
          </div>
          <div className="header-actions-row">
            <button type="button" className="btn-secondary" onClick={duplicateActiveProfile}>
              <Copy size={14} /> Duplicate
            </button>
            <button type="button" className="btn-primary" onClick={handleExportJson}>
              <Download size={14} /> Export JSON
            </button>
          </div>
        </div>

        <div className="profile-list-stack">
          {profiles.map((prof) => {
            const isActive = prof.id === activeProfile.id;
            return (
              <div key={prof.id} className={`profile-row-card ${isActive ? 'active' : ''}`}>
                <div className="profile-row-info" onClick={() => selectProfile(prof.id)}>
                  <div className="profile-row-top">
                    <strong>{prof.name}</strong>
                    <span className="pill-badge badge-neutral">{prof.genreTag}</span>
                    <span className="pill-badge badge-sim">{prof.pollingRateHz}Hz</span>
                  </div>
                  <p className="profile-row-desc">{prof.description}</p>
                </div>
                <div className="profile-row-actions">
                  <button
                    type="button"
                    className={`btn-secondary ${isActive ? 'active' : ''}`}
                    onClick={() => selectProfile(prof.id)}
                  >
                    {isActive ? <Check size={14} /> : 'Load'}
                  </button>
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => deleteProfile(prof.id)}
                    title="Delete profile"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Profile */}
        <div className="socd-add-bar" style={{ marginTop: '0.85rem' }}>
          <input
            type="text"
            placeholder="New profile name (e.g., Apex Legends Superglide)..."
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="m3-input"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              createNewProfile(newProfileName);
              setNewProfileName('');
            }}
          >
            <Plus size={15} /> Create
          </button>
        </div>

        {/* Import JSON */}
        <div className="control-block" style={{ marginTop: '0.85rem' }}>
          <label className="control-label">Import Profile JSON</label>
          <div className="socd-add-bar">
            <input
              type="text"
              placeholder="Paste .openkeyboard.json content here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="m3-input"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (importProfileJson(importText)) setImportText('');
              }}
            >
              <Upload size={14} /> Import
            </button>
          </div>
        </div>
      </section>

      {/* Right Card: OpenMouse M3 Themes & Linux WebHID udev Rules */}
      <section className="m3-card span-6">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Palette size={20} style={{ color: '#c084fc' }} />
              <h2>Material Design 3 Theme Studio</h2>
            </div>
            <p className="card-subtitle">
              Matches the OpenMouse-Project 5-theme M3 surface token system.
            </p>
          </div>
        </div>

        <div className="theme-gallery-grid">
          {THEME_CARDS.map((tc) => (
            <button
              key={tc.id}
              type="button"
              className={`theme-gallery-card ${theme === tc.id ? 'active' : ''}`}
              onClick={() => setTheme(tc.id)}
            >
              <div className="theme-swatch-bar" style={{ backgroundColor: tc.previewBg }}>
                <span className="theme-swatch-dot" style={{ backgroundColor: tc.accent }} />
                <span className="theme-swatch-name">{tc.name}</span>
              </div>
              <p className="theme-card-desc">{tc.desc}</p>
            </button>
          ))}
        </div>

        <div className="udev-generator-box">
          <div className="udev-header">
            <div className="card-title-row">
              <Terminal size={16} style={{ color: '#38bdf8' }} />
              <h3>Linux WebHID `/dev/hidraw*` Permissions</h3>
            </div>
            <button type="button" className="btn-ghost-sm" onClick={handleCopyUdev}>
              <Copy size={13} /> Copy Rules
            </button>
          </div>
          <pre className="udev-code">{udevRuleText}</pre>
        </div>
      </section>
    </div>
  );
}
