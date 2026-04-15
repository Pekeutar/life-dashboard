"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Dumbbell,
  Flame,
  Heart,
  Sparkles,
  Target,
  TreePine,
  Trophy,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import YearHeatmap from "@/components/shared/YearHeatmap";
import { useWorkouts } from "@/lib/sport/store";
import { useStudySessions } from "@/lib/study/store";
import { useQuests } from "@/lib/quests/store";
import { useRecipes } from "@/lib/food/store";
import { thisWeekStats, totalStats } from "@/lib/sport/stats";
import {
  thisWeekStudyStats,
  totalStudyStats,
} from "@/lib/study/stats";
import { totalQuestXp, activeQuestsCount } from "@/lib/quests/stats";
import { computeQuestProgress } from "@/lib/quests/progress";
import { computeCrossStreak, computeBestCrossStreak } from "@/lib/streak-shared";
import { getLevelProgress, getTitle } from "@/lib/gamification";
import LevelRoadmap from "@/components/shared/LevelRoadmap";
import { useSettings } from "@/lib/settings/store";
import { dayKey, formatLongDate, isSameDay } from "@/lib/utils";
import { useAgendaItems, type AgendaItem } from "@/lib/agenda/use-agenda-items";
import type { Quest } from "@/lib/quests/types";

const FUTURE_PILLARS = [
  { emoji: "💼", label: "Business" },
  { emoji: "📝", label: "Journal" },
];

