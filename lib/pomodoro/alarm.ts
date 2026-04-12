"use client";

/**
 * Pomodoro alarm: short beep sequence via Web Audio (no assets needed)
 * + haptic vibration. Works offline.
 */

type Kind = "work-end" | "break-end";

// Singleton AudioContext — iOS requires it to be created after a user gesture,
// so we lazily instantiate and keep it around.
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioCtx = new Ctor();
  } catch {
    return null;
  }
  return audioCtx;
}

/**
 * Must be called inside a user gesture at least once to unlock audio on iOS.
 */
export function unlockAudio() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  // Play an inaudible blip to warm up iOS.
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.01);
  } catch {
    /* ignore */
  }
}

function beep(freq: number, durationMs: number, when = 0, volume = 0.4) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const start = ctx.currentTime + when;
  const stop = start + durationMs / 1000;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, stop);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(stop + 0.02);
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate === "function") {
    try {
      nav.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

export function playAlarm(
  kind: Kind,
  options: { sound: boolean; vibrate: boolean } = { sound: true, vibrate: true }
) {
  if (options.sound) {
    if (kind === "work-end") {
      // Bright ascending triple beep — "ding ding ding"
      beep(880, 200, 0.0);
      beep(1108, 200, 0.3);
      beep(1318, 400, 0.6);
    } else {
      // Softer double beep — "back to work"
      beep(660, 250, 0.0);
      beep(880, 350, 0.35);
    }
  }
  if (options.vibrate) {
    vibrate(kind === "work-end" ? [200, 120, 200, 120, 400] : [150, 100, 150]);
  }
}

// ---------------------------------------------------------------------------
// Screen Wake Lock (keep screen on while timer runs)
// ---------------------------------------------------------------------------

type WakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock() {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & {
    wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> };
  };
  if (!nav.wakeLock) return;
  try {
    wakeLock = await nav.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });
  } catch {
    /* ignore — user may have denied, or tab not visible */
  }
}

export async function releaseWakeLock() {
  if (wakeLock) {
    try {
      await wakeLock.release();
    } catch {
      /* ignore */
    }
    wakeLock = null;
  }
}
