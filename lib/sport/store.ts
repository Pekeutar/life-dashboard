"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type { Workout, NewWorkoutInput } from "./types";
import { computeXp } from "./xp";

const STORAGE_KEY = "life-dashboard.workouts.v1";

export function useWorkouts() {
  const [workouts, setWorkouts, hydrated] = useLocalStorage<Workout[]>(
    STORAGE_KEY,
    []
  );

  const add = useCallback(
    (input: NewWorkoutInput): Workout => {
      const workout: Workout = {
        ...input,
        id: nanoid(10),
        xp: computeXp(input.durationMin, input.intensity),
        createdAt: new Date().toISOString(),
      };
      setWorkouts((prev) => [workout, ...prev]);
      return workout;
    },
    [setWorkouts]
  );

  const update = useCallback(
    (id: string, patch: Partial<NewWorkoutInput>) => {
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          const merged = { ...w, ...patch };
          return {
            ...merged,
            xp: computeXp(merged.durationMin, merged.intensity),
          };
        })
      );
    },
    [setWorkouts]
  );

  const remove = useCallback(
    (id: string) => {
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    },
    [setWorkouts]
  );

  // Sort by date desc for display
  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return { workouts: sorted, add, update, remove, hydrated };
}
