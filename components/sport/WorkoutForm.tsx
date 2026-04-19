"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SportTypePicker from "./SportTypePicker";
import { FEELING_EMOJIS, INTENSITY_LABELS } from "@/lib/sport/constants";
import { useSportMetas } from "@/lib/sport/meta";
import { useWorkouts } from "@/lib/sport/store";
import { computeXp } from "@/lib/sport/xp";
import { useQuests } from "@/lib/quests/store";
import { questsImpactedBy } from "@/lib/quests/tracker-info";
import { writeLastImpact } from "@/lib/quests/last-impact";
import type { Feeling, Intensity, SportType } from "@/lib/sport/types";
import { cn, formatDuration } from "@/lib/utils";

export default function WorkoutForm() {
  const router = useRouter();
  const { add } = useWorkouts();
  const { quests } = useQuests();
  const { resolve } = useSportMetas();

  const [type, setType] = useState<SportType>("running");
  const [durationMin, setDurationMin] = useState(30);
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [intensity, setIntensity] = useState<Intensity>(3);
  const [feeling, setFeeling] = useState<Feeling>(4);
  const [notes, setNotes] = useState("");

  const hasDistance = resolve(type).hasDistance;
  const xpPreview = computeXp(durationMin, intensity);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    add({
      date: new Date().toISOString(),
      type,
      durationMin,
      distanceKm: hasDistance && distanceKm ? parseFloat(distanceKm) : undefined,
      intensity,
      feeling,
      notes: notes.trim() || undefined,
    });
    const impacted = questsImpactedBy(quests, { pillar: "sport", type });
    writeLastImpact({
      pillar: "sport",
      questTitles: impacted.map((q) => q.title),
    });
    router.push("/sport");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-5 pb-8">
      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Type de sport
        </label>
        <SportTypePicker value={type} onChange={setType} />
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Durée
          </label>
          <span className="text-lg font-semibold text-[var(--color-text)]">
            {formatDuration(durationMin)}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={180}
          step={5}
          value={durationMin}
          onChange={(e) => setDurationMin(parseInt(e.target.value, 10))}
          className="lv-slider"
        />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--color-text-subtle)]">
          <span>5 min</span>
          <span>3 h</span>
        </div>
      </section>

      {hasDistance && (
        <section>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Distance (optionnel)
          </label>
          <div className="flex items-center gap-2 rounded-none bg-[var(--color-surface)] px-4 py-3 ghost-border">
            <input
              inputMode="decimal"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value.replace(",", "."))}
              placeholder="0.0"
              className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-[var(--color-text-subtle)]"
            />
            <span className="text-sm text-[var(--color-text-muted)]">km</span>
          </div>
        </section>
      )}

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Intensité · {INTENSITY_LABELS[intensity - 1]}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {([1, 2, 3, 4, 5] as Intensity[]).map((n) => (
            <motion.button
              type="button"
              key={n}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIntensity(n)}
              className={cn(
                "rounded-none py-3 text-lg font-semibold transition-colors",
                intensity === n
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ghost-border"
              )}
            >
              {n}
            </motion.button>
          ))}
        </div>
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Feeling
        </label>
        <div className="grid grid-cols-5 gap-2">
          {FEELING_EMOJIS.map((emoji, i) => {
            const n = (i + 1) as Feeling;
            return (
              <motion.button
                type="button"
                key={emoji}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFeeling(n)}
                className={cn(
                  "rounded-none py-3 text-2xl transition-colors",
                  feeling === n
                    ? "bg-[var(--color-surface-2)] ring-2 ring-[var(--color-accent)]"
                    : "bg-[var(--color-surface)] ghost-border opacity-60"
                )}
              >
                {emoji}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Notes (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Comment tu t'es senti, ce qui a marché…"
          className="w-full resize-none rounded-none bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ghost-border placeholder:text-[var(--color-text-subtle)] focus:ring-[var(--color-accent)]"
        />
      </section>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        className="mt-2 flex items-center justify-center gap-2 rounded-none bg-[var(--color-accent)] py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20"
      >
        Enregistrer · +{xpPreview} XP
      </motion.button>
    </form>
  );
}
