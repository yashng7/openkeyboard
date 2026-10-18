'use client';

import React from 'react';
import { useKeyboard } from '@/context/KeyboardContext';
import { SIMULATOR_DEVICES } from '@/lib/keyboard-data';
import {
  BatteryCharging,
  Cpu,
  Gauge,
  Laptop,
  Radio,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Trash2,
  Usb,
  Zap,
} from 'lucide-react';

const POLLING_RATES: Array<125 | 250 | 500 | 1000 | 2000 | 4000 | 8000> = [
  125, 250, 500, 1000, 2000, 4000, 8000,
];

export function OverviewPanel() {
  const {
    webHidSupported,
    device,
    connectWebHidDevice,
    selectSimulatorDevice,
    detectedKeyboards,
    detecting,
    rescanKeyboards,
    useDetectedKeyboard,
    activeProfile,
    setPollingRate,
    setSystemMode,
    setTachyonMode,
    setSleepMinutes,
    packetLogs,
    clearPacketLogs,
  } = useKeyboard();

  const scanLatencyMs = (1000 / activeProfile.pollingRateHz).toFixed(3);

  return (
    <div className="panel-grid">
      {/* Card 1: Connection & Hardware Simulator Hub */}
      <section className="m3-card span-7">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Usb size={20} style={{ color: '#5dde89' }} />
              <h2>Device Connection & Simulator Hub</h2>
              <span className={`pill-badge ${device.connectionMode === 'webhid' ? 'badge-live' : 'badge-sim'}`}>
                {device.connectionMode === 'webhid' ? 'WebHID Hardware Connected' : 'Virtual Hardware Simulator'}
              </span>
            </div>
            <p className="card-subtitle">
              Connect a physical QMK/VIA or Hall-Effect keyboard via Chromium WebHID, or switch between virtual boards to test every feature immediately.
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={connectWebHidDevice}>
            <Usb size={16} />
            <span>Connect WebHID Keyboard</span>
          </button>
        </div>

        {!webHidSupported && (
          <div className="notice-banner notice-warning">
            <span>
              Browser WebHID API (`navigator.hid`) was not detected. Open in Chrome, Edge, or Brave on `localhost` for direct USB HID access. Virtual Simulator is fully active!
            </span>
          </div>
        )}

        <div className="simulator-selector-block">
          <div className="detected-header">
            <div>
              <span className="section-micro-label">Detected Physical Keyboards</span>
              <p className="card-subtitle">
                Read from <code>navigator.hid.getDevices()</code> — only boards you already authorised for this
                origin. WebHID has no enumerate-everything API, so unauthorised boards need one click to pair.
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={rescanKeyboards} disabled={detecting}>
              <RefreshCw size={15} className={detecting ? 'spin-icon' : undefined} />
              <span>{detecting ? 'Scanning…' : 'Scan Again'}</span>
            </button>
          </div>

          {detectedKeyboards.length === 0 ? (
            <div className="notice-banner">
              <span>
                {webHidSupported
                  ? 'No previously-authorised keyboard found. Click “Connect WebHID Keyboard” to grant access to one.'
                  : 'Keyboard detection needs WebHID — Chrome, Edge, Brave or Opera over HTTPS/localhost.'}
              </span>
            </div>
          ) : (
            <div className="simulator-cards-row">
              {detectedKeyboards.map((kb) => {
                const isCurrent = device.id === kb.id;
                const probe = kb.probe;
                return (
                  <button
                    key={kb.id}
                    type="button"
                    className={`sim-device-btn ${isCurrent ? 'active' : ''}`}
                    onClick={() => useDetectedKeyboard(kb.id)}
                  >
                    <div className="sim-device-top">
                      <span className="sim-vendor">{kb.vendorName}</span>
                      <span className="sim-ff">{kb.formFactor.toUpperCase()}</span>
                    </div>
                    <div className="sim-name">{kb.name}</div>
                    <div className="sim-switch">
                      0x{kb.vendorId.toString(16).padStart(4, '0').toUpperCase()}:0x
                      {kb.productId.toString(16).padStart(4, '0').toUpperCase()} · {kb.interfaces.length}{' '}
                      interface{kb.interfaces.length === 1 ? '' : 's'}
                    </div>
                    <div className="detected-tags">
                      {probe?.responded ? (
                        <span className="pill-badge badge-live">Writable via VIA</span>
                      ) : kb.isConfigurable ? (
                        <span className="pill-badge badge-neutral">Vendor HID · unverified</span>
                      ) : (
                        <span className="pill-badge badge-neutral">Read-only</span>
                      )}
                      {probe?.responded ? (
                        <span className="pill-badge badge-live">
                          VIA {probe.protocolMajor}.{probe.protocolMinor}
                          {probe.layerCount !== null ? ` · ${probe.layerCount}L` : ''}
                        </span>
                      ) : (
                        <span className="pill-badge badge-neutral">Unverified</span>
                      )}
                      {probe?.responded && probe.lightingChannel !== null && (
                        <span className="pill-badge badge-live">RGB</span>
                      )}
                      {kb.formFactorSource === 'vendor-default' && (
                        <span className="pill-badge badge-neutral">Size guessed</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="simulator-selector-block">
          <span className="section-micro-label">Interactive Virtual Hardware Models</span>
          <div className="simulator-cards-row">
            {SIMULATOR_DEVICES.map((sim) => {
              const isCurrent = device.id === sim.id;
              return (
                <button
                  key={sim.id}
                  type="button"
                  className={`sim-device-btn ${isCurrent ? 'active' : ''}`}
                  onClick={() => selectSimulatorDevice(sim.id)}
                >
                  <div className="sim-device-top">
                    <span className="sim-vendor">{sim.vendorName}</span>
                    <span className="sim-ff">{sim.formFactor.toUpperCase()}</span>
                  </div>
                  <div className="sim-name">{sim.name}</div>
                  <div className="sim-switch">{sim.switchType}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hardware Identity Readout */}
        <dl className="identity-specs-grid">
          <div className="spec-box">
            <dt>VID : PID</dt>
            <dd>
              0x{device.vendorId.toString(16).padStart(4, '0').toUpperCase()} : 0x
              {device.productId.toString(16).padStart(4, '0').toUpperCase()}
            </dd>
          </div>
          <div className="spec-box">
            <dt>Firmware</dt>
            <dd>{device.firmwareVersion}</dd>
          </div>
          <div className="spec-box">
            <dt>Sensor / Matrix</dt>
            <dd>{device.pcbSensor}</dd>
          </div>
          <div className="spec-box">
            <dt>Transport & Power</dt>
            <dd className="spec-inline">
              <BatteryCharging size={14} style={{ color: '#5dde89' }} />
              <span>
                {device.transport}{' '}
                {device.batteryPercent !== null ? `(${device.batteryPercent}%)` : '(USB Bus Powered)'}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {/* Card 2: Polling Rate, OS Mode & Low-Latency Engine */}
      <section className="m3-card span-5">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Gauge size={20} style={{ color: '#60a5fa' }} />
              <h2>Polling Rate & Scan Engine</h2>
            </div>
            <p className="card-subtitle">
              Configure USB report frequency, OS modifier layout, and Hall-effect matrix scan speed.
            </p>
          </div>
          <div className="latency-readout">
            <span className="latency-val">{scanLatencyMs} ms</span>
            <span className="latency-sub">Report Interval</span>
          </div>
        </div>

        <div className="control-block">
          <label className="control-label">USB / 2.4GHz Polling Rate (Hz)</label>
          <div className="polling-grid">
            {POLLING_RATES.map((hz) => (
              <button
                key={hz}
                type="button"
                className={`polling-btn ${activeProfile.pollingRateHz === hz ? 'active' : ''}`}
                onClick={() => setPollingRate(hz)}
              >
                <span className="hz-num">{hz >= 1000 ? `${hz / 1000}K` : hz}</span>
                <span className="hz-unit">{hz}Hz</span>
              </button>
            ))}
          </div>
        </div>

        <div className="control-split-row">
          <div className="control-block">
            <label className="control-label">
              <Laptop size={14} /> Operating System Mode
            </label>
            <div className="pill-segmented full-width">
              <button
                type="button"
                className={`pill-btn ${activeProfile.systemMode === 'win' ? 'active' : ''}`}
                onClick={() => setSystemMode('win')}
              >
                Windows / Linux (Win/Alt)
              </button>
              <button
                type="button"
                className={`pill-btn ${activeProfile.systemMode === 'mac' ? 'active' : ''}`}
                onClick={() => setSystemMode('mac')}
              >
                macOS (Opt/Cmd)
              </button>
            </div>
          </div>
        </div>

        <div className="toggle-feature-row">
          <div>
            <div className="toggle-feature-title">
              <Zap size={15} style={{ color: '#fbbf24' }} />
              <span>Tachyon Ultra-Low Latency Matrix Scan</span>
            </div>
            <p className="toggle-feature-desc">
              Prioritizes ADC Hall-sensor scanning over complex RGB calculations for sub-0.2ms key response.
            </p>
          </div>
          <button
            type="button"
            className={`switch-toggle ${activeProfile.tachyonLowLatency ? 'on' : ''}`}
            onClick={() => setTachyonMode(!activeProfile.tachyonLowLatency)}
            aria-pressed={activeProfile.tachyonLowLatency}
          >
            <span className="switch-thumb" />
          </button>
        </div>

        <div className="slider-control-row">
          <div className="slider-header">
            <span>Wireless Idle Sleep Timeout</span>
            <strong>{activeProfile.sleepMinutes} min</strong>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={activeProfile.sleepMinutes}
            onChange={(e) => setSleepMinutes(Number(e.target.value))}
            className="m3-slider"
          />
        </div>
      </section>

      {/* Card 3: Live WebHID Protocol & Frame Console */}
      <section className="m3-card span-12">
        <div className="card-header">
          <div>
            <div className="card-title-row">
              <Terminal size={19} style={{ color: '#38bdf8' }} />
              <h2>Live WebHID Protocol Frame Inspector</h2>
              <span className="pill-badge badge-neutral">{packetLogs.length} Frames</span>
            </div>
            <p className="card-subtitle">
              Frames are shown as a staging preview. When a VIA board is connected, real commands are
              sent as 32-byte reports on report ID 0 and replies are logged as they arrive.
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={clearPacketLogs}>
            <Trash2 size={15} />
            <span>Clear Log</span>
          </button>
        </div>

        <div className="hid-console-table-wrap">
          <table className="hid-console-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Dir</th>
                <th>Command Opcode</th>
                <th>32-Byte HID Payload (Hex + CRC)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {packetLogs.map((pkt) => (
                <tr key={pkt.id}>
                  <td className="mono-cell">{pkt.timestamp}</td>
                  <td>
                    <span className="dir-tag">{pkt.direction}</span>
                  </td>
                  <td className="cmd-cell">
                    <Radio size={13} style={{ color: '#60a5fa' }} />
                    <span>{pkt.commandName}</span>
                  </td>
                  <td className="mono-cell hex-payload">{pkt.hexBytes}</td>
                  <td>
                    <span className={`status-pill status-${pkt.status}`}>
                      {pkt.status === 'confirmed' ? (
                        <>
                          <ShieldCheck size={12} /> WebHID ACK
                        </>
                      ) : pkt.status === 'error' ? (
                        <>
                          <ShieldCheck size={12} /> Rejected
                        </>
                      ) : (
                        <>
                          <Cpu size={12} /> Sim Frame
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
