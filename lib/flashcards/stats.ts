import type { Flashcard } from "./types";

/** End-of-day local time (23:59:59.999). */
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** All cards due up to the end of today, optionally filtered by deck. */
export function dueCards(
  cards: Flashcard[],
  deckId?: string,
  now: Date = new Date()
): Flashcard[] {
  const limit = endOfDay(now).getTime();
  return cards.filter((c) => {
    if (deckId && c.deckId !== deckId) return false;
    return new Date(c.dueDate).getTime() <= limit;
  });
}

export function dueCount(
  cards: Flashcard[],
  deckId?: string,
  now: Date = new Date()
): number {
  return dueCards(cards, deckId, now).length;
}

export function countByDeck(cards: Flashcard[], deckId: string): number {
  return cards.filter((c) => c.deckId === deckId).length;
}

/** Cards sorted by due date ascending (most overdue first). */
export function sortedDueFirst(cards: Flashcard[]): Flashcard[] {
  return [...cards].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}
