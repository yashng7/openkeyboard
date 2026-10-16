import { SwitchSoundProfile } from '@/types/keyboard';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSwitchSound(profile: SwitchSoundProfile, isKeyUp = false): void {
  if (profile === 'off') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Configure acoustic profile
  if (profile === 'lekker_he') {
    // Smooth linear Hall-Effect magnetic bottom-out / top-out
    osc.type = 'triangle';
    const baseFreq = isKeyUp ? 210 : 165;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.038);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, now);
    gain.gain.setValueAtTime(isKeyUp ? 0.08 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
  } else if (profile === 'oil_king_thock') {
    // Deep, muted "thock" POM/Nylon housing acoustic
    osc.type = 'sine';
    const baseFreq = isKeyUp ? 150 : 120;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.05);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);
    gain.gain.setValueAtTime(isKeyUp ? 0.1 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
  } else if (profile === 'holy_panda') {
    // Crisp tactile bump + rounded bottom out
    osc.type = 'sawtooth';
    const baseFreq = isKeyUp ? 310 : 260;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.035);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(1.8, now);
    gain.gain.setValueAtTime(isKeyUp ? 0.09 : 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
  } else if (profile === 'box_jade_clicky') {
    // Sharp click-bar snap
    osc.type = 'square';
    const baseFreq = isKeyUp ? 1400 : 1850;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.025);
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(700, now);
    gain.gain.setValueAtTime(isKeyUp ? 0.06 : 0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
  }

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}
