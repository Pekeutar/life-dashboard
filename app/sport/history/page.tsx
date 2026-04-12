"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import WorkoutCard from "@/components/sport/WorkoutCard";
import { useWorkouts } from "@/lib/sport/store";
import { useSportMetas } from "@/lib/sport/meta";
import { weekKey } from "@/lib/utils";
import { FEELING_EMOJIS } from "@/lib/sport/constants";
import { formatDuration, formatDistance } from "@/lib/utils";
import type { Workout } from "@/lib/sport/types";

function weekLabel(iso: string): string {
  const monday = new Date(iso);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const f = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${f(monday)} — ${f(sunday)}`;
}

export default function HistoryPage() {
  const { workouts, remove, hydrated } = useWorkouts();
  const [selected, setSelected] = useState<Workout | null>(null);

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Historique" backHref="/sport" />
        <div className="px-5">
          <div className="h-20 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  // Group by week
  const grouped = new Map<string, Workout[]>();
  for (const w of workouts) {
    const key = weekKey(w.date);
    const arr = grouped.get(key) ?? [];
    arr.push(w);
    grouped.set(key, arr);
  }
  const weeks = Array.from(grouped.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1
  );

  return (
    <>
      <PageHeader
        title="Historique"
        subtitle={`${workouts.length} séance${workouts.length > 1 ? "s" : ""}`}
        backHref="/sport"
      />

      <div className="flex flex-col gap-5 px-5 pb-6">
        {weeks.length === 0 && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 text-center ring-1 ring-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              Aucune séance pour l&apos;instant.
            </p>
          </div>
        )}

        {weeks.map(([weekStart, items]) => (
          <section key={weekStart}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              {weekLabel(weekStart)}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((w) => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  onClick={() => setSelected(w)}
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
              className="w-full max-w-md rounded-t-3xl bg-[var(--color-bg-elevated)] p-6 pb-10 ring-1 ring-[var(--color-border)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
              <DetailView workout={selected} />
              <button
                onClick={() => {
                  remove(selected.id);
                  setSelected(null);
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3 text-sm font-medium text-red-400 ring-1 ring-red-500/30 active:scale-95"
              >
                <Trash2 size={16} /> Supprimer cette séance
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailView({ workout }: { workout: Workout }) {
  const { resolve } = useSportMetas();
  const sport = resolve(workout.type);
  const date = new Date(workout.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
          style={{ background: `${sport.color}22` }}
        >
          {sport.emoji}
        </div>
        <div>
          <h2 className="text-xl font-bold">{sport.label}</h2>
          <p className="text-xs text-[var(--color-text-subtle)]">{date}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <InfoCell label="Durée" value={formatDuration(workout.durationMin)} />
        {workout.distanceKm != null && (
          <InfoCell label="Distance" value={formatDistance(workout.distanceKm)} />
        )}
        <InfoCell label="Intensité" value={`${workout.intensity}/5`} />
        <InfoCell
          label="Feeling"
          value={FEELING_EMOJIS[workout.feeling - 1]}
        />
        <InfoCell label="XP gagné" value={`+${workout.xp}`} />
      </div>
      {workout.notes && (
        <div className="mt-4 rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
          <p className="text-xs uppercase text-[var(--color-text-subtle)]">
            Notes
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {workout.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface)] px-3 py-2 ring-1 ring-[var(--color-border)]">
      <p className="text-[10px] uppercase text-[var(--color-text-subtle)]">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold">{value}</p>
    </div>
  );
}
