"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { AgendaItem } from "@/lib/agenda/use-agenda-items";
import { formatRelativeDate } from "@/lib/utils";

interface Props {
  item: AgendaItem;
  onClick?: () => void;
  showDate?: boolean;
}

export default function ItemRow({ item, onClick, showDate }: Props) {
  const isEvent = item.kind === "event";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-left ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ background: `${item.color}22` }}
      >
        {item.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[var(--color-text)]">
            {item.title}
          </h3>
          {showDate && (
            <span className="shrink-0 text-[10px] text-[var(--color-text-subtle)]">
              {formatRelativeDate(item.date)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
          {isEvent && item.categoryLabel && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ background: `${item.color}22`, color: item.color }}
            >
              {item.categoryLabel}
            </span>
          )}
          {item.subtitle && <span className="truncate">{item.subtitle}</span>}
        </div>
      </div>
      <ChevronRight size={16} className="text-[var(--color-text-subtle)]" />
    </motion.button>
  );
}
