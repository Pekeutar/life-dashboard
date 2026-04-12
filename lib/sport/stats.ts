import type { Workout, SportType } from "./types";
import { startOfDay, startOfWeek } from "@/lib/utils";

export interface PeriodStats {
  count: number;
  totalMin: number;
  totalKm: number;
  totalXp: number;
}

function empty(): PeriodStats {
  return { count: 0, totalMin: 0, totalKm: 0, totalXp: 0 };
}

function accumulate(acc: PeriodStats, w: Workout): PeriodStats {
  return {
    count: acc.count + 1,
    totalMin: acc.totalMin + w.durationMin,
    totalKm: acc.totalKm + (w.distanceKm ?? 0),
    totalXp: acc.totalXp + w.xp,
  };
}

export function totalStats(workouts: Workout[]): PeriodStats {
  return workouts.reduce(accumulate, empty());
}

export function thisWeekStats(workouts: Workout[]): PeriodStats {
  const weekStart = startOfWeek(new Date()).getTime();
  return workouts
    .filter((w) => new Date(w.date).getTime() >= weekStart)
    .reduce(accumulate, empty());
}

export function thisMonthStats(workouts: Workout[]): PeriodStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return workouts
    .filter((w) => new Date(w.date).getTime() >= monthStart)
    .reduce(accumulate, empty());
}

export function todayStats(workouts: Workout[]): PeriodStats {
  const dayStart = startOfDay(new Date()).getTime();
  return workouts
    .filter((w) => new Date(w.date).getTime() >= dayStart)
    .reduce(accumulate, empty());
}

/**
 * Returns the volume (total minutes) for the last N weeks, oldest first.
 */
export function weeklyVolume(
  workouts: Workout[],
  weeks = 4
): { weekStart: string; minutes: number; count: number }[] {
  const result: { weekStart: string; minutes: number; count: number }[] = [];
  const now = new Date();
  const thisMonday = startOfWeek(now);
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const inRange = workouts.filter((w) => {
      const t = new Date(w.date).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    result.push({
      weekStart: start.toISOString().slice(0, 10),
      minutes: inRange.reduce((s, w) => s + w.durationMin, 0),
      count: inRange.length,
    });
  }
  return result;
}

/**
 * Returns breakdown by sport type (count + total minutes).
 */
export function sportDistribution(
  workouts: Workout[]
): { type: SportType; count: number; minutes: number }[] {
  const map = new Map<SportType, { count: number; minutes: number }>();
  for (const w of workouts) {
    const cur = map.get(w.type) ?? { count: 0, minutes: 0 };
    map.set(w.type, {
      count: cur.count + 1,
      minutes: cur.minutes + w.durationMin,
    });
  }
  return Array.from(map.entries())
    .map(([type, v]) => ({ type, ...v }))
    .sort((a, b) => b.minutes - a.minutes);
}
