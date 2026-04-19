"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { consumeLastImpact } from "@/lib/quests/last-impact";

interface Props {
  pillar: "sport" | "study";
}

/**
 * One-shot banner shown on the pilier page right after a new workout/session
 * is logged, listing which quests were pushed forward. Auto-dismisses after
 * 6 s or on user tap.
 */
export default function QuestImpactBanner({ pillar }: Props) {
  const [titles, setTitles] = useState<string[] | null>(null);

  useEffect(() => {
    const payload = consumeLastImpact(pillar);
    if (!payload || payload.questTitles.length === 0) return;
    setTitles(payload.questTitles);
    const t = window.setTimeout(() => setTitles(null), 6000);
    return () => window.clearTimeout(t);
  }, [pillar]);

  return (
    <AnimatePresence>
      {titles && titles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-5 mb-4 flex items-start gap-3 rounded-none bg-[var(--color-accent)]/10 px-4 py-3 ring-1 ring-[var(--color-accent)]/40"
        >
          <Sparkles
            size={16}
            className="mt-0.5 shrink-0 text-[var(--color-accent)]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
              {titles.length > 1
                ? `${titles.length} quêtes avancent`
                : "Quête qui avance"}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-text)]">
              {titles.slice(0, 2).join(" · ")}
              {titles.length > 2 && ` · +${titles.length - 2}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTitles(null)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--color-accent)]/70 active:scale-90"
            aria-label="Fermer"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
