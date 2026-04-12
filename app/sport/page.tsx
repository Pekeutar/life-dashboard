"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StreakCard from "@/components/sport/StreakCard";
import LevelBadge from "@/components/sport/LevelBadge";
import StatsGrid from "@/components/sport/StatsGrid";
import WeeklyChart from "@/components/sport/WeeklyChart";
import SportDistribution from "@/components/sport/SportDistribution";
import WorkoutCard from "@/components/sport/WorkoutCard";
import { useWorkouts } from "@/lib/sport/store";
import { useQuests } from "@/lib/quests/store";
import { totalQuestXpForPillar } from "@/lib/quests/stats";
import { computeStreak, computeBestStreak } from "@/lib/sport/streak";
import { thisWeekStats, thisMonthStats, totalStats } from "@/lib/sport/stats";

export default function SportPage() {
  const { workouts, hydrated } = useWorkouts();
  const { quests } = useQuests();

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Sport" subtitle="Ton pilier physique" backHref="/" />
        <div className="px-5">
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  const streak = computeStreak(workouts);
  const best = computeBestStreak(workouts);
  const weekStats = thisWeekStats(workouts);
  const monthStats = thisMonthStats(workouts);
  const total = totalStats(workouts);
  const questXp = totalQuestXpForPillar(quests, "sport");
  const pillarXp = total.totalXp + questXp;
  const recent = workouts.slice(0, 3);

  return (
    <>
      <PageHeader title="Sport" subtitle="Ton pilier physique" backHref="/" />

      <div className="flex flex-col gap-4 px-5 pb-6">
        <StreakCard current={streak} best={best} />
        <LevelBadge totalXp={pillarXp} />
        <StatsGrid label="Cette semaine" stats={weekStats} />
        <StatsGrid label="Ce mois" stats={monthStats} />
        <WeeklyChart workouts={workouts} />
        <SportDistribution workouts={workouts} />

        {recent.length > 0 && (
          <section>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Dernières séances
              </h2>
              <Link
                href="/sport/history"
                className="flex items-center gap-0.5 text-xs font-medium text-[var(--color-accent)]"
              >
                Tout voir <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recent.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          </section>
        )}

        {workouts.length === 0 && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 text-center ring-1 ring-[var(--color-border)]">
            <p className="text-3xl">💪</p>
            <h3 className="mt-2 font-semibold">Première séance ?</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Tape sur le bouton orange en bas pour l&apos;enregistrer.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
