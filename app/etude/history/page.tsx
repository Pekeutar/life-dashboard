"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StudyCard from "@/components/study/StudyCard";
import { useStudySessions } from "@/lib/study/store";
import { useStudyMetas } from "@/lib/study/meta";
import { weekKey, formatDuration } from "@/lib/utils";
import { FOCUS_EMOJIS, FOCUS_LABELS } from "@/lib/study/constants";
import type { StudySession } from "@/lib/study/types";

function weekLabel(iso: string): string {
  const monday = new Date(iso);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const f = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${f(monday)} — ${f(sunday)}`;
}

export default function StudyHistoryPage() {
  const { sessions, remove, hydrated } = useStudySessions();
  const [selected, setSelected] = useState<StudySession | null>(null);

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Historique" backHref="/etude" />
        <div className="px-5">
          <div className="h-20 animate-pulse rounded-none bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  const grouped = new Map<string, StudySession[]>();
  for (const s of sessions) {
    const key = weekKey(s.date);
    const arr = grouped.get(key) ?? [];
    arr.push(s);
    grouped.set(key, arr);
  }
  const weeks = Array.from(grouped.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1
  );

  return (
    <>
      <PageHeader
        title="Historique"
        subtitle={`${sessions.length} session${sessions.length > 1 ? "s" : ""}`}
        backHref="/etude"
      />

      <div className="flex flex-col gap-5 px-5 pb-6">
        {weeks.length === 0 && (
          <div className="rounded-none bg-[var(--color-surface)] p-6 text-center ghost-border">
            <p className="text-sm text-[var(--color-text-muted)]">
              Aucune session pour l&apos;instant.
            </p>
          </div>
        )}

        {weeks.map(([weekStart, items]) => (
          <section key={weekStart}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              {weekLabel(weekStart)}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((s) => (
                <StudyCard
                  key={s.id}
                  session={s}
                  onClick={() => setSelected(s)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-none bg-[var(--color-bg-elevated)] p-6 pb-10 ghost-border"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
              <DetailView session={selected} />
              <button
                onClick={() => {
                  remove(selected.id);
                  setSelected(null);
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-none bg-red-500/10 py-3 text-sm font-medium text-red-400 ring-1 ring-red-500/30 active:scale-95"
              >
                <Trash2 size={16} /> Supprimer cette session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailView({ session }: { session: StudySession }) {
  const { resolve } = useStudyMetas();
  const topic = resolve(session.topic);
  const date = new Date(session.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-none text-3xl ember-emoji ghost-border"
          style={{ background: `${topic.color}22` }}
        >
          {topic.emoji}
        </div>
        <div>
          <h2 className="text-xl font-bold">{session.title || topic.label}</h2>
          <p className="text-xs text-[var(--color-text-subtle)]">{date}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <InfoCell label="Sujet" value={topic.label} />
        <InfoCell label="Durée" value={formatDuration(session.durationMin)} />
        <InfoCell
          label="Concentration"
          value={`${FOCUS_EMOJIS[session.focus - 1]} ${FOCUS_LABELS[session.focus - 1]}`}
        />
        <InfoCell label="XP gagné" value={`+${session.xp}`} />
      </div>
      {session.notes && (
        <div className="mt-4 rounded-none bg-[var(--color-surface)] p-4 ghost-border">
          <p className="text-xs uppercase text-[var(--color-text-subtle)]">
            Notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">
            {session.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-none bg-[var(--color-surface)] px-3 py-2 ghost-border">
      <p className="text-[10px] uppercase text-[var(--color-text-subtle)]">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold">{value}</p>
    </div>
  );
}
