'use client';

import React, { useState } from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { SocdResolutionMode } from '@/types/keyboard';
import {
  Activity,
  Gauge,
  Magnet,
  Plus,
  RotateCcw,
  Trash2,
  Zap,
} from 'lucide-react';

const SOCD_MODES: { id: SocdResolutionMode; label: string; desc: string }[] = [
  {
    id: 'last_priority',
    label: 'Last Key Priority (Snap Tap)',
    desc: 'Latest pressed key immediately overrides the opposite key without releasing the first key.',
  },
  {
    id: 'neutral',
    label: 'Neutral (Both Cancel)',
    desc: 'Holding both keys simultaneously outputs neutral (zero movement).',
  },
  {
    id: 'key1_priority',
    label: 'Key 1 Absolute Priority',
    desc: 'First key in the pair always wins when both are held.',
  },
  {
    id: 'key2_priority',
    label: 'Key 2 Absolute Priority',
    desc: 'Second key in the pair always wins when both are held.',
  },
];

export function MagneticPanel() {
  const {
    selectedKeyIds,
    getTriggerForKey,
    updateTriggerForSelected,
    resetSelectedTriggersToGlobal,
    activeProfile,
    toggleSocdPair,
    addSocdPair,
    removeSocdPair,
    updateSocdMode,
    pressedKeys,
    keyTravelMm,
    lastActiveKeyId,
  } = useKeyboard();

  const [newKey1, setNewKey1] = useState('KeyA');
  const [newKey2, setNewKey2] = useState('KeyD');
  const [newMode, setNewMode] = useState<SocdResolutionMode>('last_priority');
  const [simulatedDepth, setSimulatedDepth] = useState<number | null>(null);

  const primaryKeyId = selectedKeyIds[0] || lastActiveKeyId || 'KeyW';
  const currentTrigger = getTriggerForKey(primaryKeyId);

  const liveDepth =
    simulatedDepth !== null
      ? simulatedDepth
      : keyTravelMm[primaryKeyId] ?? (pressedKeys.has(primaryKeyId) ? 3.8 : 0.0);

  const isActuated = liveDepth >= currentTrigger.actuationMm;

  // Live A+D Counter-strafe demonstration state
  const aHeld = pressedKeys.has('KeyA');
  const dHeld = pressedKeys.has('KeyD');
  let activeStrafeOutput = 'IDLE (Neutral)';
  if (aHeld && !dHeld) activeStrafeOutput = '← STRAFE LEFT (A)';
  else if (!aHeld && dHeld) activeStrafeOutput = 'STRAFE RIGHT (D) →';
  else if (aHeld && dHeld) {
    const adPair = activeProfile.socdPairs.find(
      (p) => p.enabled && ((p.key1Id === 'KeyA' && p.key2Id === 'KeyD') || (p.key1Id === 'KeyD' && p.key2Id === 'KeyA'))
    );
    if (!adPair || adPair.mode === 'neutral') {
      activeStrafeOutput = 'NEUTRAL STOP (A+D Cancel)';
    } else if (adPair.mode === 'last_priority') {
      activeStrafeOutput =
        lastActiveKeyId === 'KeyD'
          ? '⚡ SNAP TAP RIGHT (D Overrides A) →'
          : '← ⚡ SNAP TAP LEFT (A Overrides D)';
    } else if (adPair.mode === 'key1_priority') {
      activeStrafeOutput = `PRIORITY: ${adPair.key1Id}`;
    } else {
      activeStrafeOutput = `PRIORITY: ${adPair.key2Id}`;
    }
  }

  return (
    <div className="panel-grid">
      {/* Card 1: Per-Key Actuation & Rapid Trigger Tuning */}
      <section className="m3-card span-5">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Magnet size={20} style={{ color: '#f472b6' }} />
              <h2>Hall-Effect Actuation & Rapid Trigger</h2>
            </div>
            <p className="card-subtitle">
              Editing <strong>{selectedKeyIds.length} selected key(s)</strong> (Primary:{' '}
              <code>{primaryKeyId}</code>).
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost-sm"
            onClick={resetSelectedTriggersToGlobal}
            title="Reset selected keys to global default"
          >
            <RotateCcw size={13} /> Reset to Global
          </button>
        </div>

        {/* Actuation Point Slider (0.1mm - 4.0mm) */}
        <div className="slider-control-row">
          <div className="slider-header">
            <span>Actuation Point (Travel Distance)</span>
            <strong className="accent-pink">{currentTrigger.actuationMm.toFixed(2)} mm</strong>
          </div>
          <input
            type="range"
            min={0.1}
            max={4.0}
            step={0.05}
            value={currentTrigger.actuationMm}
            onChange={(e) =>
              updateTriggerForSelected({ actuationMm: Number(e.target.value) })
            }
            className="m3-slider slider-pink"
          />
          <div className="slider-scale">
            <span>0.10mm (Hair-Trigger)</span>
            <span>2.00mm (Standard)</span>
            <span>4.00mm (Bottom-Out)</span>
          </div>
        </div>

        {/* Rapid Trigger Toggle */}
        <div className="toggle-feature-row">
          <div>
            <div className="toggle-feature-title">
              <Zap size={15} style={{ color: '#f472b6' }} />
              <span>Rapid Trigger (Dynamic Actuation & Reset)</span>
            </div>
            <p className="toggle-feature-desc">
              Resets the key the instant it travels upward by the release sensitivity—no fixed reset point.
            </p>
          </div>
          <button
            type="button"
            className={`switch-toggle ${currentTrigger.rapidTrigger ? 'on' : ''}`}
            onClick={() =>
              updateTriggerForSelected({ rapidTrigger: !currentTrigger.rapidTrigger })
            }
          >
            <span className="switch-thumb" />
          </button>
        </div>

        {currentTrigger.rapidTrigger && (
          <>
            <div className="slider-control-row">
              <div className="slider-header">
                <span>Rapid Trigger Press Sensitivity (Downstroke)</span>
                <strong>{currentTrigger.rtPressMm.toFixed(2)} mm</strong>
              </div>
              <input
                type="range"
                min={0.05}
                max={2.0}
                step={0.05}
                value={currentTrigger.rtPressMm}
                onChange={(e) =>
                  updateTriggerForSelected({ rtPressMm: Number(e.target.value) })
                }
                className="m3-slider slider-pink"
              />
            </div>

            <div className="slider-control-row">
              <div className="slider-header">
                <span>Rapid Trigger Release Sensitivity (Upstroke)</span>
                <strong>{currentTrigger.rtReleaseMm.toFixed(2)} mm</strong>
              </div>
              <input
                type="range"
                min={0.05}
                max={2.0}
                step={0.05}
                value={currentTrigger.rtReleaseMm}
                onChange={(e) =>
                  updateTriggerForSelected({ rtReleaseMm: Number(e.target.value) })
                }
                className="m3-slider slider-pink"
              />
            </div>

            <div className="toggle-feature-row">
              <div>
                <div className="toggle-feature-title">
                  <span>Continuous Rapid Trigger</span>
                </div>
                <p className="toggle-feature-desc">
                  Keeps Rapid Trigger active across the entire 4.0mm travel until the switch fully tops out (0.0mm).
                </p>
              </div>
              <button
                type="button"
                className={`switch-toggle ${currentTrigger.continuousRt ? 'on' : ''}`}
                onClick={() =>
                  updateTriggerForSelected({ continuousRt: !currentTrigger.continuousRt })
                }
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </>
        )}

        {/* Top / Bottom Deadzones */}
        <div className="control-split-row">
          <div className="slider-control-row">
            <div className="slider-header">
              <span>Top Deadzone</span>
              <strong>{currentTrigger.topDeadzoneMm.toFixed(2)} mm</strong>
            </div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step={0.05}
              value={currentTrigger.topDeadzoneMm}
              onChange={(e) =>
                updateTriggerForSelected({ topDeadzoneMm: Number(e.target.value) })
              }
              className="m3-slider"
            />
          </div>

          <div className="slider-control-row">
            <div className="slider-header">
              <span>Bottom Deadzone</span>
              <strong>{currentTrigger.bottomDeadzoneMm.toFixed(2)} mm</strong>
            </div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step={0.05}
              value={currentTrigger.bottomDeadzoneMm}
              onChange={(e) =>
                updateTriggerForSelected({ bottomDeadzoneMm: Number(e.target.value) })
              }
              className="m3-slider"
            />
          </div>
        </div>
      </section>

      {/* Card 2: Live Hall-Sensor ADC Stem Gauge */}
      <section className="m3-card span-3">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Activity size={20} style={{ color: '#5dde89' }} />
              <h2>Live ADC Stem Gauge</h2>
            </div>
            <p className="card-subtitle">
              Real-time Hall-Effect travel depth for <code>{primaryKeyId}</code>.
            </p>
          </div>
        </div>

        <div className="adc-visualizer-wrap">
          <div className="adc-meter-column">
            <div className="adc-scale-marks">
              <span>0.0mm</span>
              <span>1.0mm</span>
              <span>2.0mm</span>
              <span>3.0mm</span>
              <span>4.0mm</span>
            </div>

            <div className="adc-cylinder">
              {/* Top deadzone */}
              <div
                className="adc-deadzone-top"
                style={{ height: `${(currentTrigger.topDeadzoneMm / 4.0) * 100}%` }}
              />
              {/* Actuation Threshold Line */}
              <div
                className="adc-actuation-line"
                style={{ top: `${(currentTrigger.actuationMm / 4.0) * 100}%` }}
              >
                <span>Actuate {currentTrigger.actuationMm.toFixed(2)}mm</span>
              </div>
              {/* Stem Fill */}
              <div
                className={`adc-stem-fill ${isActuated ? 'actuated' : ''}`}
                style={{ height: `${Math.min(100, (liveDepth / 4.0) * 100)}%` }}
              />
            </div>
          </div>

          <div className="adc-telemetry-box">
            <div className="adc-readout-big">
              <span>{liveDepth.toFixed(2)}</span>
              <small>mm</small>
            </div>
            <span className={`pill-badge ${isActuated ? 'badge-live' : 'badge-neutral'}`}>
              {isActuated ? 'SWITCH ACTUATED' : 'RELEASED'}
            </span>

            <div className="slider-control-row" style={{ marginTop: '0.75rem' }}>
              <div className="slider-header">
                <span>Test Analog Travel</span>
                <strong>{simulatedDepth !== null ? `${simulatedDepth.toFixed(2)}mm` : 'Auto'}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={4.0}
                step={0.05}
                value={liveDepth}
                onChange={(e) => setSimulatedDepth(Number(e.target.value))}
                onMouseUp={() => setSimulatedDepth(null)}
                onTouchEnd={() => setSimulatedDepth(null)}
                className="m3-slider"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Card 3: SOCD / Snap Tap Opposite Key Priority */}
      <section className="m3-card span-4">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Gauge size={20} style={{ color: '#fbbf24' }} />
              <h2>SOCD / Snap Tap Engine</h2>
            </div>
            <p className="card-subtitle">
              Simultaneous Opposite Cardinal Direction priority for instant counter-strafing.
            </p>
          </div>
        </div>

        {/* Live Counter-Strafe A+D Tester */}
        <div className="socd-live-tester">
          <div className="socd-tester-top">
            <span>Hold physical A + D keys together to test Snap Tap:</span>
          </div>
          <div className="socd-tester-keys">
            <span className={`socd-key-box ${aHeld ? 'held' : ''}`}>A {aHeld ? 'HELD' : ''}</span>
            <span className="socd-output-banner">{activeStrafeOutput}</span>
            <span className={`socd-key-box ${dHeld ? 'held' : ''}`}>D {dHeld ? 'HELD' : ''}</span>
          </div>
        </div>

        {/* Active SOCD Pairs List */}
        <div className="socd-pairs-list">
          {activeProfile.socdPairs.map((pair) => (
            <div key={pair.id} className="socd-pair-card">
              <div className="socd-pair-header">
                <div className="socd-pair-keys">
                  <span className="key-chip">{pair.key1Id.replace('Key', '')}</span>
                  <span>⇄</span>
                  <span className="key-chip">{pair.key2Id.replace('Key', '')}</span>
                  <strong>{pair.name}</strong>
                </div>
                <div className="socd-pair-actions">
                  <button
                    type="button"
                    className={`switch-toggle ${pair.enabled ? 'on' : ''}`}
                    onClick={() => toggleSocdPair(pair.id)}
                  >
                    <span className="switch-thumb" />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => removeSocdPair(pair.id)}
                    title="Delete SOCD pair"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <select
                className="m3-select"
                value={pair.mode}
                onChange={(e) => updateSocdMode(pair.id, e.target.value as SocdResolutionMode)}
              >
                {SOCD_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Add New SOCD Pair */}
        <div className="socd-add-bar">
          <input
            type="text"
            value={newKey1}
            onChange={(e) => setNewKey1(e.target.value)}
            className="m3-input-sm"
            placeholder="Key1 (e.g. KeyA)"
          />
          <input
            type="text"
            value={newKey2}
            onChange={(e) => setNewKey2(e.target.value)}
            className="m3-input-sm"
            placeholder="Key2 (e.g. KeyD)"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => addSocdPair(newKey1, newKey2, newMode)}
          >
            <Plus size={14} /> Add Pair
          </button>
        </div>
      </section>
    </div>
  );
}
