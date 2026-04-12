"use client";

import Link from "next/link";
import { ChevronRight, Layers, Timer } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StreakCard from "@/components/sport/StreakCard";
import LevelBadge from "@/components/sport/LevelBadge";
import StudyStatsGrid from "@/components/study/StudyStatsGrid";
import WeeklyStudyChart from "@/components/study/WeeklyStudyChart";
import StudyDistribution from "@/components/study/StudyDistribution";
import StudyCard from "@/components/study/StudyCard";
import { useStudySessions } from "@/lib/study/store";
import { useFlashcards } from "@/lib/flashcards/store";
import { dueCount } from "@/lib/flashcards/stats";
import { useQuests } from "@/lib/quests/store";
import { totalQuestXpForPillar } from "@/lib/quests/stats";
import { computeStudyStreak, computeBestStudyStreak } from "@/lib/study/streak";
import {
  thisWeekStudyStats,
  thisMonthStudyStats,
  totalStudyStats,
} from "@/lib/study/stats";

export default function StudyPage() {
  const { sessions, hydrated } = useStudySessions();
  const { cards: flashcards } = useFlashcards();
  const { quests } = useQuests();

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Étude" subtitle="Ton pilier mental" backHref="/" />
        <div className="px-5">
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  const streak = computeStudyStreak(sessions);
  const best = computeBestStudyStreak(sessions);
  const weekStats = thisWeekStudyStats(sessions);
  const monthStats = thisMonthStudyStats(sessions);
  const total = totalStudyStats(sessions);
  const questXp = totalQuestXpForPillar(quests, "study");
  const pillarXp = total.totalXp + questXp;
  const flashcardsDue = dueCount(flashcards);
  const recent = sessions.slice(0, 3);

  return (
    <>
      <PageHeader title="Étude" subtitle="Ton pilier mental" backHref="/" />

      <div className="flex flex-col gap-4 px-5 pb-6">
        <Link
          href="/etude/pomodoro"
          className="flex items-center justify-between gap-3 rounded-2xl p-4 ring-1 ring-[var(--color-border)] active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(135deg, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0.08) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-level)]/20 text-[var(--color-level)]">
              <Timer size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold">Mode Pomodoro</h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Concentre-toi 25 min, alarme à la fin
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[var(--color-text-subtle)]" />
        </Link>

        <Link
          href="/etude/flashcards"
          className="flex items-center justify-between gap-3 rounded-2xl p-4 ring-1 ring-[var(--color-border)] active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.08) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-[#06b6d4]"
              style={{ background: "rgba(6,182,212,0.18)" }}
            >
              <Layers size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold">Flashcards</h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {flashcardsDue > 0
                  ? `${flashcardsDue} carte${flashcardsDue > 1 ? "s" : ""} à réviser`
                  : "Révisions espacées (SM-2)"}
              </p>
            </div>
          </div>
          {flashcardsDue > 0 ? (
            <span className="rounded-full bg-[#06b6d4] px-2 py-0.5 text-[10px] font-bold text-white">
              {flashcardsDue}
            </span>
          ) : (
            <ChevronRight size={20} className="text-[var(--color-text-subtle)]" />
          )}
        </Link>

        <StreakCard current={streak} best={best} />
        <LevelBadge totalXp={pillarXp} mode="pillar" pillarLabel="Études" />
        <StudyStatsGrid label="Cette semaine" stats={weekStats} />
        <StudyStatsGrid label="Ce mois" stats={monthStats} />
        <WeeklyStudyChart sessions={sessions} />
        <StudyDistribution sessions={sessions} />

        {recent.length > 0 && (
          <section>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Dernières sessions
              </h2>
              <Link
                href="/etude/history"
                className="flex items-center gap-0.5 text-xs font-medium text-[var(--color-level)]"
              >
                Tout voir <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recent.map((s) => (
                <StudyCard key={s.id} session={s} />
              ))}
            </div>
          </section>
        )}

        {sessions.length === 0 && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 text-center ring-1 ring-[var(--color-border)]">
            <p className="text-3xl">🧠</p>
            <h3 className="mt-2 font-semibold">Première session ?</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Tape sur le bouton violet en bas pour l&apos;enregistrer.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
