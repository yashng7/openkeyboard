'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { MacroSlot, MacroStep, MacroTriggerMode } from '@/types/keyboard';
import {
  CircleDot,
  Link2,
  Plus,
  Square,
  Terminal,
  Trash2,
} from 'lucide-react';

export function MacroPanel() {
  const {
    activeProfile,
    updateMacroSlot,
    selectedKeyIds,
    assignKeycodeToSelected,
  } = useKeyboard();

  const [selectedSlotNum, setSelectedSlotNum] = useState(1);
  const currentSlot: MacroSlot =
    activeProfile.macros.find((m) => m.slot === selectedSlotNum) ||
    activeProfile.macros[0];

  const [macroName, setMacroName] = useState(currentSlot.name);
  const [triggerMode, setTriggerMode] = useState<MacroTriggerMode>(currentSlot.mode);
  const [steps, setSteps] = useState<MacroStep[]>(currentSlot.steps);
  const [recording, setRecording] = useState(false);

  const lastEventTimeRef = useRef<number>(0);

  useEffect(() => {
    setMacroName(currentSlot.name);
    setTriggerMode(currentSlot.mode);
    setSteps(currentSlot.steps);
    setRecording(false);
  }, [currentSlot]);

  useEffect(() => {
    if (!recording) return;
    lastEventTimeRef.current = performance.now();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      e.preventDefault();
      const now = performance.now();
      const delay = Math.min(2000, Math.max(5, Math.round(now - lastEventTimeRef.current)));
      lastEventTimeRef.current = now;

      const step: MacroStep = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        action: 'down',
        keyCode: e.code,
        keyLabel: e.key.length === 1 ? e.key.toUpperCase() : e.code,
        delayMs: delay,
      };
      setSteps((prev) => [...prev, step]);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      const now = performance.now();
      const delay = Math.min(2000, Math.max(5, Math.round(now - lastEventTimeRef.current)));
      lastEventTimeRef.current = now;

      const step: MacroStep = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        action: 'up',
        keyCode: e.code,
        keyLabel: e.key.length === 1 ? e.key.toUpperCase() : e.code,
        delayMs: delay,
      };
      setSteps((prev) => [...prev, step]);
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
    };
  }, [recording]);

  const handleSaveMacro = () => {
    updateMacroSlot({
      ...currentSlot,
      name: macroName,
      mode: triggerMode,
      steps,
    });
  };

  const handleAddTapStep = () => {
    const targetKey = selectedKeyIds[0] || 'KeyE';
    setSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        action: 'tap',
        keyCode: targetKey,
        keyLabel: targetKey.replace('Key', ''),
        delayMs: 15,
      },
    ]);
  };

  return (
    <div className="panel-grid">
      {/* Left Column: 8 Hardware Macro Slots */}
      <section className="m3-card span-4">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Terminal size={20} style={{ color: '#fbbf24' }} />
              <h2>On-Board Macro Slots</h2>
            </div>
            <p className="card-subtitle">8 hardware flash slots stored directly on the MCU.</p>
          </div>
        </div>

        <div className="macro-slots-list">
          {activeProfile.macros.map((m) => (
            <button
              key={m.slot}
              type="button"
              className={`macro-slot-btn ${selectedSlotNum === m.slot ? 'active' : ''}`}
              onClick={() => setSelectedSlotNum(m.slot)}
            >
              <div className="macro-slot-top">
                <span className="macro-slot-tag">M{m.slot}</span>
                <span className="macro-step-count">{m.steps.length} events</span>
              </div>
              <div className="macro-slot-name">{m.name}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-secondary full-width"
          style={{ marginTop: '0.75rem' }}
          onClick={() => assignKeycodeToSelected(`M${selectedSlotNum}`)}
        >
          <Link2 size={15} />
          <span>
            Bind M{selectedSlotNum} to {selectedKeyIds.length} Selected Key(s)
          </span>
        </button>
      </section>

      {/* Right Column: Live Sequencer & Recorder */}
      <section className="m3-card span-8">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <h2>
                Editing Slot M{selectedSlotNum}: {macroName}
              </h2>
            </div>
            <p className="card-subtitle">
              Record real keystrokes with hardware timestamps or edit millisecond delays manually.
            </p>
          </div>

          <div className="header-actions-row">
            <button
              type="button"
              className={`btn-record ${recording ? 'recording' : ''}`}
              onClick={() => setRecording((r) => !r)}
            >
              {recording ? <Square size={15} /> : <CircleDot size={15} />}
              <span>{recording ? 'Stop Recording' : 'Record Keystrokes'}</span>
            </button>
            <button type="button" className="btn-primary" onClick={handleSaveMacro}>
              Save Slot M{selectedSlotNum}
            </button>
          </div>
        </div>

        <div className="control-split-row">
          <div className="control-block">
            <label className="control-label">Macro Label</label>
            <input
              type="text"
              value={macroName}
              onChange={(e) => setMacroName(e.target.value)}
              className="m3-input"
            />
          </div>

          <div className="control-block">
            <label className="control-label">Playback Trigger Mode</label>
            <select
              value={triggerMode}
              onChange={(e) => setTriggerMode(e.target.value as MacroTriggerMode)}
              className="m3-select"
            >
              <option value="once">Play Once on Press</option>
              <option value="hold_loop">Loop While Key Held</option>
              <option value="toggle_loop">Toggle Continuous Loop</option>
              <option value="repeat_n">Repeat Fixed Count</option>
            </select>
          </div>
        </div>

        {/* Steps Timeline */}
        <div className="macro-steps-toolbar">
          <span className="section-micro-label">Event Sequence ({steps.length} steps)</span>
          <div className="header-actions-row">
            <button type="button" className="btn-ghost-sm" onClick={handleAddTapStep}>
              <Plus size={13} /> Add Tap Event
            </button>
            <button
              type="button"
              className="btn-ghost-sm"
              onClick={() => setSteps([])}
            >
              <Trash2 size={13} /> Clear All
            </button>
          </div>
        </div>

        <div className="macro-steps-list">
          {steps.length === 0 ? (
            <div className="empty-macro-state">
              Click <strong>Record Keystrokes</strong> above and type on your keyboard to capture an exact sequence.
            </div>
          ) : (
            steps.map((st, idx) => (
              <div key={st.id} className="macro-step-row">
                <span className="step-index">#{idx + 1}</span>
                <span className={`step-action-badge action-${st.action}`}>
                  {st.action.toUpperCase()}
                </span>
                <strong className="step-key-label">{st.keyLabel || st.keyCode}</strong>
                <div className="step-delay-edit">
                  <span>Delay:</span>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={st.delayMs}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSteps((prev) =>
                        prev.map((item) => (item.id === st.id ? { ...item, delayMs: val } : item))
                      );
                    }}
                    className="m3-input-xs"
                  />
                  <span>ms</span>
                </div>
                <button
                  type="button"
                  className="btn-icon-danger"
                  onClick={() => setSteps((prev) => prev.filter((item) => item.id !== st.id))}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
