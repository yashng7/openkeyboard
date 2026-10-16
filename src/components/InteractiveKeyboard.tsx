'use client';

import React, { useMemo } from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { getLayoutRows } from '@/lib/keyboard-data';
import { FormFactor, KeyCapDefinition, LayerIndex } from '@/types/keyboard';
import { Layers, Sparkles, Zap } from 'lucide-react';

interface InteractiveKeyboardProps {
  mode?: 'inspect' | 'remap' | 'magnetic' | 'paint' | 'test';
  paintBrushHex?: string | null;
}

const FORM_FACTORS: { id: FormFactor; label: string }[] = [
  { id: '60%', label: '60% Compact' },
  { id: '65%', label: '65% Arrows' },
  { id: '75%', label: '75% Exploded' },
  { id: 'tkl', label: 'TKL (80%)' },
  { id: '100%', label: 'Full-Size (100%)' },
];

const LAYERS: { id: LayerIndex; label: string }[] = [
  { id: 0, label: 'Layer 0 (Base)' },
  { id: 1, label: 'Layer 1 (Fn1)' },
  { id: 2, label: 'Layer 2 (Fn2)' },
  { id: 3, label: 'Layer 3 (Fn3)' },
];

export function InteractiveKeyboard({
  mode = 'inspect',
  paintBrushHex = null,
}: InteractiveKeyboardProps) {
  const {
    activeProfile,
    selectedKeyIds,
    toggleSelectKey,
    selectKeyGroup,
    activeLayer,
    setActiveLayer,
    setFormFactor,
    getTriggerForKey,
    pressedKeys,
    testedKeys,
    paintKeyColor,
    keyTravelMm,
  } = useKeyboard();

  const rows = useMemo(() => getLayoutRows(activeProfile.formFactor), [activeProfile.formFactor]);

  const socdKeySet = useMemo(() => {
    const s = new Set<string>();
    for (const pair of activeProfile.socdPairs) {
      if (pair.enabled) {
        s.add(pair.key1Id);
        s.add(pair.key2Id);
      }
    }
    return s;
  }, [activeProfile.socdPairs]);

  const handleKeyClick = (e: React.MouseEvent, keyDef: KeyCapDefinition) => {
    if (mode === 'paint' && paintBrushHex !== undefined) {
      paintKeyColor(keyDef.id, paintBrushHex);
      return;
    }
    const multi = e.shiftKey || e.ctrlKey || e.metaKey;
    toggleSelectKey(keyDef.id, multi);
  };

  const lighting = activeProfile.lighting;
  const underglowStyle: React.CSSProperties =
    lighting.underglowEnabled && lighting.effect !== 'blackout'
      ? {
          boxShadow: `0 0 34px -6px ${lighting.underglowHex}55, 0 18px 38px rgba(0, 0, 0, 0.48)`,
          borderColor: `${lighting.underglowHex}66`,
        }
      : {};

  return (
    <div className="keyboard-stage-container">
      {/* Top Toolbar: Form Factor, Layer Switcher, Multi-Key Selection Helpers */}
      <div className="keyboard-stage-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-group-label">Layout</span>
          <div className="pill-segmented">
            {FORM_FACTORS.map((ff) => (
              <button
                key={ff.id}
                type="button"
                className={`pill-btn ${activeProfile.formFactor === ff.id ? 'active' : ''}`}
                onClick={() => setFormFactor(ff.id)}
              >
                {ff.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-group">
          <span className="toolbar-group-label">
            <Layers size={13} /> Layer
          </span>
          <div className="pill-segmented">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`pill-btn ${activeLayer === l.id ? 'active' : ''}`}
                onClick={() => setActiveLayer(l.id)}
              >
                L{l.id}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-group">
          <span className="toolbar-group-label">Quick Select</span>
          <div className="pill-segmented">
            <button type="button" className="pill-btn" onClick={() => selectKeyGroup('wasd')}>
              WASD
            </button>
            <button type="button" className="pill-btn" onClick={() => selectKeyGroup('alphas')}>
              Alphas
            </button>
            <button type="button" className="pill-btn" onClick={() => selectKeyGroup('modifiers')}>
              Mods
            </button>
            <button type="button" className="pill-btn" onClick={() => selectKeyGroup('all')}>
              All
            </button>
            <button type="button" className="pill-btn" onClick={() => selectKeyGroup('none')}>
              None ({selectedKeyIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Physical Keyboard Frame */}
      <div className="keyboard-chassis-scroll">
        <div
          className={`keyboard-chassis effect-${lighting.effect}`}
          style={{
            ...underglowStyle,
            ['--kb-primary' as string]: lighting.primaryHex,
            ['--kb-secondary' as string]: lighting.secondaryHex,
            ['--kb-brightness' as string]: `${lighting.brightness / 100}`,
          }}
        >
          {rows.map((rowKeys, rIdx) => (
            <div key={rIdx} className="keyboard-row">
              {rowKeys.map((keyDef) => {
                const isSelected = selectedKeyIds.includes(keyDef.id);
                const isPressed = pressedKeys.has(keyDef.id);
                const isTested = testedKeys.has(keyDef.id);
                const trigger = getTriggerForKey(keyDef.id);
                const hasCustomTrigger = Boolean(activeProfile.perKeyTriggers[keyDef.id]);
                const isSocd = socdKeySet.has(keyDef.id);
                const customRgb = lighting.perKeyColors[keyDef.id];
                const layerOverride = activeProfile.layers[activeLayer]?.[keyDef.id];
                const displayLabel = layerOverride || keyDef.defaultLabel;
                const travelVal = keyTravelMm[keyDef.id] || 0;

                // Determine keycap border/glow from RGB settings
                const keyRgbStyle: React.CSSProperties = {
                  ['--key-units' as string]: keyDef.width,
                  marginLeft: keyDef.gapBefore ? `calc(${keyDef.gapBefore} * var(--unit-size))` : undefined,
                };

                if (lighting.effect !== 'blackout') {
                  if (customRgb) {
                    keyRgbStyle.borderColor = `${customRgb}99`;
                    keyRgbStyle.boxShadow = `inset 0 0 12px ${customRgb}35, 0 2px 6px rgba(0,0,0,0.45)`;
                  }
                }

                return (
                  <button
                    key={keyDef.id}
                    type="button"
                    onClick={(e) => handleKeyClick(e, keyDef)}
                    className={[
                      'keycap-btn',
                      isSelected ? 'keycap-selected' : '',
                      isPressed ? 'keycap-pressed' : '',
                      mode === 'test' && isTested ? 'keycap-tested' : '',
                      hasCustomTrigger ? 'keycap-custom-he' : '',
                      isSocd ? 'keycap-socd' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={keyRgbStyle}
                    title={`${keyDef.defaultLabel} (${keyDef.id}) • Actuation: ${trigger.actuationMm.toFixed(
                      2
                    )}mm ${trigger.rapidTrigger ? `• RT: ${trigger.rtPressMm.toFixed(2)}mm` : ''}`}
                  >
                    {/* Top Row: Key Label & SOCD / Layer Badge */}
                    <div className="keycap-top">
                      <span className={`keycap-label ${layerOverride ? 'keycap-label-remapped' : ''}`}>
                        {displayLabel}
                      </span>
                      {isSocd && (
                        <span className="keycap-socd-badge" title="SOCD / Snap Tap Enabled">
                          <Zap size={10} />
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Actuation mm & Rapid Trigger Indicator */}
                    <div className="keycap-bottom">
                      <span className="keycap-mm">{trigger.actuationMm.toFixed(1)}</span>
                      {trigger.rapidTrigger && <span className="keycap-rt-tag">RT</span>}
                    </div>

                    {/* Live Travel Bar when physically pressed */}
                    {travelVal > 0 && (
                      <div
                        className="keycap-travel-fill"
                        style={{ height: `${Math.min(100, (travelVal / 4.0) * 100)}%` }}
                      />
                    )}

                    {/* Custom Per-Key RGB Dot */}
                    {customRgb && lighting.effect !== 'blackout' && (
                      <span className="keycap-rgb-dot" style={{ backgroundColor: customRgb }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="keyboard-stage-legend">
        <div className="legend-item">
          <span className="legend-swatch swatch-selected" />
          <span>Selected ({selectedKeyIds.length}) — Shift/Ctrl+Click for multi-select</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-rt" />
          <span>Rapid Trigger (RT) Active</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-socd" />
          <span>SOCD / Snap Tap Pair</span>
        </div>
        <div className="legend-item">
          <Sparkles size={13} style={{ color: '#5dde89' }} />
          <span>Press physical keys on your keyboard to test live travel & NKRO!</span>
        </div>
      </div>
    </div>
  );
}
