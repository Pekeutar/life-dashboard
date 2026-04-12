"use client";

import { motion } from "framer-motion";
import { getLevelProgress } from "@/lib/sport/xp";

interface Props {
  totalXp: number;
}

export default function LevelBadge({ totalXp }: Props) {
  const { level, next, progress, xpToNext } = getLevelProgress(totalXp);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[var(--color-surface)] p-5 ring-1 ring-[var(--color-border)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Niveau
          </p>
          <h3 className="mt-1 text-xl font-bold">
            <span className="mr-2">{level.emoji}</span>
            {level.label}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {totalXp.toLocaleString("fr-FR")} XP total
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full ring-2" style={{ color: level.color, borderColor: level.color }}>
          <span className="text-2xl">{level.emoji}</span>
        </div>
      </div>
      <div className="mt-4">
        <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: level.color }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[var(--color-text-subtle)]">
          {next
            ? `${xpToNext.toLocaleString("fr-FR")} XP avant ${next.label} ${next.emoji}`
            : "Niveau max atteint 🎉"}
        </p>
      </div>
    </motion.div>
  );
}
