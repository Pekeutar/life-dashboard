"use client";

import { motion } from "framer-motion";
import { FEELING_EMOJIS } from "@/lib/sport/constants";
import { useSportMetas } from "@/lib/sport/meta";
import type { Workout } from "@/lib/sport/types";
import { formatDuration, formatDistance, formatRelativeDate } from "@/lib/utils";

interface Props {
  workout: Workout;
  onClick?: () => void;
}

export default function WorkoutCard({ workout, onClick }: Props) {
  const { resolve } = useSportMetas();
  const sport = resolve(workout.type);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-3 rounded-none bg-[var(--color-surface)] px-4 py-3 text-left ghost-border active:bg-[var(--color-surface-2)]"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none text-2xl ember-emoji ghost-border"
        style={{ background: `${sport.color}22` }}
      >
        {sport.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[var(--color-text)]">
            {sport.label}
          </h3>
          <span className="shrink-0 text-[11px] text-[var(--color-text-subtle)]">
            {formatRelativeDate(workout.date)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>{formatDuration(workout.durationMin)}</span>
          {workout.distanceKm != null && (
            <>
              <span className="text-[var(--color-text-subtle)]">·</span>
              <span>{formatDistance(workout.distanceKm)}</span>
            </>
          )}
          <span className="text-[var(--color-text-subtle)]">·</span>
          <span>+{workout.xp} XP</span>
          <span className="ml-auto text-base">{FEELING_EMOJIS[workout.feeling - 1]}</span>
        </div>
      </div>
    </motion.button>
  );
}
