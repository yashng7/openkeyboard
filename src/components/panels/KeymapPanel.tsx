'use client';

import React, { useEffect, useState } from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { KEYCODE_PALETTE } from '@/lib/keyboard-data';
import { LayerIndex } from '@/types/keyboard';
import { Ear, Keyboard, Layers, RotateCcw, Search } from 'lucide-react';

const LAYER_DESCRIPTIONS: Record<LayerIndex, { title: string; desc: string }> = {
  0: {
    title: 'Layer 0 — Base Default Layer',
    desc: 'Primary layout active during standard typing and gaming.',
  },
  1: {
    title: 'Layer 1 — Primary Fn Layer (MO(1))',
    desc: 'Activated while holding the Fn key. Ideal for F-keys, arrows (IJKL / HJKL), and media controls.',
  },
  2: {
    title: 'Layer 2 — Secondary Macro & Utility Layer (MO(2))',
    desc: 'Dedicated layer for hardware macros M1–M8, RGB toggles, and streaming shortcuts.',
  },
  3: {
    title: 'Layer 3 — Custom Tournament / Stealth Layer (TG(3))',
    desc: 'Toggleable hardware layer for disabling Windows key or custom game binds.',
  },
};

export function KeymapPanel() {
  const {
    activeLayer,
    setActiveLayer,
    selectedKeyIds,
    assignKeycodeToSelected,
    resetLayerMappings,
    activeProfile,
  } = useKeyboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [listeningForKey, setListeningForKey] = useState(false);

  useEffect(() => {
    if (!listeningForKey) return;
    const handleCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const label = e.key.length === 1 ? e.key.toUpperCase() : e.code;
      assignKeycodeToSelected(label);
      setListeningForKey(false);
    };
    window.addEventListener('keydown', handleCapture, { capture: true });
    return () => window.removeEventListener('keydown', handleCapture, { capture: true });
  }, [listeningForKey, assignKeycodeToSelected]);

  const currentLayerRemaps = Object.entries(activeProfile.layers[activeLayer] || {});

  return (
    <div className="panel-grid">
      {/* Left Card: Layer Controls & Active Selection Summary */}
      <section className="m3-card span-4">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Layers size={20} style={{ color: '#60a5fa' }} />
              <h2>Layers & Key Capture</h2>
            </div>
            <p className="card-subtitle">{LAYER_DESCRIPTIONS[activeLayer].desc}</p>
          </div>
        </div>

        <div className="layer-cards-stack">
          {([0, 1, 2, 3] as LayerIndex[]).map((idx) => {
            const count = Object.keys(activeProfile.layers[idx] || {}).length;
            return (
              <button
                key={idx}
                type="button"
                className={`layer-select-card ${activeLayer === idx ? 'active' : ''}`}
                onClick={() => setActiveLayer(idx)}
              >
                <div className="layer-select-top">
                  <span className="layer-badge">LAYER {idx}</span>
                  <span className="layer-count">{count} custom keys</span>
                </div>
                <div className="layer-select-title">{LAYER_DESCRIPTIONS[idx].title}</div>
              </button>
            );
          })}
        </div>

        <div className="capture-box">
          <div className="capture-box-header">
            <span>Selected Keys ({selectedKeyIds.length})</span>
            <button
              type="button"
              className="btn-ghost-sm"
              onClick={() => resetLayerMappings(activeLayer)}
            >
              <RotateCcw size={13} /> Reset Layer {activeLayer}
            </button>
          </div>
          <div className="selected-keys-chips">
            {selectedKeyIds.length === 0 ? (
              <span className="muted-note">Click any key on the keyboard above to select it.</span>
            ) : (
              selectedKeyIds.slice(0, 12).map((k) => (
                <span key={k} className="key-chip">
                  {k}
                </span>
              ))
            )}
            {selectedKeyIds.length > 12 && (
              <span className="key-chip">+{selectedKeyIds.length - 12} more</span>
            )}
          </div>

          <button
            type="button"
            className={`btn-capture ${listeningForKey ? 'listening' : ''}`}
            onClick={() => setListeningForKey((v) => !v)}
          >
            <Ear size={16} />
            <span>
              {listeningForKey
                ? 'Press any physical key now to bind...'
                : 'Tap Physical Key to Assign'}
            </span>
          </button>
        </div>

        {currentLayerRemaps.length > 0 && (
          <div className="remapped-summary-list">
            <span className="section-micro-label">Active Layer {activeLayer} Overrides</span>
            <div className="remap-pills">
              {currentLayerRemaps.map(([kId, val]) => (
                <div key={kId} className="remap-pill-item">
                  <span>{kId}</span>
                  <span>→</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Right Card: Keycode Assignment Palette */}
      <section className="m3-card span-8">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Keyboard size={20} style={{ color: '#5dde89' }} />
              <h2>Keycode Assignment Palette</h2>
            </div>
            <p className="card-subtitle">
              Click any keycode below to bind it to the {selectedKeyIds.length} selected key(s) on{' '}
              <strong>Layer {activeLayer}</strong>.
            </p>
          </div>

          <div className="search-input-wrap">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search keycodes, Hyper, MO(1), Media, Macros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="m3-search-input"
            />
          </div>
        </div>

        <div className="keycode-categories-scroll">
          {KEYCODE_PALETTE.map((group) => {
            const filtered = group.items.filter(
              (item) =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            if (filtered.length === 0) return null;

            return (
              <div key={group.category} className="keycode-group">
                <h3 className="keycode-group-title">{group.category}</h3>
                <div className="keycode-grid">
                  {filtered.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className="keycode-tile"
                      onClick={() => assignKeycodeToSelected(item.label)}
                      title={item.description || `Bind ${item.label} (${item.code})`}
                    >
                      <span className="keycode-tile-label">{item.label}</span>
                      <span className="keycode-tile-code">{item.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
