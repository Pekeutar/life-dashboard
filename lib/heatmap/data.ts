import type { Workout } from "@/lib/sport/types";
import type { StudySession } from "@/lib/study/types";
import { dayKey, startOfDay, startOfWeek } from "@/lib/utils";

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  /** YYYY-MM-DD in local time */
  date: string;
  dateObj: Date;
  xp: number;
  sportCount: number;
  studyCount: number;
  level: HeatmapLevel;
  /** True if date is strictly after today — rendered as empty placeholder. */
  isFuture: boolean;
}

export interface HeatmapData {
  /** 53 columns × 7 rows. weeks[col][row], row 0 = Monday. */
  weeks: HeatmapDay[][];
  startDate: Date;
  endDate: Date;
  maxXp: number;
  totalXp: number;
  activeDays: number;
}

interface DayBucket {
  xp: number;
  sportCount: number;
  studyCount: number;
}

/**
 * Build a 53-week heatmap grid ending on the week containing `today`.
 * Intensity is derived from the XP earned that day relative to the
 * year's peak day — so the top bucket always lights up at full color.
 */
export function buildYearHeatmap(
  workouts: Workout[],
  sessions: StudySession[],
  today: Date = new Date()
): HeatmapData {
  const perDay = new Map<string, DayBucket>();

  for (const w of workouts) {
    const key = dayKey(w.date);
    const cur = perDay.get(key) ?? { xp: 0, sportCount: 0, studyCount: 0 };
    cur.xp += w.xp;
    cur.sportCount += 1;
    perDay.set(key, cur);
  }

  for (const s of sessions) {
    const key = dayKey(s.date);
    const cur = perDay.get(key) ?? { xp: 0, sportCount: 0, studyCount: 0 };
    cur.xp += s.xp;
    cur.studyCount += 1;
    perDay.set(key, cur);
  }

  // Peak day within the rendered window (not all-time) so the scale adapts.
  const todayStart = startOfDay(today).getTime();
  const endWeekStart = startOfWeek(today); // Monday of current week
  const startWeekStart = new Date(endWeekStart);
  startWeekStart.setDate(startWeekStart.getDate() - 52 * 7);

  let maxXp = 0;
  for (const [key, bucket] of perDay) {
    const d = new Date(key).getTime();
    if (d >= startWeekStart.getTime() && d <= todayStart && bucket.xp > maxXp) {
      maxXp = bucket.xp;
    }
  }
  if (maxXp === 0) maxXp = 1; // avoid div-by-zero

  const weeks: HeatmapDay[][] = [];
  let totalXp = 0;
  let activeDays = 0;

  for (let w = 0; w < 53; w++) {
    const week: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startWeekStart);
      date.setDate(startWeekStart.getDate() + w * 7 + d);
      const key = dayKey(date);
      const bucket = perDay.get(key) ?? {
        xp: 0,
        sportCount: 0,
        studyCount: 0,
      };
      const isFuture = startOfDay(date).getTime() > todayStart;
      const ratio = bucket.xp / maxXp;
      const level: HeatmapLevel =
        bucket.xp === 0
          ? 0
          : ratio <= 0.25
            ? 1
            : ratio <= 0.5
              ? 2
              : ratio <= 0.75
                ? 3
                : 4;

      if (!isFuture && bucket.xp > 0) {
        totalXp += bucket.xp;
        activeDays += 1;
      }

      week.push({
        date: key,
        dateObj: date,
        xp: bucket.xp,
        sportCount: bucket.sportCount,
        studyCount: bucket.studyCount,
        level,
        isFuture,
      });
    }
    weeks.push(week);
  }

  const endDate = new Date(endWeekStart);
  endDate.setDate(endWeekStart.getDate() + 6);

  return {
    weeks,
    startDate: startWeekStart,
    endDate,
    maxXp,
    totalXp,
    activeDays,
  };
}
