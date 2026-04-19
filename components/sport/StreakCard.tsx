"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface Props {
  current: number;
  best: number;
}

export default function StreakCard({ current, best }: Props) {
  const isActive = current > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-none bg-gradient-to-br from-orange-500/20 via-[var(--color-surface)] to-[var(--color-surface)] p-5 ghost-border"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Série en cours
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[var(--color-text)]">{current}</span>
            <span className="text-sm text-[var(--color-text-muted)]">
              {current <= 1 ? "jour" : "jours"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
            Record : {best} {best <= 1 ? "jour" : "jours"}
          </p>
        </div>
        <motion.div
          animate={isActive ? { rotate: [0, -10, 10, -6, 6, 0] } : {}}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20"
        >
          <Flame
            size={36}
            className={isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-subtle)]"}
            fill={isActive ? "currentColor" : "none"}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
