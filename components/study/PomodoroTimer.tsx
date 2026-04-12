"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Volume2,
  VolumeX,
  Vibrate,
  X,
} from "lucide-react";
import { usePomodoro } from "@/lib/pomodoro/store";
import { useStudySessions } from "@/lib/study/store";
import { useStudyMetas } from "@/lib/study/meta";
import type { PomodoroPhase } from "@/lib/pomodoro/types";
import { playAlarm, unlockAudio } from "@/lib/pomodoro/alarm";
import { cn } from "@/lib/utils";

const ACCENT = "#a855f7";
const BREAK_COLOR = "#22c55e";

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: "Concentration",
  break: "Pause courte",
  longBreak: "Grande pause",
};

const PHASE_EMOJIS: Record<PomodoroPhase, string> = {
  work: "🧠",
  break: "☕",
  longBreak: "🌿",
};

function formatMMSS(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PomodoroTimer() {
  const router = useRouter();
  const {
    config,
    setConfig,
    state,
    remainingMs,
    isRunning,
    progress,
    start,
    pause,
    reset,
    skipPhase,
    fullReset,
    clearAccumulated,
    hydrated,
  } = usePomodoro();

  const { add: addSession } = useStudySessions();
  const { all: topics } = useStudyMetas();

  const [selectedTopic, setSelectedTopic] = useState<string>("programming");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);

  const color = state.phase === "work" ? ACCENT : BREAK_COLOR;

  // SVG circle math
  const size = 260;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  const cyclesDots = useMemo(
    () =>
      Array.from({ length: config.cyclesBeforeLongBreak }, (_, i) => i),
    [config.cyclesBeforeLongBreak]
  );

  if (!hydrated) {
    return (
      <div className="px-5">
        <div className="mx-auto h-64 w-64 animate-pulse rounded-full bg-[var(--color-surface)]" />
      </div>
    );
  }

  function handleMainAction() {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }

  function handleSaveAccumulated() {
    if (state.accumulatedWorkMin <= 0) return;
    addSession({
      date: new Date().toISOString(),
      topic: selectedTopic,
      title: "Session Pomodoro",
      durationMin: state.accumulatedWorkMin,
      focus: 4, // In flow — par défaut, modifiable plus tard
    });
    clearAccumulated();
    setSaveOpen(false);
    router.push("/etude");
  }

  return (
    <div className="flex flex-col items-center gap-6 px-5 pb-8">
      {/* Topic picker */}
      <div className="w-full">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Sujet d&apos;étude
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {topics.map((t) => {
            const active = selectedTopic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopic(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-[var(--color-surface-2)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]"
                )}
                style={
                  active
                    ? { boxShadow: `inset 0 0 0 2px ${t.color}`, color: t.color }
                    : undefined
                }
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase label */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
          style={{ background: `${color}22`, color }}
        >
          <span>{PHASE_EMOJIS[state.phase]}</span>
          {PHASE_LABELS[state.phase]}
        </div>
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="-rotate-90 drop-shadow-[0_0_40px_rgba(168,85,247,0.15)]"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-surface-2)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular-nums text-6xl font-bold tracking-tight">
            {formatMMSS(remainingMs)}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-widest text-[var(--color-text-subtle)]">
            {isRunning
              ? "En cours"
              : state.pausedRemainingMs != null
                ? "En pause"
                : "Prêt"}
          </span>
        </div>
      </div>

      {/* Cycles progress */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
          Cycle
        </span>
        {cyclesDots.map((i) => {
          const done = i < state.completedWorkCycles;
          return (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full transition-colors"
              style={{
                background: done ? ACCENT : "var(--color-surface-2)",
              }}
            />
          );
        })}
        <span className="ml-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
          {state.completedWorkCycles}/{config.cyclesBeforeLongBreak}
        </span>
      </div>

      {/* Main controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
          aria-label="Réinitialiser"
        >
          <RotateCcw size={18} />
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={handleMainAction}
          className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl"
          style={{
            background: color,
            boxShadow: `0 20px 50px -15px ${color}`,
          }}
          aria-label={isRunning ? "Pause" : "Démarrer"}
        >
          {isRunning ? (
            <Pause size={32} fill="currentColor" />
          ) : (
            <Play size={32} fill="currentColor" className="translate-x-0.5" />
          )}
        </motion.button>

        <button
          type="button"
          onClick={skipPhase}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
          aria-label="Passer la phase"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Accumulated work time + save */}
      <div className="flex w-full flex-col gap-2 rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              Temps de travail accumulé
            </p>
            <p className="mt-0.5 text-2xl font-bold" style={{ color: ACCENT }}>
              {state.accumulatedWorkMin} min
            </p>
          </div>
          <button
            type="button"
            disabled={state.accumulatedWorkMin <= 0}
            onClick={() => setSaveOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            <Check size={14} />
            Enregistrer
          </button>
        </div>
        <p className="text-[11px] text-[var(--color-text-subtle)]">
          Sauvegarde ton temps de concentration en session d&apos;étude quand tu
          veux faire une pause.
        </p>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-subtle)]">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-3 py-1.5 ring-1 ring-[var(--color-border)] active:scale-95"
        >
          <Settings2 size={12} /> Réglages
        </button>
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            playAlarm("work-end", {
              sound: config.soundEnabled,
              vibrate: config.vibrateEnabled,
            });
          }}
          className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-3 py-1.5 ring-1 ring-[var(--color-border)] active:scale-95"
        >
          {config.soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          Tester l&apos;alarme
        </button>
      </div>

      {/* Settings bottom sheet */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-border)]"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
            >
              <div className="px-6 pt-4">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Réglages Pomodoro</h2>
                    <p className="text-xs text-[var(--color-text-subtle)]">
                      Ajuste à ton rythme
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
                    aria-label="Fermer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <MinutesRow
                  label="Concentration"
                  value={config.workMin}
                  min={5}
                  max={90}
                  step={5}
                  onChange={(v) => setConfig({ ...config, workMin: v })}
                />
                <MinutesRow
                  label="Pause courte"
                  value={config.breakMin}
                  min={1}
                  max={30}
                  step={1}
                  onChange={(v) => setConfig({ ...config, breakMin: v })}
                />
                <MinutesRow
                  label="Grande pause"
                  value={config.longBreakMin}
                  min={5}
                  max={60}
                  step={5}
                  onChange={(v) => setConfig({ ...config, longBreakMin: v })}
                />
                <MinutesRow
                  label="Cycles avant grande pause"
                  value={config.cyclesBeforeLongBreak}
                  min={2}
                  max={8}
                  step={1}
                  suffix=""
                  onChange={(v) =>
                    setConfig({ ...config, cyclesBeforeLongBreak: v })
                  }
                />

                <div className="mt-4 flex flex-col gap-2">
                  <ToggleRow
                    icon={<Volume2 size={16} />}
                    label="Son de l'alarme"
                    value={config.soundEnabled}
                    onChange={(v) =>
                      setConfig({ ...config, soundEnabled: v })
                    }
                  />
                  <ToggleRow
                    icon={<Vibrate size={16} />}
                    label="Vibration"
                    value={config.vibrateEnabled}
                    onChange={(v) =>
                      setConfig({ ...config, vibrateEnabled: v })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    fullReset();
                    setSettingsOpen(false);
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3 text-sm font-semibold text-red-400 ring-1 ring-red-500/30 active:scale-95"
                >
                  <RotateCcw size={14} />
                  Tout réinitialiser
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save confirmation sheet */}
      <AnimatePresence>
        {saveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSaveOpen(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-border)]"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
            >
              <div className="px-6 pt-4">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
                <h2 className="text-lg font-bold">Enregistrer la session ?</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {state.accumulatedWorkMin} min de concentration seront
                  ajoutées à ton historique d&apos;études avec un focus « En
                  flow » 🎯.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSaveOpen(false)}
                    className="flex-1 rounded-2xl bg-[var(--color-surface)] py-3 text-sm font-semibold ring-1 ring-[var(--color-border)] active:scale-95"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAccumulated}
                    className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white active:scale-95"
                    style={{ background: ACCENT }}
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Small UI bits
// -----------------------------------------------------------------------------

function MinutesRow({
  label,
  value,
  min,
  max,
  step,
  suffix = " min",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: ACCENT }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] active:scale-95"
        >
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="lv-slider--level flex-1"
          style={{ accentColor: ACCENT }}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-2xl bg-[var(--color-surface)] px-4 py-3 ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
    >
      <div className="flex items-center gap-3">
        <span className="text-[var(--color-text-muted)]">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div
        className="relative h-6 w-11 rounded-full transition"
        style={{ background: value ? ACCENT : "var(--color-surface-2)" }}
      >
        <motion.div
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        />
      </div>
    </button>
  );
}
