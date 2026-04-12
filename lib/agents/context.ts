/**
 * Agent context — builds a structured snapshot of ALL user data
 * to inject into agent prompts.
 *
 * This is a React hook (useAgentContext) because the underlying
 * stores are React hooks backed by localStorage.
 */

import { useMemo } from "react";
import { useWorkouts } from "@/lib/sport/store";
import { useStudySessions } from "@/lib/study/store";
import { useDecks, useFlashcards } from "@/lib/flashcards/store";
import { useQuests } from "@/lib/quests/store";
import { computeStreak, computeBestStreak } from "@/lib/sport/streak";
import { totalStats, thisWeekStats } from "@/lib/sport/stats";
import { totalStudyStats, thisWeekStudyStats } from "@/lib/study/stats";
import { dueCards } from "@/lib/flashcards/stats";
import { getLevel, getLevelProgress } from "@/lib/gamification";
import type {
  AgentContext,
  SportSnapshot,
  StudySnapshot,
  FlashcardSnapshot,
  QuestSnapshot,
} from "./types";

/* ── Helpers ── */

/** Top N items by frequency from a string array. */
function topN(items: string[], n = 3): string[] {
  const freq = new Map<string, number>();
  for (const item of items) {
    freq.set(item, (freq.get(item) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

/** Average of a number array. Returns 0 if empty. */
function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/* ── Hook ── */

export function useAgentContext(): AgentContext | null {
  const { workouts, hydrated: wH } = useWorkouts();
  const { sessions, hydrated: sH } = useStudySessions();
  const { decks, hydrated: dH } = useDecks();
  const { cards, hydrated: cH } = useFlashcards();
  const { quests, hydrated: qH } = useQuests();

  const hydrated = wH && sH && dH && cH && qH;

  return useMemo(() => {
    if (!hydrated) return null;

    // ── Sport ──
    const sportTotal = totalStats(workouts);
    const sportWeek = thisWeekStats(workouts);
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const sport: SportSnapshot = {
      totalXp: sportTotal.totalXp,
      streak: computeStreak(workouts),
      bestStreak: computeBestStreak(workouts),
      totalSessions: workouts.length,
      thisWeek: {
        count: sportWeek.count,
        totalMin: sportWeek.totalMin,
        totalKm: sportWeek.totalKm,
      },
      lastWorkoutDate: sortedWorkouts[0]?.date ?? null,
      topSportTypes: topN(workouts.map((w) => w.type)),
      avgIntensity: avg(workouts.map((w) => w.intensity)),
      avgFeeling: avg(workouts.map((w) => w.feeling)),
    };

    // ── Study ──
    const studyTotal = totalStudyStats(sessions);
    const studyWeek = thisWeekStudyStats(sessions);
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const study: StudySnapshot = {
      totalXp: studyTotal.totalXp,
      totalSessions: sessions.length,
      thisWeek: {
        count: studyWeek.count,
        totalMin: studyWeek.totalMin,
      },
      lastSessionDate: sortedSessions[0]?.date ?? null,
      topTopics: topN(sessions.map((s) => s.topic)),
      avgFocus: avg(sessions.map((s) => s.focus)),
    };

    // ── Flashcards ──
    const due = dueCards(cards);
    const reviewedCards = cards.filter((c) => c.lastReviewedAt);
    const easeFactors = reviewedCards.map((c) => c.easeFactor);

    // Weak decks: decks where average ease factor is below 2.2
    const deckEaseMap = new Map<string, number[]>();
    for (const c of reviewedCards) {
      const arr = deckEaseMap.get(c.deckId) ?? [];
      arr.push(c.easeFactor);
      deckEaseMap.set(c.deckId, arr);
    }
    const weakDecks: FlashcardSnapshot["weakDecks"] = [];
    for (const [deckId, factors] of deckEaseMap) {
      const deckAvg = avg(factors);
      if (deckAvg < 2.2) {
        const deck = decks.find((d) => d.id === deckId);
        if (deck) {
          weakDecks.push({ deckTitle: deck.title, avgEase: deckAvg });
        }
      }
    }
    weakDecks.sort((a, b) => a.avgEase - b.avgEase);

    // Success rate: cards with easeFactor >= 2.5 are "good", below = struggled
    const successRate =
      reviewedCards.length > 0
        ? reviewedCards.filter((c) => c.easeFactor >= 2.3).length /
          reviewedCards.length
        : null;

    const flashcardSnap: FlashcardSnapshot = {
      totalDecks: decks.length,
      totalCards: cards.length,
      dueToday: due.length,
      successRate,
      weakDecks,
      avgEaseFactor:
        easeFactors.length > 0 ? avg(easeFactors) : null,
    };

    // ── Quests ──
    const completedQuests = quests.filter((q) => q.status === "completed");
    const questSnap: QuestSnapshot = {
      active: quests.filter((q) => q.status === "active").length,
      completed: completedQuests.length,
      totalXpEarned: completedQuests.reduce((s, q) => s + q.xpReward, 0),
    };

    // ── Level ──
    const totalXp =
      sportTotal.totalXp + studyTotal.totalXp + questSnap.totalXpEarned;
    const level = getLevel(totalXp);
    const progress = getLevelProgress(totalXp);

    return {
      timestamp: new Date().toISOString(),
      level: {
        id: level.id,
        label: level.label,
        totalXp,
        progress: progress.progress,
      },
      sport,
      study,
      flashcards: flashcardSnap,
      quests: questSnap,
    };
  }, [hydrated, workouts, sessions, decks, cards, quests]);
}

/**
 * Serialize the context to a compact string suitable for LLM prompt injection.
 * Keeps it under ~500 tokens so it doesn't eat into the main prompt budget.
 */
export function contextToPromptString(ctx: AgentContext): string {
  const lines: string[] = [
    `[Profil utilisateur — ${ctx.timestamp.slice(0, 10)}]`,
    `Niveau : ${ctx.level.label} (${ctx.level.totalXp} XP total, progression ${Math.round(ctx.level.progress * 100)}%)`,
    "",
    `SPORT : ${ctx.sport.totalXp} XP, streak ${ctx.sport.streak}j (best ${ctx.sport.bestStreak}j), ${ctx.sport.totalSessions} séances total`,
    `  Cette semaine : ${ctx.sport.thisWeek.count} séances, ${ctx.sport.thisWeek.totalMin}min, ${ctx.sport.thisWeek.totalKm}km`,
    `  Sports principaux : ${ctx.sport.topSportTypes.join(", ") || "aucun"}`,
    `  Intensité moy. : ${ctx.sport.avgIntensity.toFixed(1)}/5, Feeling moy. : ${ctx.sport.avgFeeling.toFixed(1)}/5`,
    "",
    `ÉTUDES : ${ctx.study.totalXp} XP, ${ctx.study.totalSessions} sessions total`,
    `  Cette semaine : ${ctx.study.thisWeek.count} sessions, ${ctx.study.thisWeek.totalMin}min`,
    `  Sujets principaux : ${ctx.study.topTopics.join(", ") || "aucun"}`,
    `  Focus moy. : ${ctx.study.avgFocus.toFixed(1)}/5`,
    "",
    `FLASHCARDS : ${ctx.flashcards.totalCards} cartes dans ${ctx.flashcards.totalDecks} decks, ${ctx.flashcards.dueToday} à réviser aujourd'hui`,
  ];

  if (ctx.flashcards.successRate !== null) {
    lines.push(
      `  Taux de réussite : ${Math.round(ctx.flashcards.successRate * 100)}%, Ease factor moy. : ${ctx.flashcards.avgEaseFactor?.toFixed(2) ?? "?"}`
    );
  }
  if (ctx.flashcards.weakDecks.length > 0) {
    lines.push(
      `  Decks en difficulté : ${ctx.flashcards.weakDecks.map((d) => d.deckTitle).join(", ")}`
    );
  }

  lines.push(
    "",
    `QUÊTES : ${ctx.quests.active} actives, ${ctx.quests.completed} terminées (${ctx.quests.totalXpEarned} XP gagnés)`
  );

  return lines.join("\n");
}
