"use client";

import { motion } from "framer-motion";
import { FOCUS_EMOJIS } from "@/lib/study/constants";
import { useStudyMetas } from "@/lib/study/meta";
import type { StudySession } from "@/lib/study/types";
import { formatDuration, formatRelativeDate } from "@/lib/utils";

interface Props {
  session: StudySession;
  onClick?: () => void;
}

export default function StudyCard({ session, onClick }: Props) {
  const { resolve } = useStudyMetas();
  const topic = resolve(session.topic);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-left ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ background: `${topic.color}22` }}
      >
        {topic.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[var(--color-text)]">
            {session.title || topic.label}
          </h3>
          <span className="shrink-0 text-[11px] text-[var(--color-text-subtle)]">
            {formatRelativeDate(session.date)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>{topic.label}</span>
          <span className="text-[var(--color-text-subtle)]">·</span>
          <span>{formatDuration(session.durationMin)}</span>
          <span className="text-[var(--color-text-subtle)]">·</span>
          <span>+{session.xp} XP</span>
          <span className="ml-auto text-base">{FOCUS_EMOJIS[session.focus - 1]}</span>
        </div>
      </div>
    </motion.button>
  );
}
