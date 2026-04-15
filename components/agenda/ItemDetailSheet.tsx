"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Trash2, X } from "lucide-react";
import type { AgendaItem } from "@/lib/agenda/use-agenda-items";
import { formatDuration, formatShortDayDate } from "@/lib/utils";

interface Props {
  item: AgendaItem | null;
  onClose: () => void;
  onDeleteEvent: (id: string) => void;
}

export default function ItemDetailSheet({
  item,
  onClose,
  onDeleteEvent,
}: Props) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-border)]"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                    style={{ background: `${item.color}22` }}
                  >
                    {item.emoji}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[var(--color-text-subtle)]">
                      {formatShortDayDate(new Date(item.date))}
                    </p>
                    {item.categoryLabel && (
                      <span
                        className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          background: `${item.color}22`,
                          color: item.color,
                        }}
                      >
                        {item.categoryLabel}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              {item.subtitle && (
                <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                  {item.subtitle}
                </p>
              )}

              {item.notes && (
                <div className="mb-4 rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">
                    {item.notes}
                  </p>
                </div>
              )}

              {item.kind !== "event" && (
                <Link
                  href={
                    item.kind === "workout"
                      ? "/sport/history"
                      : item.kind === "study"
                        ? "/etude/history"
                        : "/quetes"
                  }
                  onClick={onClose}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-sm font-medium ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
                >
                  {item.kind === "quest"
                    ? "Voir la quête"
                    : "Voir dans l'historique"}
                  <ArrowRight size={16} />
                </Link>
              )}

              {item.kind === "event" && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEvent(item.sourceId);
                    onClose();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3 text-sm font-medium text-red-400 ring-1 ring-red-500/30 active:scale-95"
                >
                  <Trash2 size={16} /> Supprimer cet événement
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
