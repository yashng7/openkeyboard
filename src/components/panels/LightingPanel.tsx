'use client';

import React, { useState } from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { LightingEffectId } from '@/types/keyboard';
import { Eraser, Flame, Paintbrush, Palette, Sparkles, Sun, Trash2 } from 'lucide-react';

const LIGHTING_EFFECTS: { id: LightingEffectId; label: string; desc: string }[] = [
  { id: 'wave_spectrum', label: 'Wave Spectrum', desc: 'Smooth continuous RGB gradient wave across columns' },
  { id: 'reactive_ripple', label: 'Reactive Ripple', desc: 'Keys ignite on press and ripple outward' },
  { id: 'breathing_pulse', label: 'Dual Breathing Pulse', desc: 'Harmonic fade between Primary and Secondary hues' },
  { id: 'cyberpunk_matrix', label: 'Cyberpunk Matrix', desc: 'High-contrast neon digital rain scanlines' },
  { id: 'aurora_borealis', label: 'Aurora Borealis', desc: 'Northern lights emerald and violet shimmer' },
  { id: 'heatmap_typing', label: 'Typing Heatmap', desc: 'Shifts from cool blue to fiery crimson with key velocity' },
  { id: 'static_solid', label: 'Static Studio Solid', desc: 'Uniform color illumination across the entire matrix' },
  { id: 'custom_per_key', label: 'Per-Key Custom Canvas', desc: 'Displays your custom painted per-key LED layout' },
  { id: 'blackout', label: 'Stealth Blackout (0%)', desc: 'Turns off all switch and underglow LEDs for tournament focus' },
];

const SWATCH_COLORS = [
  '#5dde89',
  '#60a5fa',
  '#f472b6',
  '#c084fc',
  '#fbbf24',
  '#38bdf8',
  '#f43f5e',
  '#a3e635',
  '#fb923c',
  '#ffffff',
];

export function LightingPanel({
  onSelectBrush,
  activeBrushHex,
}: {
  onSelectBrush: (hex: string | null) => void;
  activeBrushHex: string | null;
}) {
  const {
    activeProfile,
    updateLighting,
    selectedKeyIds,
    paintKeyColor,
    clearPerKeyColors,
  } = useKeyboard();

  const { lighting } = activeProfile;
  const [customHex, setCustomHex] = useState('#5dde89');

  const applyColorToSelected = (hex: string) => {
    for (const kId of selectedKeyIds) {
      paintKeyColor(kId, hex);
    }
  };

  return (
    <div className="panel-grid">
      {/* Left Card: Effects Grid */}
      <section className="m3-card span-5">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Sparkles size={20} style={{ color: '#c084fc' }} />
              <h2>RGB Matrix Effect Engine</h2>
            </div>
            <p className="card-subtitle">
              Select a hardware lighting animation or switch to Per-Key Custom Canvas.
            </p>
          </div>
        </div>

        <div className="effects-grid">
          {LIGHTING_EFFECTS.map((ef) => (
            <button
              key={ef.id}
              type="button"
              className={`effect-card-btn ${lighting.effect === ef.id ? 'active' : ''}`}
              onClick={() => updateLighting({ effect: ef.id })}
            >
              <div className="effect-card-title">
                <Flame size={14} style={{ color: lighting.effect === ef.id ? '#5dde89' : '#c084fc' }} />
                <span>{ef.label}</span>
              </div>
              <p className="effect-card-desc">{ef.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Middle Card: Brightness, Speed & Underglow */}
      <section className="m3-card span-4">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Sun size={20} style={{ color: '#fbbf24' }} />
              <h2>Luminance, Speed & Underglow</h2>
            </div>
            <p className="card-subtitle">Hardware PWM dimming and dual-zone colour palette.</p>
          </div>
        </div>

        <div className="slider-control-row">
          <div className="slider-header">
            <span>Matrix Brightness (PWM)</span>
            <strong>{lighting.brightness}%</strong>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={lighting.brightness}
            onChange={(e) => updateLighting({ brightness: Number(e.target.value) })}
            className="m3-slider"
          />
        </div>

        <div className="slider-control-row">
          <div className="slider-header">
            <span>Effect Animation Speed</span>
            <strong>{lighting.speed}%</strong>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={lighting.speed}
            onChange={(e) => updateLighting({ speed: Number(e.target.value) })}
            className="m3-slider"
          />
        </div>

        <div className="color-pickers-row">
          <div className="color-picker-box">
            <label>Primary Hue</label>
            <div className="color-input-line">
              <input
                type="color"
                value={lighting.primaryHex}
                onChange={(e) => updateLighting({ primaryHex: e.target.value })}
              />
              <code>{lighting.primaryHex}</code>
            </div>
          </div>

          <div className="color-picker-box">
            <label>Secondary Hue</label>
            <div className="color-input-line">
              <input
                type="color"
                value={lighting.secondaryHex}
                onChange={(e) => updateLighting({ secondaryHex: e.target.value })}
              />
              <code>{lighting.secondaryHex}</code>
            </div>
          </div>
        </div>

        <div className="toggle-feature-row">
          <div>
            <div className="toggle-feature-title">
              <span>Chassis Underglow / Diffuser Halo</span>
            </div>
            <p className="toggle-feature-desc">
              Syncs side and bottom RGB diffuser strips around the CNC aluminum frame.
            </p>
          </div>
          <button
            type="button"
            className={`switch-toggle ${lighting.underglowEnabled ? 'on' : ''}`}
            onClick={() => updateLighting({ underglowEnabled: !lighting.underglowEnabled })}
          >
            <span className="switch-thumb" />
          </button>
        </div>
      </section>

      {/* Right Card: Per-Key RGB Painter */}
      <section className="m3-card span-3">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Paintbrush size={20} style={{ color: '#5dde89' }} />
              <h2>Per-Key LED Painter</h2>
            </div>
            <p className="card-subtitle">
              Pick a swatch and click keys on the keyboard above, or fill all selected keys.
            </p>
          </div>
        </div>

        <div className="swatch-grid">
          {SWATCH_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              className={`swatch-circle ${activeBrushHex === hex ? 'active' : ''}`}
              style={{ backgroundColor: hex }}
              onClick={() => {
                setCustomHex(hex);
                onSelectBrush(hex);
              }}
              title={`Select brush ${hex}`}
            />
          ))}
        </div>

        <div className="painter-actions-stack">
          <button
            type="button"
            className="btn-primary full-width"
            onClick={() => applyColorToSelected(customHex)}
          >
            <Palette size={15} />
            <span>Fill {selectedKeyIds.length} Selected Key(s)</span>
          </button>

          <button
            type="button"
            className={`btn-secondary full-width ${activeBrushHex === null ? 'active' : ''}`}
            onClick={() => onSelectBrush(null)}
          >
            <Eraser size={15} />
            <span>Selection Mode (Disable Brush)</span>
          </button>

          <button
            type="button"
            className="btn-ghost-sm full-width"
            onClick={clearPerKeyColors}
          >
            <Trash2 size={14} />
            <span>Clear All Custom Per-Key LEDs</span>
          </button>
        </div>
      </section>
    </div>
  );
}
