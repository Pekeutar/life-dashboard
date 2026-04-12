import { startOfDay } from "@/lib/utils";

/**
 * Cross-pillar streak: computes the current consecutive-day streak
 * from an arbitrary list of ISO date strings (any pillar activities).
 */
export function computeCrossStreak(isoDates: string[]): number {
  if (isoDates.length === 0) return 0;
  const days = new Set(
    isoDates.map((d) => startOfDay(new Date(d)).getTime())
  );
  const today = startOfDay(new Date()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  let cursor = days.has(today)
    ? today
    : days.has(today - oneDay)
      ? today - oneDay
      : null;
  if (cursor === null) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor -= oneDay;
  }
  return streak;
}

export function computeBestCrossStreak(isoDates: string[]): number {
  if (isoDates.length === 0) return 0;
  const daysArr = Array.from(
    new Set(isoDates.map((d) => startOfDay(new Date(d)).getTime()))
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
