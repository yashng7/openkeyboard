# OpenKeyboard

Browser-based WebHID control panel for supported mechanical & Hall-effect (magnetic) gaming keyboards — tune per-key actuation (`0.1mm–4.0mm`), Rapid Trigger, SOCD / Snap Tap, multi-layer keymaps, per-key RGB, macros, and **TypeSafe Jev (`typesafe/jev-1.13`)** smart profiles without installing brand bloatware.

Inspired by [OpenMouse-Project/openmouse](https://github.com/OpenMouse-Project/openmouse), built in **Next.js (App Router + TypeScript)** with the **OpenMouse Material Design 3 (M3)** 5-theme token system (`Dark`, `Light`, `Ocean`, `NieR`, `Catppuccin`).

## Features

1. **WebHID Engine + Virtual Hardware Simulator**:
   - Connect supported USB/2.4GHz keyboards via `navigator.hid` (Wooting, Keychron HE/QMK, Wuque Studio, NuPhy, MonsGeek/Akko, DrunkDeer, Razer, Generic VIA/QMK `0xFF60`).
   - Built-in interactive **Virtual Hardware Simulator** with 5 switchable boards (`Wooting 60HE+`, `Keychron Q1 HE 75%`, `Wuque Freya Ultra TKL`, `NuPhy Field75 HE`, `Keychron Q6 Max 100%`) and a live 32-byte HID frame inspector.
2. **Visual Keymap & Multi-Layer Remapper**:
   - Physical geometry switchers for `60%`, `65%`, `75%`, `TKL (80%)`, and `Full-Size (100%)`.
   - 4 hardware layers (`Layer 0 Base`, `Layer 1 Fn1`, `Layer 2 Fn2`, `Layer 3 Fn3`), Hyper/Meh/Mod-Tap keys, and live physical key-press capture.
3. **Magnetic / Hall-Effect Switch Tuning & SOCD (Snap Tap)**:
   - Per-key actuation point (`0.10mm` – `4.00mm`), Rapid Trigger press/release sensitivity (`0.05mm` – `2.00mm`), Continuous Rapid Trigger, and Top/Bottom deadzones.
   - **SOCD / Snap Tap** pair manager with live A+D counter-strafe tester and real-time **ADC Stem Travel Gauge**.
4. **RGB Lighting Studio & Per-Key LED Painter**:
   - 9 matrix effects, PWM brightness/speed controls, chassis underglow sync, and interactive per-key RGB brush painter.
5. **Macro Studio & Hardware Diagnostics**:
   - 8 on-board macro slots (`M1–M8`) with live keystroke timestamp recorder.
   - **NKRO Rollover Matrix Tester** and **Switch Chatter / Double-Bounce Analyzer** (`ms` delta tracking).
   - Built-in **Web Audio API Switch Acoustics Synthesizer** (`Lekker HE`, `Gateron Oil King Thock`, `Holy Panda`, `Box Jade Clicky`).
6. **TypeSafe Jev-1.13 Smart Profile Advisor**:
   - Server-side Next.js API route (`/api/jev-advisor`) querying `typesafe/jev-1.13` across `choice`, `score`, and `noul` primitives to auto-calibrate actuation, Rapid Trigger, SOCD, and polling rate for any game or workflow.

## Device detection

WebHID has no "enumerate every HID device" API — by design, a page can only see
devices the user has explicitly granted it. OpenKeyboard therefore:

1. On load, calls `navigator.hid.getDevices()` and lists already-authorised
   boards without prompting.
2. Subscribes to `connect` / `disconnect` events, so hot-plugged boards that were
   previously authorised appear immediately.
3. Prompts through `navigator.hid.requestDevice()` (the *Connect WebHID
   Keyboard* button) for boards that have never been paired.
4. Groups the per-interface `HIDDevice` objects Chrome returns into physical
   keyboards, and only ever talks to the vendor / VIA raw-HID collection —
   Chrome blocks reports on the protected keyboard and mouse collections.
5. Probes the VIA raw-HID interface with `id_get_protocol_version` (`0x01`) to
   confirm the board is really there and read its protocol, firmware and layer
   count.

A board that exposes no vendor interface is reported as **read-only** rather
than pretending settings were applied.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in Chrome, Edge, or Brave.
