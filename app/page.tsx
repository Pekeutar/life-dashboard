"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Dumbbell,
  Feather,
  Flame,
  Heart,
  Sparkles,
  Target,
  TreePine,
  Trophy,
} from "lucide-react";
import { Menu, UserCircle2 } from "lucide-react";
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

const FUTURE_PILLARS: { icon: React.ReactNode; label: string }[] = [
  { icon: <Briefcase size={18} />, label: "Business" },
  { icon: <Feather size={18} />, label: "Journal" },
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
    <div className="min-h-full bg-[var(--color-bg)] selection:bg-[var(--color-accent)]/30 selection:text-[var(--color-accent)]">
      {/* Ember top bar */}
      <header className="pt-safe flex items-center justify-between px-5 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/parametres"
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center text-[var(--color-accent)] active:scale-95 transition-transform duration-300"
          >
            <Menu size={22} />
          </Link>
          <h1 className="font-headline uppercase font-extrabold tracking-tighter text-xl text-[var(--color-accent)]">
            Soul Progress
          </h1>
        </div>
        <Link
          href="/parametres"
          aria-label="Profil"
          className="text-[var(--color-accent)] active:scale-95 transition-transform duration-300"
        >
          <UserCircle2 size={26} />
        </Link>
      </header>

      <div className="flex flex-col gap-6 px-4 pb-6">
        {/* Hero — Current Incarnation / Soul Resonance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRoadmapOpen(true)}
          className="stone-texture cracked-stone inscribed blood-glow relative cursor-pointer overflow-hidden bg-[var(--color-surface)]"
          style={{
            borderTop: "1px solid var(--color-gold-faint)",
            borderBottom: "1px solid var(--color-blood-faint)",
            borderLeft: "4px solid var(--color-blood)",
            borderRight: "1px solid rgba(93,60,40,0.35)",
          }}
        >
          {/* ───── Zone image du personnage ───── */}
          <div
            className="relative h-56 w-full overflow-hidden border-b border-[var(--color-blood-faint)]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 80%, rgba(139,26,58,0.18) 0%, transparent 50%), radial-gradient(ellipse at 50% 60%, rgba(90,15,31,0.10) 0%, transparent 60%), #0a0807",
            }}
          >
            {/* SVG silhouette — guerrier assis près du bûcher */}
            <svg
              viewBox="0 0 400 300"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMax slice"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="bonfire" cx="50%" cy="85%" r="22%">
                  <stop offset="0%" stopColor="#ff7a3a" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#8b1a3a" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#0a0807" stopOpacity="0" />
                </radialGradient>
                <filter id="smoke">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
                  <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.25 0" />
                </filter>
              </defs>
              {/* Sol pierre */}
              <rect
                x="0"
                y="250"
                width="400"
                height="50"
                fill="#1a0f0a"
                opacity="0.9"
              />
              {/* Aura du feu */}
              <ellipse cx="200" cy="255" rx="90" ry="40" fill="url(#bonfire)" />
              {/* Silhouette guerrier assis */}
              <g fill="#05040a" opacity="0.95">
                {/* Tête encapuchonnée */}
                <path d="M190 180 Q 188 168 195 162 Q 205 157 215 162 Q 222 168 220 180 Q 226 186 224 196 L 212 200 L 200 200 L 186 196 Q 184 186 190 180 Z" />
                {/* Torse + cape */}
                <path d="M178 200 Q 172 214 170 232 Q 168 246 174 258 L 238 258 Q 244 246 242 232 Q 240 216 234 200 L 220 198 L 192 198 Z" />
                {/* Bras tenant l'épée */}
                <path d="M174 216 Q 162 226 160 242 L 174 254 L 176 240 Z" />
                {/* Épée plantée */}
                <rect x="158" y="198" width="2" height="62" />
                <rect x="155" y="196" width="8" height="3" />
              </g>
              {/* Bûcher */}
              <g stroke="#1a0a05" strokeWidth="2" fill="none">
                <line x1="182" y1="262" x2="218" y2="245" />
                <line x1="218" y1="262" x2="182" y2="245" />
                <line x1="190" y1="260" x2="210" y2="250" />
              </g>
              {/* Flammes */}
              <g fill="#a53a08" opacity="0.85">
                <path d="M198 240 Q 195 230 200 220 Q 205 232 202 240 Z" />
                <path d="M206 242 Q 204 234 208 226 Q 211 236 209 244 Z" />
              </g>
              <g fill="#c97b4f" opacity="0.7">
                <path d="M201 236 Q 200 228 203 222 Q 206 230 204 236 Z" />
              </g>
              {/* Fumée */}
              <rect
                x="0"
                y="0"
                width="400"
                height="300"
                filter="url(#smoke)"
                opacity="0.6"
              />
            </svg>
            {/* Dégradé de fondu vers le bas de la zone */}
            <div
              className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, var(--color-surface) 95%)",
              }}
            />
            {/* Aura de braise latérale */}
            <div
              className="pointer-events-none absolute -right-6 top-6 h-40 w-40 rounded-full blur-3xl"
              style={{ background: "rgba(139,26,58,0.2)" }}
            />
          </div>

          {/* ───── Bloc texte ───── */}
          <div className="relative p-6">
            <p className="font-headline text-[10px] uppercase tracking-gravure text-[var(--color-gold)]">
              ── Current Incarnation ──
            </p>
            <h2 className="mt-3 font-headline text-5xl font-extrabold leading-none tracking-tighter text-[var(--color-gold)] drop-shadow-[0_2px_0_rgba(0,0,0,0.9)]">
              {getTitle(level)}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="border border-[var(--color-blood)]/60 bg-[var(--color-blood)]/15 px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-widest text-[var(--color-blood-glow)]">
                {display}
              </span>
              <span className="font-headline text-[11px] italic text-[var(--color-text-subtle)]">
                « {settings.name ? `bienvenue ${settings.name}` : formatLongDate()} »
              </span>
            </div>

          {/* Soul Resonance block */}
          <div
            className="relative mt-6 inscribed bg-black/50 p-4 backdrop-blur-sm"
            style={{ border: "1px solid rgba(127,43,0,0.5)" }}
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="font-headline text-[10px] uppercase tracking-gravure text-[var(--color-gold)]">
                  Soul Resonance
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="font-headline text-4xl font-black leading-none text-[var(--color-text)] drop-shadow-[0_2px_0_rgba(0,0,0,0.9)]">
                    {totalXp.toLocaleString("fr-FR")}
                  </span>
                  <Flame
                    size={18}
                    className="mb-1 text-[var(--color-blood-glow)]"
                    fill="currentColor"
                  />
                </div>
              </div>
              <p className="text-right font-headline text-[10px] italic text-[var(--color-text-subtle)]">
                {next
                  ? `${xpToNext.toLocaleString("fr-FR")} XP avant ${next.label}`
                  : "Apex reached"}
              </p>
            </div>
            <div className="mt-3 h-[4px] w-full bg-black/80 ring-1 ring-black">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-blood) 0%, var(--color-blood-glow) 100%)",
                  boxShadow: "0 0 10px var(--color-blood-glow)",
                }}
              />
            </div>
          </div>

          {/* Streak */}
          <div
            className="relative mt-4 flex items-center gap-3 bg-black/60 px-3 py-2.5 inscribed"
            style={{ border: "1px solid rgba(127,43,0,0.45)" }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center border bg-black/50"
              style={{
                borderColor:
                  streak > 0 ? "var(--color-blood)" : "rgba(93,60,40,0.4)",
              }}
            >
              <Flame
                size={18}
                className={
                  streak > 0
                    ? "text-[var(--color-blood-glow)]"
                    : "text-[var(--color-text-subtle)]"
                }
                fill={streak > 0 ? "currentColor" : "none"}
              />
            </div>
            <div className="flex-1">
              <p className="font-headline text-[10px] uppercase tracking-gravure text-[var(--color-gold)]">
                Bonfire Streak
              </p>
              <p className="font-headline text-sm font-bold text-[var(--color-text)]">
                {streak} {streak <= 1 ? "jour" : "jours"}
                <span className="ml-2 text-[10px] font-normal italic text-[var(--color-text-subtle)]">
                  record : {best}
                </span>
              </p>
            </div>
          </div>
          </div>
        </motion.div>

        <LevelRoadmap
          open={roadmapOpen}
          onClose={() => setRoadmapOpen(false)}
          totalXp={totalXp}
          mode="global"
        />

        {/* Pillars — Daily Covenants */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
            <h3 className="font-headline text-2xl italic text-[var(--color-gold)]">
              Daily Covenants
            </h3>
            <span className="font-headline text-[10px] uppercase tracking-gravure text-[var(--color-text-subtle)]">
              Sanctified Tasks
            </span>
          </div>

          <PillarCardLarge
            href="/sport"
            icon={<Dumbbell size={28} />}
            label="Might"
            sub="Sport"
            accent="#5a0f1f"
            weekCount={sportWeek.count}
            weekGoal={settings.weeklyGoals.sportSessions}
            weekUnit={sportWeek.count <= 1 ? "séance" : "séances"}
            totalXp={sportTotal.totalXp}
          />

          <PillarCardLarge
            href="/etude"
            icon={<BookOpen size={28} />}
            label="Mind"
            sub="Étude"
            accent="#3a0a14"
            weekCount={studyWeek.count}
            weekGoal={settings.weeklyGoals.studySessions}
            weekUnit={studyWeek.count <= 1 ? "session" : "sessions"}
            totalXp={studyTotal.totalXp}
          />

          <PillarCardLarge
            href="/sante"
            icon={<Heart size={28} />}
            label="Spirit"
            sub="Santé"
            accent="#6b1030"
            weekCount={favRecipes.length}
            weekUnit={favRecipes.length <= 1 ? "recette favorite" : "recettes favorites"}
            totalXp={0}
          />
        </section>

        {/* Year heatmap */}
        <YearHeatmap workouts={workouts} sessions={sessions} />

        {/* Skill tree — Relic */}
        <Link
          href="/competences"
          className="stone-texture ghost-border flex items-center justify-between gap-3 bg-[var(--color-surface-2)] p-5 active:bg-[var(--color-surface-3)] transition-all duration-400"
          style={{ borderLeft: "3px solid var(--color-accent)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)] ember-glow">
              <TreePine size={22} />
            </div>
            <div>
              <p className="font-headline text-[10px] uppercase tracking-gravure text-[var(--color-accent)]">
                Lost Lore
              </p>
              <h3 className="font-headline text-lg font-bold">Compétences</h3>
              <p className="text-[11px] italic text-[var(--color-text-subtle)]">
                Ton arbre de progression
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[var(--color-accent)]" />
        </Link>

        {/* Quêtes — Pacts */}
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
            <h3 className="flex items-center gap-2 font-headline text-xl italic text-[var(--color-text-muted)]">
              <Target size={14} className="text-[var(--color-accent)]" /> Pacts
              {activeCount > 0 && (
                <span className="border border-[var(--color-accent-glow)]/40 bg-[var(--color-accent-glow)]/10 px-1.5 text-[10px] font-bold text-[var(--color-accent-glow)]">
                  {activeCount}
                </span>
              )}
            </h3>
            <Link
              href="/quetes"
              className="flex items-center gap-1 font-headline text-[10px] uppercase tracking-widest text-[var(--color-text-subtle)] active:text-[var(--color-accent)]"
            >
              Tout voir <ChevronRight size={11} />
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
              className="flex items-center justify-center gap-2 border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 px-4 py-4 font-headline text-xs italic text-[var(--color-text-subtle)] active:bg-[var(--color-surface)]"
            >
              <Target size={14} />
              Sceller un premier pacte
            </Link>
          )}
        </section>

        {/* Agenda — Fate */}
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
            <h3 className="flex items-center gap-2 font-headline text-xl italic text-[var(--color-text-muted)]">
              <CalendarDays size={14} className="text-[var(--color-accent)]" /> Fate
            </h3>
            <Link
              href="/agenda"
              className="flex items-center gap-1 font-headline text-[10px] uppercase tracking-widest text-[var(--color-text-subtle)] active:text-[var(--color-accent)]"
            >
              Tout voir <ChevronRight size={11} />
            </Link>
          </div>

          {/* Today chip */}
          <Link
            href="/agenda"
            className="stone-texture ghost-border flex items-center justify-between gap-3 bg-[var(--color-surface)] px-4 py-3 active:bg-[var(--color-surface-2)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="font-headline text-[10px] uppercase tracking-widest text-[var(--color-accent)]">
                  Today
                </p>
                <h3 className="font-headline text-sm font-bold">Aujourd&apos;hui</h3>
                <p className="mt-0.5 text-[11px] italic text-[var(--color-text-subtle)]">
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
                    className="flex h-7 w-7 items-center justify-center border-2 border-[var(--color-surface)] text-sm ember-emoji"
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
              className="flex items-center justify-center gap-2 border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 px-4 py-4 font-headline text-xs italic text-[var(--color-text-subtle)] active:bg-[var(--color-surface)]"
            >
              <CalendarPlus size={14} />
              Planifier un événement
            </Link>
          )}
        </section>

        {/* Future pillars — Unborn Fragments */}
        <section className="stone-texture ghost-border bg-[var(--color-surface)]/50 p-5">
          <div className="mb-3 flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
            <Sparkles size={14} className="text-[var(--color-accent-glow)]" />
            <p className="font-headline text-[10px] uppercase tracking-gravure text-[var(--color-accent-glow)]">
              Unborn Fragments
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FUTURE_PILLARS.map((p) => (
              <div
                key={p.label}
                className="ghost-border flex flex-col items-center gap-1 bg-[var(--color-surface-2)]/40 py-3 opacity-60"
              >
                <span className="text-[var(--color-gold-deep)]">{p.icon}</span>
                <span className="font-headline text-[10px] uppercase tracking-widest text-[var(--color-text-subtle)]">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
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
      className="stone-texture inscribed flex items-center gap-3 bg-[var(--color-surface)] px-3 py-3 active:bg-[var(--color-surface-2)]"
      style={{ borderLeft: "3px solid var(--color-blood-deep)" }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--color-gold)]/30 bg-black/50 text-base grayscale"
      >
        {quest.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-headline text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
          {quest.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="relative h-[3px] flex-1 bg-black/70 ring-1 ring-black/80">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.ratio * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-blood) 0%, var(--color-blood-glow) 100%)",
                boxShadow: "0 0 6px var(--color-blood-glow)",
              }}
            />
          </div>
          <span className="shrink-0 font-headline text-[10px] uppercase tracking-widest text-[var(--color-text-subtle)]">
            {progress.label || (progress.done ? "Fait" : "À faire")}
          </span>
        </div>
      </div>
      <span className="shrink-0 border border-[var(--color-gold)]/40 bg-black/50 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">
        +{quest.xpReward}
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
      className="stone-texture inscribed flex items-center gap-3 bg-[var(--color-surface)] px-3 py-3 active:bg-[var(--color-surface-2)]"
      style={{ borderLeft: "3px solid var(--color-blood-deep)" }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--color-gold)]/30 bg-black/50 text-base grayscale">
        {item.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-headline text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
          {item.title}
        </p>
        {item.categoryLabel && (
          <p className="font-headline text-[9px] uppercase tracking-gravure text-[var(--color-text-subtle)]">
            {item.categoryLabel}
          </p>
        )}
      </div>
      <span className="shrink-0 border border-[var(--color-gold)]/40 bg-black/50 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">
        {relative}
      </span>
    </Link>
  );
}

