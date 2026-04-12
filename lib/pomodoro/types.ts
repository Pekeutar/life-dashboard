export type PomodoroPhase = "work" | "break" | "longBreak";

export interface PomodoroConfig {
  workMin: number; // default 25
  breakMin: number; // default 5
  longBreakMin: number; // default 15
  cyclesBeforeLongBreak: number; // default 4
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workMin: 25,
  breakMin: 5,
  longBreakMin: 15,
  cyclesBeforeLongBreak: 4,
  soundEnabled: true,
  vibrateEnabled: true,
};

export interface PomodoroRuntimeState {
  phase: PomodoroPhase;
  /** null = not running; timestamp ms otherwise */
  startedAt: number | null;
  /** duration of the current phase in ms */
  durationMs: number;
  /** ms remaining when paused; null when running */
  pausedRemainingMs: number | null;
  /** work phases completed in the current cycle set (0..cyclesBeforeLongBreak) */
  completedWorkCycles: number;
  /** total work minutes accumulated since last "save session" */
  accumulatedWorkMin: number;
}

export function makeInitialState(config: PomodoroConfig): PomodoroRuntimeState {
  return {
    phase: "work",
    startedAt: null,
    durationMs: config.workMin * 60 * 1000,
    pausedRemainingMs: null,
    completedWorkCycles: 0,
    accumulatedWorkMin: 0,
  };
}