export default function HomePage() {
  const { settings } = useSettings();
  const { workouts, hydrated: sportReady } = useWorkouts();
  const { sessions, hydrated: studyReady } = useStudySessions();
  const { quests, hydrated: questsReady } = useQuests();
  const { favorites: favRecipes } = useRecipes();
  const { items: agendaItems, byDay: agendaByDay } = useAgendaItems();
  const hydrated = sportReady && studyReady && questsReady;

  // Upcoming: today + future events, sorted asc, first 3
  const upcoming = useMemo<AgendaItem[]>(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    return agendaItems
      .filter(
        (it) =>
          it.kind === "event" && new Date(it.date).getTime() >= todayStart.getTime()
      )
      .slice(0, 3);
  }, [agendaItems]);

  const todayItems = agendaByDay.get(dayKey(new Date())) ?? [];

  // Top 2 active quests to preview on home
  const topActiveQuests = useMemo(() => {
    return quests
      .filter((q) => q.status === "active" && !q.parentId)
      .slice(0, 2);
  }, [quests]);
  const activeCount = hydrated ? activeQuestsCount(quests) : 0;

  // Aggregate dates for cross-pilier streak
  const allDates = hydrated
    ? [...workouts.map((w) => w.date), ...sessions.map((s) => s.date)]
    : [];
  const streak = hydrated ? computeCrossStreak(allDates) : 0;
  const best = hydrated ? computeBestCrossStreak(allDates) : 0;

  const sportTotal = hydrated
    ? totalStats(workouts)
    : { totalXp: 0, count: 0, totalKm: 0, totalMin: 0 };
  const studyTotal = hydrated
    ? totalStudyStats(sessions)
    : { totalXp: 0, count: 0, totalMin: 0 };
  const questXp = hydrated ? totalQuestXp(quests) : 0;
  const totalXp = sportTotal.totalXp + studyTotal.totalXp + questXp;

  const sportWeek = hydrated
    ? thisWeekStats(workouts)
    : { count: 0, totalKm: 0, totalMin: 0, totalXp: 0 };
  const studyWeek = hydrated
    ? thisWeekStudyStats(sessions)
    : { count: 0, totalMin: 0, totalXp: 0 };

  const { level, next, progress, xpToNext, display } = getLevelProgress(totalXp);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={settings.name ? `Bonjour ${settings.name} 👋` : "Bonjour 👋"}
        subtitle={formatLongDate()}
        settingsHref="/parametres"
      />

      <div className="flex flex-col gap-4 px-5 pb-6">
        {/* Hero card gamifiée — cliquable pour voir la roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRoadmapOpen(true)}
          className="relative cursor-pointer overflow-hidden rounded-3xl p-5 ring-1 ring-[var(--color-border)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(168,85,247,0.18) 55%, rgba(28,28,33,0.9) 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                <Trophy size={12} /> {display}
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-tight">
                {getTitle(level)}
              </h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {totalXp.toLocaleString("fr-FR")} XP total
              </p>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
              style={{ background: `${level.color}22`, color: level.color }}
            >
              {level.emoji}
            </div>
          </div>

          <div className="mt-4">
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ background: level.color }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[var(--color-text-subtle)]">
              {next
                ? `${xpToNext.toLocaleString("fr-FR")} XP avant ${next.label} ${next.emoji}`
                : "Niveau max atteint 🎉"}
            </p>
          </div>

          {/* Streak inline */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-black/25 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/20">
              <Flame
                size={18}
                className={
                  streak > 0
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-subtle)]"
                }
                fill={streak > 0 ? "currentColor" : "none"}
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                Série en cours
              </p>
              <p className="text-sm font-semibold">
                {streak} {streak <= 1 ? "jour" : "jours"}
                <span className="ml-2 text-[11px] font-normal text-[var(--color-text-subtle)]">
                  record : {best}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        <LevelRoadmap
          open={roadmapOpen}
          onClose={() => setRoadmapOpen(false)}
          totalXp={totalXp}
          mode="global"
        />

        {/* Pillars */}
        <section className="flex flex-col gap-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Tes piliers
          </p>

          <PillarCard
            href="/sport"
            icon={<Dumbbell size={22} />}
            emoji="🏋️"
            label="Sport"
            accent="#f97316"
            weekCount={sportWeek.count}
            weekGoal={settings.weeklyGoals.sportSessions}
            weekUnit={sportWeek.count <= 1 ? "séance" : "séances"}
            totalXp={sportTotal.totalXp}
          />

          <PillarCard
            href="/etude"
            icon={<BookOpen size={22} />}
            emoji="🧠"
            label="Étude"
            accent="#a855f7"
            weekCount={studyWeek.count}
            weekGoal={settings.weeklyGoals.studySessions}
            weekUnit={studyWeek.count <= 1 ? "session" : "sessions"}
            totalXp={studyTotal.totalXp}
          />

          <PillarCard
            href="/sante"
            icon={<Heart size={22} />}
            emoji="❤️"
            label="Santé"
            accent="#ef4444"
            weekCount={favRecipes.length}
            weekUnit={favRecipes.length <= 1 ? "recette favorite" : "recettes favorites"}
            totalXp={0}
          />
        </section>

        {/* Year heatmap */}
        <YearHeatmap workouts={workouts} sessions={sessions} />

        {/* Skill tree link */}
        <Link
          href="/competences"
          className="flex items-center justify-between gap-3 rounded-2xl p-4 ring-1 ring-[var(--color-border)] active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(135deg, rgba(234,179,8,0.18) 0%, rgba(234,179,8,0.06) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-[#eab308]"
              style={{ background: "rgba(234,179,8,0.18)" }}
            >
              <TreePine size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold">Compétences</h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Ton arbre de progression
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[var(--color-text-subtle)]" />
        </Link>

        {/* Quêtes preview */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              <Target size={12} /> Quêtes
              {activeCount > 0 && (
                <span
                  className="rounded-full px-1.5 text-[10px]"
                  style={{ background: "rgba(236,72,153,0.2)", color: "#ec4899" }}
                >
                  {activeCount}
                </span>
              )}
            </p>
            <Link
              href="/quetes"
              className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] active:text-[var(--color-text)]"
            >
              Tout voir <ChevronRight size={12} />
            </Link>
          </div>

          {topActiveQuests.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {topActiveQuests.map((q) => (
                <QuestPreviewRow
                  key={q.id}
                  quest={q}
                  workouts={workouts}
                  sessions={sessions}
                />
              ))}
            </div>
          ) : (
            <Link
              href="/quetes/new"
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-4 text-xs text-[var(--color-text-subtle)] active:bg-[var(--color-surface)]"
            >
              <Target size={14} />
              Fixe-toi une première quête
            </Link>
          )}
        </section>

        {/* Agenda preview */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              <CalendarDays size={12} /> Agenda
            </p>
            <Link
              href="/agenda"
              className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] active:text-[var(--color-text)]"
            >
              Tout voir <ChevronRight size={12} />
            </Link>
          </div>

          {/* Today chip */}
          <Link
            href="/agenda"
            className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--color-surface)] px-4 py-3 ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-xl text-[var(--color-accent)]">
                <CalendarDays size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Aujourd&apos;hui</h3>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                  {todayItems.length === 0
                    ? "Rien de prévu — journée libre"
                    : `${todayItems.length} ${todayItems.length <= 1 ? "élément" : "éléments"} au programme`}
                </p>
              </div>
            </div>
            {todayItems.length > 0 && (
              <div className="flex -space-x-1.5">
                {todayItems.slice(0, 4).map((it) => (
                  <div
                    key={it.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm ring-2 ring-[var(--color-surface)]"
                    style={{ background: `${it.color}33` }}
                  >
                    {it.emoji}
                  </div>
                ))}
              </div>
            )}
          </Link>

          {/* Upcoming events */}
          {upcoming.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {upcoming.map((it) => (
                <UpcomingRow key={it.id} item={it} />
              ))}
            </div>
          ) : (
            <Link
              href="/agenda/new"
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-4 text-xs text-[var(--color-text-subtle)] active:bg-[var(--color-surface)]"
            >
              <CalendarPlus size={14} />
              Planifier un événement
            </Link>
          )}
        </section>

        {/* Future pillars */}
        <section className="rounded-2xl bg-[var(--color-surface)]/60 p-5 ring-1 ring-[var(--color-border)]">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--color-level)]" />
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              Prochainement
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FUTURE_PILLARS.map((p) => (
              <div
                key={p.label}
                className="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-2)]/50 py-3 opacity-50"
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function QuestPreviewRow({
  quest,
  workouts,
  sessions,
}: {
  quest: Quest;
  workouts: ReturnType<typeof useWorkouts>["workouts"];
  sessions: ReturnType<typeof useStudySessions>["sessions"];
}) {
  const progress = computeQuestProgress(quest, workouts, sessions);
  return (
    <Link
      href="/quetes"
      className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-3 py-2.5 ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ background: `${quest.color}22` }}
      >
        {quest.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
          {quest.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.ratio * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: quest.color }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-medium text-[var(--color-text-subtle)]">
            {progress.label || (progress.done ? "Fait ✓" : "À faire")}
          </span>
        </div>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{ background: `${quest.color}22`, color: quest.color }}
      >
        +{quest.xpReward} XP
      </span>
    </Link>
  );
}

