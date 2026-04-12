"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type { StudySession, NewStudyInput } from "./types";
import { computeStudyXp } from "./xp";

const STORAGE_KEY = "life-dashboard.study.v1";

export function useStudySessions() {
  const [sessions, setSessions, hydrated] = useLocalStorage<StudySession[]>(
    STORAGE_KEY,
    []
  );

  const add = useCallback(
    (input: NewStudyInput): StudySession => {
      const session: StudySession = {
        ...input,
        id: nanoid(10),
        xp: computeStudyXp(input.durationMin, input.focus),
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev]);
      return session;
    },
    [setSessions]
  );

  const update = useCallback(
    (id: string, patch: Partial<NewStudyInput>) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const merged = { ...s, ...patch };
          return {
            ...merged,
            xp: computeStudyXp(merged.durationMin, merged.focus),
          };
        })
      );
    },
    [setSessions]
  );

  const remove = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setSessions]
  );

  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1));

  return { sessions: sorted, add, update, remove, hydrated };
}
