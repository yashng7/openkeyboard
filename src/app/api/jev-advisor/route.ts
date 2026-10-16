import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { JevAdvisorDecisionResponse } from '@/types/keyboard';

const OPENROUTER_DECISIONS_URL = 'https://openrouter.ai/api/alpha/decisions';
const JEV_MODEL = 'typesafe/jev-1.13';

function getServerOpenRouterKey(): string | null {
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim()) {
    return process.env.OPENROUTER_API_KEY.trim();
  }

  // Fallback 1: Windows User Environment Registry (matching jev skill decide.py)
  if (process.platform === 'win32') {
    try {
      const output = execSync('reg query "HKCU\\Environment" /v OPENROUTER_API_KEY', {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const match = output.match(/OPENROUTER_API_KEY\s+REG_\w+\s+([^\r\n]+)/i);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    } catch {
      // Ignore registry read error
    }
  }

  // Fallback 2: ~/.openrouter/key
  try {
    const keyPath = path.join(os.homedir(), '.openrouter', 'key');
    if (fs.existsSync(keyPath)) {
      const val = fs.readFileSync(keyPath, 'utf-8').trim();
      if (val) return val;
    }
  } catch {
    // Ignore file read error
  }

  return null;
}

function buildSynthesizedConfig(
  genreChoice: 'fps_tac' | 'rhythm_speed' | 'moba_mmo' | 'coding_ergo' | 'hybrid_daily',
  aggressivenessScore: number,
  socdNoul: number,
  rtNoul: number
): JevAdvisorDecisionResponse['synthesizedConfig'] {
  const enableRt = rtNoul >= 0.45;
  const enableSocd = socdNoul >= 0.45;

  if (genreChoice === 'fps_tac') {
    const wasdMm = aggressivenessScore >= 2.3 ? 0.3 : aggressivenessScore >= 1.5 ? 0.45 : 0.7;
    const rtSens = aggressivenessScore >= 2.3 ? 0.12 : 0.18;
    return {
      profileName: 'Jev Calibrated: Tac-FPS Snap-Tap Pro',
      summary: `Jev classified your scenario as Competitive Tactical FPS. Configured ${wasdMm.toFixed(2)}mm hair-trigger WASD actuation, ${rtSens.toFixed(2)}mm Continuous Rapid Trigger, 8000Hz Tachyon scan, and Last-Key Priority SOCD (Snap Tap) on A+D for instant zero-inertia counter-strafing.`,
      wasdActuationMm: wasdMm,
      generalActuationMm: 1.4,
      rapidTrigger: enableRt,
      rtPressMm: rtSens,
      rtReleaseMm: rtSens,
      enableSocdAD: enableSocd,
      socdMode: 'last_priority',
      pollingRateHz: 8000,
      tachyonLowLatency: true,
      lightingEffect: 'static_solid',
      primaryHex: '#5dde89',
      secondaryHex: '#38bdf8',
    };
  }

  if (genreChoice === 'rhythm_speed') {
    return {
      profileName: 'Jev Calibrated: Rhythm / Osu! Hyper-Stream',
      summary:
        'Jev detected high-BPM rhythm/streaming requirements. Tuned ultra-shallow 0.20mm actuation with 0.10mm Continuous Rapid Trigger and 8000Hz polling to maximize stamina and eliminate key-lock during 240+ BPM streams.',
      wasdActuationMm: 0.2,
      generalActuationMm: 0.35,
      rapidTrigger: true,
      rtPressMm: 0.1,
      rtReleaseMm: 0.1,
      enableSocdAD: false,
      socdMode: 'neutral',
      pollingRateHz: 8000,
      tachyonLowLatency: true,
      lightingEffect: 'reactive_ripple',
      primaryHex: '#f472b6',
      secondaryHex: '#60a5fa',
    };
  }

  if (genreChoice === 'moba_mmo') {
    return {
      profileName: 'Jev Calibrated: MOBA / ARPG Quick-Cast',
      summary:
        'Jev optimized for ability quick-casting (Q/W/E/R/D/F). Set 0.80mm responsive actuation with 0.20mm Rapid Trigger reset to prevent accidental double-ultimates while keeping combo weaves snappy at 4000Hz.',
      wasdActuationMm: 0.8,
      generalActuationMm: 1.2,
      rapidTrigger: enableRt,
      rtPressMm: 0.2,
      rtReleaseMm: 0.2,
      enableSocdAD: false,
      socdMode: 'last_priority',
      pollingRateHz: 4000,
      tachyonLowLatency: true,
      lightingEffect: 'aurora_borealis',
      primaryHex: '#c084fc',
      secondaryHex: '#38bdf8',
    };
  }

  if (genreChoice === 'coding_ergo') {
    return {
      profileName: 'Jev Calibrated: Deep-Work Engineering & Vim',
      summary:
        'Jev prioritized typo elimination and finger comfort. Set a deliberate 2.00mm actuation point, disabled hair-trigger Rapid Trigger & SOCD to prevent accidental adjacent keystrokes, and set 1000Hz power-efficient polling.',
      wasdActuationMm: 2.0,
      generalActuationMm: 2.0,
      rapidTrigger: false,
      rtPressMm: 0.4,
      rtReleaseMm: 0.4,
      enableSocdAD: false,
      socdMode: 'neutral',
      pollingRateHz: 1000,
      tachyonLowLatency: false,
      lightingEffect: 'breathing_pulse',
      primaryHex: '#fbbf24',
      secondaryHex: '#60a5fa',
    };
  }

  return {
    profileName: 'Jev Calibrated: Balanced All-Rounder HE',
    summary:
      'Jev selected a balanced hybrid configuration: 1.00mm WASD actuation with 0.25mm Rapid Trigger and 1.60mm general typing keys, offering responsive gaming control without sacrificing everyday typing accuracy.',
    wasdActuationMm: 1.0,
    generalActuationMm: 1.6,
    rapidTrigger: enableRt,
    rtPressMm: 0.25,
    rtReleaseMm: 0.25,
    enableSocdAD: enableSocd,
    socdMode: 'last_priority',
    pollingRateHz: 4000,
    tachyonLowLatency: false,
    lightingEffect: 'wave_spectrum',
    primaryHex: '#60a5fa',
    secondaryHex: '#5dde89',
  };
}

export async function POST(req: NextRequest) {
  const start = performance.now();
  try {
    const body = await req.json();
    const userPrompt = String(body?.prompt || '').trim();

    if (!userPrompt) {
      return NextResponse.json({ error: 'Please describe your game, playstyle, or typing workflow.' }, { status: 400 });
    }

    const apiKey = getServerOpenRouterKey();

    const questions = {
      recommendedGenre: {
        type: 'choice',
        instructions: 'Which keyboard tuning archetype best fits this user scenario?',
        criteria: {
          fps_tac: 'Competitive shooters (CS2, Valorant, Apex, Overwatch) needing counter-strafing, fast movement, and low latency',
          rhythm_speed: 'Rhythm games (osu!, mania, StepMania, Geometry Dash) needing ultra-fast repeated key taps and minimal actuation',
          moba_mmo: 'MOBA, RTS, or MMO games (League of Legends, Dota 2, WoW, FFXIV) needing reliable ability casting and macros',
          coding_ergo: 'Programming, software development, writing, office work, Vim/Emacs, or reducing typos and accidental presses',
          hybrid_daily: 'General mixed use, casual gaming, and everyday productivity',
        },
      },
      actuationAggressivenessScore: {
        type: 'score',
        instructions: 'How aggressive (shallow/hair-trigger) should the switch actuation point be?',
        criteria: [
          'Deliberate (2.0mm+): Maximum typo prevention for heavy typists',
          'Balanced (1.2mm-1.6mm): Comfortable hybrid feel',
          'Fast (0.5mm-0.9mm): Competitive gaming responsiveness',
          'Extreme Hair-Trigger (0.1mm-0.4mm): Pro esports instant actuation',
        ],
      },
      enableSocdSnapTap: {
        type: 'noul',
        instructions: 'Should SOCD (Snap Tap / Last-Key Priority on opposite movement keys A+D) be enabled for this user?',
        criteria: {
          true: 'User plays FPS/movement games or wants instant directional changes and counter-strafing',
          false: 'User is typing, coding, or playing games where SOCD is unneeded',
        },
      },
      enableRapidTrigger: {
        type: 'noul',
        instructions: 'Should Hall-Effect Rapid Trigger dynamic reset be enabled?',
        criteria: {
          true: 'Gaming, rhythm, or fast repetitive input where instant key reset helps',
          false: 'Pure typing/office/programming where traditional fixed hysteresis is preferred',
        },
      },
    };

    if (apiKey) {
      const response = await fetch(OPENROUTER_DECISIONS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://openkeyboard.local',
          'X-Title': 'OpenKeyboard Jev Advisor',
        },
        body: JSON.stringify({
          model: JEV_MODEL,
          state: `User Keyboard Tuning Request: ${userPrompt}`,
          questions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const elapsed = Math.round(performance.now() - start);
        const ans = data.answers || {};

        const genreChoice = (ans.recommendedGenre?.choice || 'hybrid_daily') as
          | 'fps_tac'
          | 'rhythm_speed'
          | 'moba_mmo'
          | 'coding_ergo'
          | 'hybrid_daily';
        const scoreVal = typeof ans.actuationAggressivenessScore?.score === 'number' ? ans.actuationAggressivenessScore.score : 2.0;
        const socdNoul = typeof ans.enableSocdSnapTap?.noul === 'number' ? ans.enableSocdSnapTap.noul : 0.5;
        const rtNoul = typeof ans.enableRapidTrigger?.noul === 'number' ? ans.enableRapidTrigger.noul : 0.7;

        const scoreLabels = [
          'Deliberate (2.0mm+)',
          'Balanced (1.2mm–1.6mm)',
          'Fast (0.5mm–0.9mm)',
          'Extreme Hair-Trigger (0.1mm–0.4mm)',
        ];
        const roundedIdx = Math.min(3, Math.max(0, Math.round(scoreVal)));

        const payload: JevAdvisorDecisionResponse = {
          success: true,
          latencyMs: elapsed,
          model: data.model || JEV_MODEL,
          usedLiveJev: true,
          decisions: {
            recommendedGenre: {
              choice: genreChoice,
              confidence: ans.recommendedGenre?.confidence ?? 0.92,
              probabilities: ans.recommendedGenre?.probabilities ?? { [genreChoice]: 1 },
            },
            actuationAggressivenessScore: {
              score: Number(scoreVal.toFixed(2)),
              confidence: ans.actuationAggressivenessScore?.confidence ?? 0.88,
              label: scoreLabels[roundedIdx],
            },
            enableSocdSnapTap: {
              noul: Number(socdNoul.toFixed(2)),
            },
            enableRapidTrigger: {
              noul: Number(rtNoul.toFixed(2)),
            },
          },
          synthesizedConfig: buildSynthesizedConfig(genreChoice, scoreVal, socdNoul, rtNoul),
        };

        return NextResponse.json(payload);
      }
    }

    // Deterministic Local Calibration Fallback if offline
    const lower = userPrompt.toLowerCase();
    let genreChoice: 'fps_tac' | 'rhythm_speed' | 'moba_mmo' | 'coding_ergo' | 'hybrid_daily' = 'hybrid_daily';
    let scoreVal = 1.8;
    let socdNoul = 0.35;
    let rtNoul = 0.65;

    if (/valorant|cs2|counter-strike|apex|overwatch|strafe|fps|shooter|jett/.test(lower)) {
      genreChoice = 'fps_tac';
      scoreVal = 2.85;
      socdNoul = 0.96;
      rtNoul = 0.98;
    } else if (/osu|rhythm|mania|bpm|stream|tap|geometry/.test(lower)) {
      genreChoice = 'rhythm_speed';
      scoreVal = 2.95;
      socdNoul = 0.22;
      rtNoul = 0.99;
    } else if (/league|moba|dota|mmo|wow|rpg|macro|cast/.test(lower)) {
      genreChoice = 'moba_mmo';
      scoreVal = 2.1;
      socdNoul = 0.3;
      rtNoul = 0.82;
    } else if (/code|coding|vim|neovim|program|typing|typo|write|office|ergo/.test(lower)) {
      genreChoice = 'coding_ergo';
      scoreVal = 0.35;
      socdNoul = 0.04;
      rtNoul = 0.08;
    }

    const elapsed = Math.round(performance.now() - start);
    const payload: JevAdvisorDecisionResponse = {
      success: true,
      latencyMs: elapsed,
      model: `${JEV_MODEL} (local-calibrated)`,
      usedLiveJev: false,
      decisions: {
        recommendedGenre: {
          choice: genreChoice,
          confidence: 0.91,
          probabilities: {
            fps_tac: genreChoice === 'fps_tac' ? 0.91 : 0.03,
            rhythm_speed: genreChoice === 'rhythm_speed' ? 0.91 : 0.02,
            moba_mmo: genreChoice === 'moba_mmo' ? 0.91 : 0.02,
            coding_ergo: genreChoice === 'coding_ergo' ? 0.91 : 0.02,
            hybrid_daily: genreChoice === 'hybrid_daily' ? 0.88 : 0.03,
          },
        },
        actuationAggressivenessScore: {
          score: scoreVal,
          confidence: 0.89,
          label: scoreVal > 2.2 ? 'Extreme Hair-Trigger (0.1mm–0.4mm)' : scoreVal < 1.0 ? 'Deliberate (2.0mm+)' : 'Fast (0.5mm–0.9mm)',
        },
        enableSocdSnapTap: { noul: socdNoul },
        enableRapidTrigger: { noul: rtNoul },
      },
      synthesizedConfig: buildSynthesizedConfig(genreChoice, scoreVal, socdNoul, rtNoul),
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to evaluate profile with Jev' },
      { status: 500 }
    );
  }
}
