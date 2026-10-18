'use client';

import React from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { Check, RotateCcw, Save } from 'lucide-react';

export function PendingBar() {
  const {
    hasUnsavedChanges,
    commitPendingChangesToBoard,
    discardPendingChanges,
    writableBoardConnected,
    toastMessage,
  } = useKeyboard();

  return (
    <>
      {hasUnsavedChanges && (
        <div className="pending-bar" role="status" aria-live="polite">
          <div className="pending-bar-text">
            <span className="pending-pulse" />
            <span>
              {writableBoardConnected
                ? 'Uncommitted changes staged — write them to the connected board?'
                : 'Uncommitted changes staged — no writable VIA board connected, so saving stores them in this browser only.'}
            </span>
          </div>
          <div className="pending-bar-actions">
            <button type="button" className="btn-secondary" onClick={discardPendingChanges}>
              <RotateCcw size={14} />
              <span>Discard</span>
            </button>
            <button type="button" className="btn-primary" onClick={commitPendingChangesToBoard}>
              <Save size={14} />
              <span>{writableBoardConnected ? 'Write to Board' : 'Save to Browser'}</span>
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="m3-toast" role="status">
          <Check size={15} style={{ color: '#5dde89' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
