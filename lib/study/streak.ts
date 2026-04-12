import type { StudySession } from "./types";
import { startOfDay } from "@/lib/utils";

export function computeStudyStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;

  const days = new Set(
    sessions.map((s) => startOfDay(new Date(s.date)).getTime())
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

export function computeBestStudyStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const daysArr = Array.from(
    new Set(sessions.map((s) => startOfDay(new Date(s.date)).getTime()))
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
