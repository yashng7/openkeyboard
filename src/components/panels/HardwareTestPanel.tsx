'use client';

import React from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { getAllKeysForLayout } from '@/lib/keyboard-data';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export function HardwareTestPanel() {
  const {
    activeProfile,
    pressedKeys,
    testedKeys,
    peakNkro,
    totalKeystrokes,
    chatterEvents,
    chatterThresholdMs,
    setChatterThresholdMs,
    resetDiagnostics,
  } = useKeyboard();

  const totalBoardKeys = getAllKeysForLayout(activeProfile.formFactor).length;
  const testedPercent = Math.min(100, Math.round((testedKeys.size / totalBoardKeys) * 100));
  const bounceWarningsCount = chatterEvents.filter((e) => e.isBounceWarning).length;

  return (
    <div className="panel-grid">
      {/* Left Card: Live NKRO Rollover & Matrix Coverage */}
      <section className="m3-card span-6">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Activity size={20} style={{ color: '#38bdf8' }} />
              <h2>NKRO Rollover & Switch Matrix Tester</h2>
            </div>
            <p className="card-subtitle">
              Press multiple keys simultaneously on your physical keyboard to verify N-Key Rollover and switch continuity.
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={resetDiagnostics}>
            <RotateCcw size={15} />
            <span>Reset Counters</span>
          </button>
        </div>

        <div className="diagnostics-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Currently Held</span>
            <strong className="kpi-value accent-blue">{pressedKeys.size}</strong>
            <span className="kpi-sub">Simultaneous Keys</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Peak NKRO Rollover</span>
            <strong className="kpi-value accent-green">{peakNkro}KRO</strong>
            <span className="kpi-sub">{peakNkro >= 6 ? 'True Full NKRO' : 'Press 6+ keys to verify'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Matrix Coverage</span>
            <strong className="kpi-value">{testedPercent}%</strong>
            <span className="kpi-sub">
              {testedKeys.size} / {totalBoardKeys} Keys Verified
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Total Actuations</span>
            <strong className="kpi-value">{totalKeystrokes}</strong>
            <span className="kpi-sub">Session Keystrokes</span>
          </div>
        </div>

        <div className="held-keys-monitor">
          <span className="section-micro-label">Active Matrix Scan Buffer</span>
          <div className="selected-keys-chips">
            {pressedKeys.size === 0 ? (
              <span className="muted-note">No keys currently depressed — type or hold chords now...</span>
            ) : (
              Array.from(pressedKeys).map((k) => (
                <span key={k} className="key-chip key-chip-active">
                  <Zap size={11} /> {k}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Right Card: Switch Chatter / Bounce Analyzer (like OpenMouse BounceCheckDialog) */}
      <section className="m3-card span-6">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <ShieldAlert size={20} style={{ color: bounceWarningsCount > 0 ? '#f43f5e' : '#5dde89' }} />
              <h2>Switch Chatter & Double-Bounce Analyzer</h2>
              <span className={`pill-badge ${bounceWarningsCount > 0 ? 'badge-danger' : 'badge-live'}`}>
                {bounceWarningsCount > 0 ? `${bounceWarningsCount} Chatter Flags` : 'Zero Chatter Detected'}
              </span>
            </div>
            <p className="card-subtitle">
              Measures inter-press delta (`ms`) on rapid same-key actuations to spot faulty switches or overly aggressive debounce.
            </p>
          </div>
        </div>

        <div className="slider-control-row">
          <div className="slider-header">
            <span>Chatter Fault Detection Threshold</span>
            <strong>&le; {chatterThresholdMs} ms</strong>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            step={1}
            value={chatterThresholdMs}
            onChange={(e) => setChatterThresholdMs(Number(e.target.value))}
            className="m3-slider"
          />
        </div>

        <div className="chatter-log-wrap">
          {chatterEvents.length === 0 ? (
            <div className="empty-macro-state">
              Rapidly double-tap any key on your keyboard to measure inter-stroke return delta (`ms`).
            </div>
          ) : (
            <div className="chatter-list">
              {chatterEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`chatter-row ${ev.isBounceWarning ? 'chatter-warning' : 'chatter-clean'}`}
                >
                  <span className="mono-cell">{ev.timestamp}</span>
                  <strong>{ev.keyId}</strong>
                  <span className="mono-cell">{ev.deltaMs} ms delta</span>
                  <span className="chatter-status">
                    {ev.isBounceWarning ? (
                      <>
                        <AlertTriangle size={13} /> Switch Chatter Warning
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} /> Clean Rapid Tap
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
