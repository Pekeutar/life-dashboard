import type { Flashcard, ReviewGrade } from "./types";

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

/**
 * Create a fresh card in the "new" state: due immediately, no history.
 * Matches SM-2 convention where a brand-new card is reviewed the day it's added.
 */
export function createFreshCard(input: {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: string;
}): Flashcard {
  return {
    ...input,
    repetitions: 0,
    easeFactor: DEFAULT_EASE,
    interval: 0,
    dueDate: input.createdAt,
  };
}

/**
 * Apply SM-2 (3-grade simplified variant) to a card and return the next state.
 *
 * Interval progression for a clean run:
 *   good → 1 d, 6 d, 15 d, 37 d, …  (×EF each step past the second)
 *   hard → 1 d, 3 d, ~6 d, …        (slower growth)
 *   again → reset, 1 d              (wipe streak)
 */
export function scheduleNextReview(
  card: Flashcard,
  grade: ReviewGrade,
  now: Date = new Date()
): Flashcard {
  let { repetitions, easeFactor, interval } = card;

  if (grade === "again") {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else if (grade === "hard") {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.max(1, Math.round(interval * (easeFactor - 0.3)));
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.05);
  } else {
    // "good"
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.max(1, Math.round(interval * easeFactor));
    easeFactor = Math.min(MAX_EASE, easeFactor + 0.1);
  }

  const nextDue = new Date(now);
  nextDue.setHours(0, 0, 0, 0);
  nextDue.setDate(nextDue.getDate() + interval);

  return {
    ...card,
    repetitions,
    easeFactor,
    interval,
    dueDate: nextDue.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/**
 * Short human-readable description of the next review date after a grade.
 * Used to preview grade buttons in the review UI ("Dans 6 j").
 */
export function previewNextInterval(
  card: Flashcard,
  grade: ReviewGrade
): string {
  const next = scheduleNextReview(card, grade);
  const days = next.interval;
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "demain";
  if (days < 30) return `${days} j`;
  const months = Math.round(days / 30);
  return `${months} mois`;
}
