import type { StudySession, StudyTopic } from "./types";
import { startOfDay, startOfWeek } from "@/lib/utils";

export interface StudyPeriodStats {
  count: number;
  totalMin: number;
  totalXp: number;
}

function empty(): StudyPeriodStats {
  return { count: 0, totalMin: 0, totalXp: 0 };
}

function accumulate(acc: StudyPeriodStats, s: StudySession): StudyPeriodStats {
  return {
    count: acc.count + 1,
    totalMin: acc.totalMin + s.durationMin,
    totalXp: acc.totalXp + s.xp,
  };
}

export function totalStudyStats(sessions: StudySession[]): StudyPeriodStats {
  return sessions.reduce(accumulate, empty());
}

export function thisWeekStudyStats(sessions: StudySession[]): StudyPeriodStats {
  const weekStart = startOfWeek(new Date()).getTime();
  return sessions
    .filter((s) => new Date(s.date).getTime() >= weekStart)
    .reduce(accumulate, empty());
}

export function thisMonthStudyStats(sessions: StudySession[]): StudyPeriodStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return sessions
    .filter((s) => new Date(s.date).getTime() >= monthStart)
    .reduce(accumulate, empty());
}

export function todayStudyStats(sessions: StudySession[]): StudyPeriodStats {
  const dayStart = startOfDay(new Date()).getTime();
  return sessions
    .filter((s) => new Date(s.date).getTime() >= dayStart)
    .reduce(accumulate, empty());
}

export function weeklyStudyVolume(
  sessions: StudySession[],
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
    const inRange = sessions.filter((s) => {
      const t = new Date(s.date).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    result.push({
      weekStart: start.toISOString().slice(0, 10),
      minutes: inRange.reduce((sum, s) => sum + s.durationMin, 0),
      count: inRange.length,
    });
  }
  return result;
}

export function studyTopicDistribution(
  sessions: StudySession[]
): { topic: StudyTopic; count: number; minutes: number }[] {
  const map = new Map<StudyTopic, { count: number; minutes: number }>();
  for (const s of sessions) {
    const cur = map.get(s.topic) ?? { count: 0, minutes: 0 };
    map.set(s.topic, {
      count: cur.count + 1,
      minutes: cur.minutes + s.durationMin,
    });
  }
  return Array.from(map.entries())
    .map(([topic, v]) => ({ topic, ...v }))
    .sort((a, b) => b.minutes - a.minutes);
}