function UpcomingRow({ item }: { item: AgendaItem }) {
  const date = new Date(item.date);
  const now = new Date();
  const isToday = isSameDay(date, now);
  const diffDays = Math.round(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const relative = isToday
    ? "Aujourd'hui"
    : diffDays === 1
      ? "Demain"
      : diffDays <= 7
        ? `Dans ${diffDays} j`
        : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <Link
      href="/agenda"
      className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-3 py-2.5 ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ background: `${item.color}22` }}
      >
        {item.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
          {item.title}
        </p>
        {item.categoryLabel && (
          <p
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: item.color }}
          >
            {item.categoryLabel}
          </p>
        )}
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{
          background: `${item.color}22`,
          color: item.color,
        }}
      >
        {relative}
      </span>
    </Link>
  );
}

interface PillarCardProps {
  href: string;
  icon: React.ReactNode;
  emoji: string;
  label: string;
  accent: string;
  weekCount: number;
  weekGoal?: number;
  weekUnit: string;
  totalXp: number;
}

function PillarCard({
  href,
  icon,
  label,
  accent,
  weekCount,
  weekGoal,
  weekUnit,
  totalXp,
}: PillarCardProps) {
  const goalRatio = weekGoal ? Math.min(1, weekCount / weekGoal) : null;

  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${accent}22`, color: accent }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold">{label}</h3>
              <span
                className="text-[11px] font-medium"
                style={{ color: accent }}
              >
                {totalXp.toLocaleString("fr-FR")} XP
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
              {weekGoal
                ? `${weekCount}/${weekGoal} ${weekUnit} cette semaine`
                : `${weekCount} ${weekUnit} cette semaine`}
            </p>
            {goalRatio !== null && (
              <div className="mt-1.5 relative h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalRatio * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: accent }}
                />
              </div>
            )}
          </div>
        </div>
        <ChevronRight size={20} className="shrink-0 text-[var(--color-text-subtle)]" />
      </motion.div>
    </Link>
  );
}
