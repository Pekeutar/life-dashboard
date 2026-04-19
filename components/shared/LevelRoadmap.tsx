"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, X } from "lucide-react";
import {
  LEVELS,
  PILLAR_RANKS,
  getLevelProgress,
  getPillarRankProgress,
  getTitle,
  type Level,
  type PillarRank,
} from "@/lib/gamification";

interface Props {
  open: boolean;
  onClose: () => void;
  totalXp: number;
  mode: "global" | "pillar";
  pillarLabel?: string;
}

export default function LevelRoadmap({
  open,
  onClose,
  totalXp,
  mode,
  pillarLabel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col rounded-none bg-[var(--color-bg-elevated)] ghost-border"
            style={{
              maxHeight: "85vh",
              paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
            }}
          >
            {/* Header */}
            <div className="shrink-0 px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    {mode === "global"
                      ? "Niveaux"
                      : `Rangs ${pillarLabel ?? ""}`}
                  </h2>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    {totalXp.toLocaleString("fr-FR")} XP{" "}
                    {mode === "global" ? "total" : pillarLabel ?? ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ghost-border active:scale-95"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {mode === "global" ? (
                <GlobalRoadmap totalXp={totalXp} />
              ) : (
                <PillarRoadmap totalXp={totalXp} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GlobalRoadmap({ totalXp }: { totalXp: number }) {
  const { level: current, progress, star } = getLevelProgress(totalXp);

  return (
    <div className="flex flex-col gap-2">
      {LEVELS.map((lvl, i) => {
        const completed = totalXp >= lvl.max;
        const isCurrent = lvl.id === current.id;
        const locked = totalXp < lvl.min;

        return (
          <TierRow
            key={lvl.id}
            emoji={lvl.emoji}
            label={lvl.label}
            subtitle={getTitle(lvl)}
            color={lvl.color}
            minXp={lvl.min}
            maxXp={lvl.max === Infinity ? null : lvl.max}
            completed={completed}
            isCurrent={isCurrent}
            locked={locked}
            progress={isCurrent ? progress : undefined}
            star={isCurrent ? star : undefined}
            isLast={i === LEVELS.length - 1}
          />
        );
      })}
    </div>
  );
}

function PillarRoadmap({ totalXp }: { totalXp: number }) {
  const { rank: current, progress } = getPillarRankProgress(totalXp);

  return (
    <div className="flex flex-col gap-2">
      {PILLAR_RANKS.map((rank, i) => {
        const completed = totalXp >= rank.max;
        const isCurrent = rank.id === current.id;
        const locked = totalXp < rank.min;

        return (
          <TierRow
            key={rank.id}
            emoji={rank.emoji}
            label={rank.label}
            color={rank.color}
            minXp={rank.min}
            maxXp={rank.max === Infinity ? null : rank.max}
            completed={completed}
            isCurrent={isCurrent}
            locked={locked}
            progress={isCurrent ? progress : undefined}
            isLast={i === PILLAR_RANKS.length - 1}
          />
        );
      })}
    </div>
  );
}

interface TierRowProps {
  emoji: string;
  label: string;
  subtitle?: string;
  color: string;
  minXp: number;
  maxXp: number | null;
  completed: boolean;
  isCurrent: boolean;
  locked: boolean;
  progress?: number;
  star?: 1 | 2 | 3;
  isLast: boolean;
}

function TierRow({
  emoji,
  label,
  subtitle,
  color,
  minXp,
  maxXp,
  completed,
  isCurrent,
  locked,
  progress,
  star,
  isLast,
}: TierRowProps) {
  return (
    <div
      className={
        "relative rounded-none px-4 py-3 transition-all " +
        (isCurrent
          ? "bg-[var(--color-surface)]"
          : completed
            ? "bg-[var(--color-surface)]/80 ghost-border"
            : "bg-[var(--color-surface)]/40 ghost-border/50")
      }
      style={
        isCurrent
          ? { boxShadow: `inset 0 0 0 2px ${color}` }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-none text-xl ember-emoji ghost-border " +
            (locked ? "opacity-40" : "")
          }
          style={{
            background: locked ? "var(--color-surface-2)" : `${color}22`,
          }}
        >
          {emoji}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={
                "text-sm font-semibold " +
                (locked
                  ? "text-[var(--color-text-subtle)]"
                  : "text-[var(--color-text)]")
              }
            >
              {label}
            </p>
            {isCurrent && star && (
              <span className="text-xs" style={{ color }}>
                {"★".repeat(star)}
                {"☆".repeat(3 - star)}
              </span>
            )}
          </div>
          {subtitle && (
            <p
              className={
                "text-[11px] " +
                (locked
                  ? "text-[var(--color-text-subtle)]/50"
                  : "text-[var(--color-text-subtle)]")
              }
            >
              {subtitle}
            </p>
          )}
          <p
            className={
              "mt-0.5 text-[10px] " +
              (locked
                ? "text-[var(--color-text-subtle)]/40"
                : "text-[var(--color-text-muted)]")
            }
          >
            {minXp.toLocaleString("fr-FR")} XP
            {maxXp ? ` → ${maxXp.toLocaleString("fr-FR")} XP` : "+"}
          </p>
        </div>

        {/* Status badge */}
        {completed && (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: `${color}22`, color }}
          >
            <Check size={14} strokeWidth={3} />
          </div>
        )}
        {isCurrent && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: `${color}22`, color }}
          >
            Actuel
          </span>
        )}
        {locked && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-subtle)]">
            <Lock size={12} />
          </div>
        )}
      </div>

      {/* Progress bar for current */}
      {isCurrent && progress !== undefined && (
        <div className="mt-2.5">
          <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: color }}
            />
          </div>
          <p className="mt-1 text-right text-[10px] text-[var(--color-text-subtle)]">
            {Math.round(progress * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}
