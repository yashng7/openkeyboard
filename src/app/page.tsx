'use client';

import React, { useState } from 'react';
import { KeyboardProvider, useKeyboard } from '@/context/KeyboardContext';
import { AppSidebar } from '@/components/AppSidebar';
import { InteractiveKeyboard } from '@/components/InteractiveKeyboard';
import { OverviewPanel } from '@/components/panels/OverviewPanel';
import { KeymapPanel } from '@/components/panels/KeymapPanel';
import { MagneticPanel } from '@/components/panels/MagneticPanel';
import { LightingPanel } from '@/components/panels/LightingPanel';
import { MacroPanel } from '@/components/panels/MacroPanel';
import { HardwareTestPanel } from '@/components/panels/HardwareTestPanel';
import { JevAdvisorPanel } from '@/components/panels/JevAdvisorPanel';
import { ProfilesSettingsPanel } from '@/components/panels/ProfilesSettingsPanel';
import { PendingBar } from '@/components/PendingBar';
import { Save, Sparkles, Usb } from 'lucide-react';

function ControlWorkspace() {
  const {
    activeTab,
    setActiveTab,
    device,
    activeProfile,
    connectWebHidDevice,
    commitPendingChangesToBoard,
    hasUnsavedChanges,
  } = useKeyboard();

  const [paintBrushHex, setPaintBrushHex] = useState<string | null>(null);

  const keyboardStageMode =
    activeTab === 'keymap'
      ? 'remap'
      : activeTab === 'magnetic'
      ? 'magnetic'
      : activeTab === 'lighting' && paintBrushHex !== null
      ? 'paint'
      : activeTab === 'hardware-test'
      ? 'test'
      : 'inspect';

  return (
    <div className="control-shell">
      <AppSidebar />

      <main className="control-main">
        {/* Top Workspace Header */}
        <header className="workspace-topbar">
          <div className="topbar-left">
            <h1 className="workspace-title">{activeProfile.name}</h1>
            <span className="workspace-subtitle">{activeProfile.description}</span>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setActiveTab('jev-advisor')}
            >
              <Sparkles size={15} style={{ color: '#a78bfa' }} />
              <span>Jev Auto-Tune</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={connectWebHidDevice}
            >
              <Usb size={15} style={{ color: '#5dde89' }} />
              <span>{device.connectionMode === 'webhid' ? 'Switch WebHID' : 'Connect USB/WebHID'}</span>
            </button>

            <button
              type="button"
              className={`btn-primary ${hasUnsavedChanges ? 'pulse-highlight' : ''}`}
              onClick={commitPendingChangesToBoard}
            >
              <Save size={15} />
              <span>Save to Flash</span>
            </button>
          </div>
        </header>

        {/* Interactive Visual Keyboard Matrix (Always visible across tabs) */}
        <InteractiveKeyboard mode={keyboardStageMode} paintBrushHex={paintBrushHex} />

        {/* Active Module Workspace Panel */}
        <div className="workspace-panel-container">
          {activeTab === 'overview' && <OverviewPanel />}
          {activeTab === 'keymap' && <KeymapPanel />}
          {activeTab === 'magnetic' && <MagneticPanel />}
          {activeTab === 'lighting' && (
            <LightingPanel
              activeBrushHex={paintBrushHex}
              onSelectBrush={(hex) => setPaintBrushHex(hex)}
            />
          )}
          {activeTab === 'macros' && <MacroPanel />}
          {activeTab === 'hardware-test' && <HardwareTestPanel />}
          {activeTab === 'jev-advisor' && <JevAdvisorPanel />}
          {activeTab === 'profiles' && <ProfilesSettingsPanel />}
        </div>
      </main>

      <PendingBar />
    </div>
  );
}

export default function HomePage() {
  return (
    <KeyboardProvider>
      <ControlWorkspace />
    </KeyboardProvider>
  );
}
