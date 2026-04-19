"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  getLevelProgress,
  getPillarRankProgress,
} from "@/lib/gamification";
import LevelRoadmap from "@/components/shared/LevelRoadmap";

interface Props {
  totalXp: number;
  /** "global" shows the 13-tier level system, "pillar" shows the 5-rank pillar system. */
  mode?: "global" | "pillar";
  pillarLabel?: string;
}

export default function LevelBadge({
  totalXp,
  mode = "pillar",
  pillarLabel,
}: Props) {
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  if (mode === "pillar") {
    const { rank, next, progress, xpToNext } =
      getPillarRankProgress(totalXp);

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRoadmapOpen(true)}
          className="cursor-pointer rounded-none bg-[var(--color-surface)] p-5 ghost-border"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                {pillarLabel ? `Rang ${pillarLabel}` : "Rang"}
              </p>
              <h3 className="mt-1 text-xl font-bold">
                <span className="mr-2 ember-emoji">{rank.emoji}</span>
                {rank.label}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {totalXp.toLocaleString("fr-FR")} XP
              </p>
            </div>
            <div
              className="flex h-14 w-14 items-center justify-center rounded-none ghost-border"
              style={{
                color: rank.color,
                borderColor: "var(--color-gold-faint)",
                background: "var(--color-surface-2)",
              }}
            >
              <span className="text-2xl ember-emoji">{rank.emoji}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ background: rank.color }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[var(--color-text-subtle)]">
              {next
                ? (
                  <>
                    {xpToNext.toLocaleString("fr-FR")} XP avant {next.label}{" "}
                    <span className="ember-emoji">{next.emoji}</span>
                  </>
                )
                : "Rang max atteint"}
            </p>
          </div>
        </motion.div>
        <LevelRoadmap
          open={roadmapOpen}
          onClose={() => setRoadmapOpen(false)}
          totalXp={totalXp}
          mode="pillar"
          pillarLabel={pillarLabel}
        />
      </>
    );
  }

  // Global level mode
  const { level, next, progress, xpToNext, display } =
    getLevelProgress(totalXp);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setRoadmapOpen(true)}
        className="cursor-pointer rounded-none bg-[var(--color-surface)] p-5 ghost-border"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              Niveau global
            </p>
            <h3 className="mt-1 text-xl font-bold">
              <span className="mr-2 ember-emoji">{level.emoji}</span>
              {display}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {totalXp.toLocaleString("fr-FR")} XP total
            </p>
          </div>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-none ghost-border"
            style={{
              color: level.color,
              borderColor: "var(--color-gold-faint)",
              background: "var(--color-surface-2)",
            }}
          >
            <span className="text-2xl ember-emoji">{level.emoji}</span>
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
              : "Niveau max atteint"}
          </p>
        </div>
      </motion.div>
      <LevelRoadmap
        open={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
        totalXp={totalXp}
        mode="global"
      />
    </>
  );
}
