import type { Workout } from "./types";
import { startOfDay } from "@/lib/utils";

/**
 * Returns the current streak: number of consecutive days up to today
 * (or yesterday) with at least one workout.
 * If the last workout is older than yesterday, the streak is 0.
 */
export function computeStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;

  const days = new Set(
    workouts.map((w) => startOfDay(new Date(w.date)).getTime())
  );

  const today = startOfDay(new Date()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  // Start from today; if none today, fall back to yesterday.
  let cursor = days.has(today) ? today : days.has(today - oneDay) ? today - oneDay : null;
  if (cursor === null) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor -= oneDay;
  }
  return streak;
}

/**
 * Returns the longest streak ever recorded in the workouts list.
 */
export function computeBestStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const daysArr = Array.from(
    new Set(workouts.map((w) => startOfDay(new Date(w.date)).getTime()))
  ).sort((a, b) => a - b);
  const oneDay = 24 * 60 * 60 * 1000;
  let best = 1;
  let current = 1;
  for (let i = 1; i < daysArr.length; i++) {
    if (daysArr[i] - daysArr[i - 1] === oneDay) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}
