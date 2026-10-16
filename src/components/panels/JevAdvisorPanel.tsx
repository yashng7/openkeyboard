'use client';

import React, { useState } from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { JevAdvisorDecisionResponse } from '@/types/keyboard';
import {
  CheckCircle2,
  Cpu,
  Gauge,
  Loader2,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';

const QUICK_SCENARIOS = [
  {
    label: 'Valorant / CS2 Entry Fragger',
    prompt:
      'Competitive Valorant and CS2 Jett/Raze entry fragger needing instant counter-strafing on A and D, sub-0.4mm actuation, and 8000Hz zero-latency scan.',
  },
  {
    label: 'osu! 250BPM Stream Stamina',
    prompt:
      'High-BPM osu! and rhythm game streaming needing 0.1mm Continuous Rapid Trigger and ultra-light 0.2mm actuation to eliminate finger lock.',
  },
  {
    label: 'Neovim & Rust Deep Coding',
    prompt:
      'Software engineer writing Rust and TypeScript in Neovim for 8 hours daily; want zero accidental adjacent typos, deliberate actuation, and quiet power-efficient polling.',
  },
  {
    label: 'League / Dota 2 Quick-Cast',
    prompt:
      'MOBA and ARPG player needing snappy QWER/DF ability quick-casting with Rapid Trigger reset but no accidental ultimate presses.',
  },
];

export function JevAdvisorPanel() {
  const { applyJevSynthesizedConfig } = useKeyboard();

  const [prompt, setPrompt] = useState(QUICK_SCENARIOS[0].prompt);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JevAdvisorDecisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluateWithJev = async (customPrompt?: string) => {
    const textToUse = customPrompt ?? prompt;
    if (!textToUse.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/jev-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToUse }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Jev evaluation failed');
      }
      setResult(data as JevAdvisorDecisionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach Jev Advisor API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-grid">
      {/* Left Card: Scenario Input & Quick Prompts */}
      <section className="m3-card span-5">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Sparkles size={20} style={{ color: '#a78bfa' }} />
              <h2>TypeSafe Jev-1.13 Smart Profile Advisor</h2>
              <span className="pill-badge badge-jev">System One API</span>
            </div>
            <p className="card-subtitle">
              Describe your game, movement style, or typing issue. Jev evaluates Choice, Score, and Noul primitives to synthesize a calibrated hardware profile.
            </p>
          </div>
        </div>

        <div className="control-block">
          <label className="control-label">Quick Playstyle Scenarios</label>
          <div className="quick-scenario-grid">
            {QUICK_SCENARIOS.map((sc) => (
              <button
                key={sc.label}
                type="button"
                className="scenario-chip-btn"
                onClick={() => {
                  setPrompt(sc.prompt);
                  handleEvaluateWithJev(sc.prompt);
                }}
              >
                <Wand2 size={13} style={{ color: '#a78bfa' }} />
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="control-block">
          <label className="control-label">Your Custom Scenario / Hardware Goal</label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your game, keybinds, fatigue, or actuation preference..."
            className="m3-textarea"
          />
        </div>

        <button
          type="button"
          className="btn-primary full-width"
          disabled={loading}
          onClick={() => handleEvaluateWithJev()}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin-icon" />
              <span>Querying typesafe/jev-1.13 Decisions API...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Ask Jev to Calibrate Keyboard Profile</span>
            </>
          )}
        </button>

        {error && <div className="notice-banner notice-warning">{error}</div>}
      </section>

      {/* Right Card: Jev Structured Decision Telemetry & 1-Click Apply */}
      <section className="m3-card span-7">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Cpu size={20} style={{ color: '#5dde89' }} />
              <h2>Jev Decision Telemetry & Synthesized Hardware Config</h2>
            </div>
            <p className="card-subtitle">
              Calibrated probabilities across Choice, Score, and Noul primitives (`Jev Decides, Antigravity Writes`).
            </p>
          </div>
          {result && (
            <span className="pill-badge badge-live">
              {result.model} • {result.latencyMs}ms
            </span>
          )}
        </div>

        {!result ? (
          <div className="empty-macro-state">
            Click <strong>Ask Jev to Calibrate Keyboard Profile</strong> or select a quick scenario on the left to run live structured evaluation.
          </div>
        ) : (
          <div className="jev-result-stack">
            {/* 3 Primitives Grid */}
            <div className="jev-primitives-grid">
              <div className="jev-primitive-box">
                <span className="primitive-tag">CHOICE PRIMITIVE</span>
                <div className="primitive-main">{result.decisions.recommendedGenre.choice.toUpperCase()}</div>
                <div className="primitive-conf">
                  Confidence: <strong>{(result.decisions.recommendedGenre.confidence * 100).toFixed(0)}%</strong>
                </div>
              </div>

              <div className="jev-primitive-box">
                <span className="primitive-tag">SCORE PRIMITIVE (0–3)</span>
                <div className="primitive-main">
                  {result.decisions.actuationAggressivenessScore.score.toFixed(2)} / 3.00
                </div>
                <div className="primitive-conf">{result.decisions.actuationAggressivenessScore.label}</div>
              </div>

              <div className="jev-primitive-box">
                <span className="primitive-tag">NOUL PRIMITIVES (BOOL PROB)</span>
                <div className="primitive-main">
                  RT: {(result.decisions.enableRapidTrigger.noul * 100).toFixed(0)}% • SOCD:{' '}
                  {(result.decisions.enableSocdSnapTap.noul * 100).toFixed(0)}%
                </div>
                <div className="primitive-conf">Rapid Trigger & Snap Tap Probability</div>
              </div>
            </div>

            {/* Synthesized Profile Summary */}
            <div className="jev-synthesized-card">
              <div className="jev-synth-header">
                <div>
                  <h3>{result.synthesizedConfig.profileName}</h3>
                  <p>{result.synthesizedConfig.summary}</p>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => applyJevSynthesizedConfig(result.synthesizedConfig)}
                >
                  <CheckCircle2 size={16} />
                  <span>Apply to Keyboard</span>
                </button>
              </div>

              <div className="jev-specs-chips">
                <span className="key-chip">
                  <Zap size={12} /> WASD: {result.synthesizedConfig.wasdActuationMm.toFixed(2)}mm
                </span>
                <span className="key-chip">
                  General: {result.synthesizedConfig.generalActuationMm.toFixed(2)}mm
                </span>
                <span className="key-chip">
                  Rapid Trigger:{' '}
                  {result.synthesizedConfig.rapidTrigger
                    ? `ON (${result.synthesizedConfig.rtPressMm.toFixed(2)}mm)`
                    : 'OFF'}
                </span>
                <span className="key-chip">
                  SOCD A+D: {result.synthesizedConfig.enableSocdAD ? 'Snap Tap ON' : 'OFF'}
                </span>
                <span className="key-chip">
                  <Gauge size={12} /> Polling: {result.synthesizedConfig.pollingRateHz}Hz
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