interface PillarBase {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub?: string;
  accent: string;
  weekCount: number;
  weekGoal?: number;
  weekUnit: string;
  totalXp: number;
}

/* ───── Large dominant tile — horizontal, ornements ───── */
function PillarCardLarge({
  href,
  icon,
  label,
  sub,
  accent,
  weekCount,
  weekGoal,
  weekUnit,
  totalXp,
}: PillarBase) {
  const goalRatio = weekGoal ? Math.min(1, weekCount / weekGoal) : null;
  const goalReached = goalRatio !== null && goalRatio >= 1;
  const dead = weekCount === 0;

  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="stone-texture inscribed group relative flex items-stretch gap-5 overflow-hidden bg-[var(--color-surface)] p-5 transition-all duration-500 active:bg-[var(--color-surface-2)]"
        style={{
          borderTop: "1px solid var(--color-gold-faint)",
          borderBottom: "1px solid rgba(93,60,40,0.35)",
          borderLeft: `4px solid ${accent}`,
          borderRight: "1px solid rgba(93,60,40,0.35)",
        }}
      >
        {!dead && (
          <div
            className="pointer-events-none absolute -left-6 top-1/2 h-32 w-32 -translate-y-1/2 blur-3xl"
            style={{ background: accent, opacity: 0.35 }}
          />
        )}

        {/* Ornement d'icône — médaillon or */}
        <div
          className="relative flex h-20 w-20 shrink-0 items-center justify-center border-2 blood-glow"
          style={{
            background: "rgba(5,4,3,0.75)",
            borderColor: "var(--color-gold-faint)",
            color: "var(--color-gold)",
          }}
        >
          <div
            className="absolute inset-1 border"
            style={{ borderColor: `${accent}80` }}
          />
          <div className="relative">{icon}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {sub && (
              <p className="font-headline text-[9px] uppercase tracking-gravure text-[var(--color-blood-glow)]">
                ── {sub} ──
              </p>
            )}
          </div>
          <h3 className="mt-1 font-headline text-3xl font-black uppercase tracking-tight text-[var(--color-gold)] leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.9)]">
            {label}
          </h3>
          <p className="mt-2 text-[11px] italic text-[var(--color-text-subtle)]">
            {weekGoal
              ? `${weekCount}/${weekGoal} ${weekUnit} cette semaine`
              : `${weekCount} ${weekUnit} cette semaine`}
          </p>
          {goalRatio !== null && (
            <div className="mt-2 relative h-[5px] w-full bg-black/70 ring-1 ring-black">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalRatio * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full"
                style={{
                  background: `linear-gradient(90deg, ${accent} 0%, var(--color-blood-glow) 100%)`,
                  boxShadow: `0 0 10px ${accent}`,
                }}
              />
            </div>
          )}
          <p className="mt-2 font-headline text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold-deep)]">
            {totalXp.toLocaleString("fr-FR")} XP · Soul
          </p>
        </div>

        {goalReached && (
          <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center border border-[var(--color-gold)] bg-black/70 text-[var(--color-gold)] gold-glow">
            <Trophy size={12} />
          </div>
        )}

        {dead && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
            <span
              className="font-headline text-base font-black uppercase blur-[0.5px]"
              style={{
                color: "var(--color-blood-oxide)",
                letterSpacing: "0.5em",
              }}
            >
              DORMANT
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

