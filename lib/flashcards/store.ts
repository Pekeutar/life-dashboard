"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type {
  Deck,
  Flashcard,
  NewDeckInput,
  NewFlashcardInput,
  ReviewGrade,
} from "./types";
import { createFreshCard, scheduleNextReview } from "./sm2";

const DECKS_KEY = "life-dashboard.flashcard-decks.v1";
const CARDS_KEY = "life-dashboard.flashcards.v1";

export function useDecks() {
  const [decks, setDecks, hydrated] = useLocalStorage<Deck[]>(DECKS_KEY, []);

  const add = useCallback(
    (input: NewDeckInput): Deck => {
      const d: Deck = {
        ...input,
        id: nanoid(10),
        createdAt: new Date().toISOString(),
      };
      setDecks((prev) => [d, ...prev]);
      return d;
    },
    [setDecks]
  );

  const update = useCallback(
    (id: string, patch: Partial<Deck>) => {
      setDecks((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
      );
    },
    [setDecks]
  );

  const remove = useCallback(
    (id: string) => {
      setDecks((prev) => prev.filter((d) => d.id !== id));
    },
    [setDecks]
  );

  return { decks, add, update, remove, hydrated };
}

export function useFlashcards() {
  const [cards, setCards, hydrated] = useLocalStorage<Flashcard[]>(
    CARDS_KEY,
    []
  );

  const add = useCallback(
    (input: NewFlashcardInput): Flashcard => {
      const c = createFreshCard({
        id: nanoid(10),
        deckId: input.deckId,
        front: input.front,
        back: input.back,
        createdAt: new Date().toISOString(),
      });
      setCards((prev) => [c, ...prev]);
      return c;
    },
    [setCards]
  );

  const update = useCallback(
    (id: string, patch: Partial<Flashcard>) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    [setCards]
  );

  const remove = useCallback(
    (id: string) => {
      setCards((prev) => prev.filter((c) => c.id !== id));
    },
    [setCards]
  );

  /** Cascade delete: use when a deck is removed. */
  const removeByDeck = useCallback(
    (deckId: string) => {
      setCards((prev) => prev.filter((c) => c.deckId !== deckId));
    },
    [setCards]
  );

  /** Grade a card and update its SM-2 schedule. */
  const review = useCallback(
    (id: string, grade: ReviewGrade) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? scheduleNextReview(c, grade) : c))
      );
    },
    [setCards]
  );

  return {
    cards,
    add,
    update,
    remove,
    removeByDeck,
    review,
    hydrated,
  };
}
