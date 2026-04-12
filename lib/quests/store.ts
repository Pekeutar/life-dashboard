"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type { NewQuestInput, Quest } from "./types";

const STORAGE_KEY = "life-dashboard.quests.v1";

export function useQuests() {
  const [quests, setQuests, hydrated] = useLocalStorage<Quest[]>(
    STORAGE_KEY,
    []
  );

  const add = useCallback(
    (input: NewQuestInput): Quest => {
      const q: Quest = {
        ...input,
        id: nanoid(10),
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setQuests((prev) => [q, ...prev]);
      return q;
    },
    [setQuests]
  );

  const update = useCallback(
    (id: string, patch: Partial<Quest>) => {
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
      );
    },
    [setQuests]
  );

  /** Remove a quest and cascade-delete its sub-quests. */
  const remove = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.filter((q) => q.id !== id && q.parentId !== id)
      );
    },
    [setQuests]
  );

  /** Toggle done state on a manual-tracker quest. */
  const toggleManual = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          if (q.tracker.kind !== "manual") return q;
          return {
            ...q,
            tracker: { ...q.tracker, done: !q.tracker.done },
          };
        })
      );
    },
    [setQuests]
  );

  /** Claim the reward → mark as completed. */
  const claim = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : q
        )
      );
    },
    [setQuests]
  );

  const archive = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "archived" } : q))
      );
    },
    [setQuests]
  );

  const restore = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: "active", completedAt: undefined }
            : q
        )
      );
    },
    [setQuests]
  );

  return {
    quests,
    add,
    update,
    remove,
    toggleManual,
    claim,
    archive,
    restore,
    hydrated,
  };
}
