"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import {
  DEFAULT_POMODORO_CONFIG,
  makeInitialState,
  type PomodoroConfig,
  type PomodoroPhase,
  type PomodoroRuntimeState,
} from "./types";
import {
  playAlarm,
  releaseWakeLock,
  requestWakeLock,
  unlockAudio,
} from "./alarm";

const CONFIG_KEY = "life-dashboard.pomodoro-config.v1";
const STATE_KEY = "life-dashboard.pomodoro-state.v1";

function phaseDurationMs(phase: PomodoroPhase, config: PomodoroConfig): number {
  if (phase === "work") return config.workMin * 60 * 1000;
  if (phase === "break") return config.breakMin * 60 * 1000;
  return config.longBreakMin * 60 * 1000;
}

function nextPhaseAfter(
  current: PomodoroPhase,
  completedCycles: number,
  config: PomodoroConfig
): { phase: PomodoroPhase; cyclesUpdate: number } {
  if (current === "work") {
    const newCount = completedCycles + 1;
    if (newCount >= config.cyclesBeforeLongBreak) {
      return { phase: "longBreak", cyclesUpdate: 0 };
    }
    return { phase: "break", cyclesUpdate: newCount };
  }
  // After any break, go back to work
  return { phase: "work", cyclesUpdate: completedCycles };
}

export function usePomodoro() {
  const [config, setConfig, configHydrated] = useLocalStorage<PomodoroConfig>(
    CONFIG_KEY,
    DEFAULT_POMODORO_CONFIG
  );
  const [state, setState, stateHydrated] = useLocalStorage<PomodoroRuntimeState>(
    STATE_KEY,
    makeInitialState(DEFAULT_POMODORO_CONFIG)
  );

  // Derived remaining ms, recomputed on each tick
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (state.pausedRemainingMs != null) return state.pausedRemainingMs;
    if (state.startedAt == null) return state.durationMs;
    return Math.max(0, state.startedAt + state.durationMs - Date.now());
  });

  const phaseEndedRef = useRef(false);
  const lastPhaseRef = useRef<PomodoroPhase>(state.phase);

  // Main tick loop — only runs while active (running, not paused, not finished)
  useEffect(() => {
    if (state.startedAt == null) {
      // paused or idle → remainingMs already correct
      return;
    }
    let rafId: number;
    const tick = () => {
      const remaining = Math.max(
        0,
        (state.startedAt as number) + state.durationMs - Date.now()
      );
      setRemainingMs(remaining);
      if (remaining <= 0) {
        if (!phaseEndedRef.current) {
          phaseEndedRef.current = true;
          handlePhaseEnd();
        }
      } else {
        rafId = window.setTimeout(tick, 250) as unknown as number;
      }
    };
    phaseEndedRef.current = false;
    tick();
    return () => {
      if (rafId) window.clearTimeout(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startedAt, state.durationMs, state.phase]);

  // Reset phaseEnded flag when the phase changes
  useEffect(() => {
    if (lastPhaseRef.current !== state.phase) {
      lastPhaseRef.current = state.phase;
      phaseEndedRef.current = false;
    }
  }, [state.phase]);

  // Cleanup wake lock on unmount (safety)
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  function handlePhaseEnd() {
    // Fire the alarm for the phase that just ended
    const ended = lastPhaseRef.current;
    playAlarm(ended === "work" ? "work-end" : "break-end", {
      sound: config.soundEnabled,
      vibrate: config.vibrateEnabled,
    });

    // Compute next phase
    const { phase: next, cyclesUpdate } = nextPhaseAfter(
      ended,
      state.completedWorkCycles,
      config
    );

    const accumulated =
      ended === "work"
        ? state.accumulatedWorkMin + config.workMin
        : state.accumulatedWorkMin;

    // Go to next phase in paused state (user explicitly starts it)
    setState({
      phase: next,
      startedAt: null,
      durationMs: phaseDurationMs(next, config),
      pausedRemainingMs: null,
      completedWorkCycles: cyclesUpdate,
      accumulatedWorkMin: accumulated,
    });
    setRemainingMs(phaseDurationMs(next, config));
    releaseWakeLock();
  }

  // ---------------- Actions ----------------

  const start = useCallback(() => {
    unlockAudio();
    requestWakeLock();
    const now = Date.now();
    const duration =
      state.pausedRemainingMs != null
        ? state.pausedRemainingMs
        : phaseDurationMs(state.phase, config);
    setState((prev) => ({
      ...prev,
      startedAt: now,
      durationMs: duration,
      pausedRemainingMs: null,
    }));
    setRemainingMs(duration);
  }, [state.pausedRemainingMs, state.phase, config, setState]);

  const pause = useCallback(() => {
    if (state.startedAt == null) return;
    const remaining = Math.max(
      0,
      state.startedAt + state.durationMs - Date.now()
    );
    setState((prev) => ({
      ...prev,
      startedAt: null,
      pausedRemainingMs: remaining,
    }));
    setRemainingMs(remaining);
    releaseWakeLock();
  }, [state.startedAt, state.durationMs, setState]);

  const reset = useCallback(() => {
    const duration = phaseDurationMs(state.phase, config);
    setState((prev) => ({
      ...prev,
      startedAt: null,
      durationMs: duration,
      pausedRemainingMs: null,
    }));
    setRemainingMs(duration);
    releaseWakeLock();
  }, [state.phase, config, setState]);

  const skipPhase = useCallback(() => {
    const { phase: next, cyclesUpdate } = nextPhaseAfter(
      state.phase,
      state.completedWorkCycles,
      config
    );
    const duration = phaseDurationMs(next, config);
    setState({
      phase: next,
      startedAt: null,
      durationMs: duration,
      pausedRemainingMs: null,
      completedWorkCycles: cyclesUpdate,
      accumulatedWorkMin: state.accumulatedWorkMin,
    });
    setRemainingMs(duration);
    releaseWakeLock();
  }, [state, config, setState]);

  const fullReset = useCallback(() => {
    const fresh = makeInitialState(config);
    setState(fresh);
    setRemainingMs(fresh.durationMs);
    releaseWakeLock();
  }, [config, setState]);

  const clearAccumulated = useCallback(() => {
    setState((prev) => ({ ...prev, accumulatedWorkMin: 0 }));
  }, [setState]);

  // When config changes and we're idle/paused, reset the current phase duration.
  useEffect(() => {
    if (state.startedAt == null && state.pausedRemainingMs == null) {
      const d = phaseDurationMs(state.phase, config);
      if (d !== state.durationMs) {
        setState((prev) => ({ ...prev, durationMs: d }));
        setRemainingMs(d);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.workMin, config.breakMin, config.longBreakMin]);

  const isRunning = state.startedAt != null;
  const isPaused = state.startedAt == null && state.pausedRemainingMs != null;
  const progress =
    state.durationMs > 0
      ? Math.min(1, Math.max(0, 1 - remainingMs / state.durationMs))
      : 0;

  return {
    config,
    setConfig,
    state,
    remainingMs,
    isRunning,
    isPaused,
    progress,
    start,
    pause,
    reset,
    skipPhase,
    fullReset,
    clearAccumulated,
    hydrated: configHydrated && stateHydrated,
  };
}
