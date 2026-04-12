/**
 * 3-grade simplified SM-2:
 *  - "again": raté, on recommence demain
 *  - "hard":  hésité, intervalle élargi modérément
 *  - "good":  je savais, intervalle × easeFactor
 */
export type ReviewGrade = "again" | "hard" | "good";

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;

  // SM-2 state
  /** Number of consecutive correct reviews ("again" resets this to 0). */
  repetitions: number;
  /** Multiplier applied to the interval on good reviews. Default 2.5. */
  easeFactor: number;
  /** Days until the next review (applied from the last review date). */
  interval: number;
  /** ISO of when this card is next due. */
  dueDate: string;
  /** ISO of last review (undefined = never reviewed). */
  lastReviewedAt?: string;

  createdAt: string;
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export type NewDeckInput = Omit<Deck, "id" | "createdAt">;

export interface NewFlashcardInput {
  deckId: string;
  front: string;
  back: string;
}
