import type { Quest, QuestScope } from "./types";
import type { Workout } from "@/lib/sport/types";
import type { StudySession } from "@/lib/study/types";

export interface QuestProgress {
  current: number;
  target: number;
  /** Clamped 0..1 */
  ratio: number;
  done: boolean;
  unit: string;
  label: string;
}

function isInScope(
  isoDate: string,
  scope: QuestScope,
  createdAt: string
): boolean {
  const d = new Date(isoDate).getTime();
  const created = new Date(createdAt).getTime();

  if (scope.kind === "ongoing") return d >= created;
  if (scope.kind === "week") {
    const start = new Date(scope.weekStart).getTime();
    const end = start + 7 * 24 * 60 * 60 * 1000;
    return d >= start && d < end;
  }
  if (scope.kind === "deadline") {
    const until = new Date(scope.until).getTime();
    return d >= created && d <= until;
  }
  return false;
}

/**
 * Un workout nourrit la quête seulement si le link pointe vers le sport
 * ET que la matière (sportType) est spécifiée et correspond.
 */
function workoutMatches(link: Quest["link"], w: Workout): boolean {
  if (link.kind !== "sport") return false;
  if (!link.sportType) return false;
  return w.type === link.sportType;
}

function sessionMatches(link: Quest["link"], s: StudySession): boolean {
  if (link.kind !== "study") return false;
  if (!link.studyTopic) return false;
  return s.topic === link.studyTopic;
}

export function computeQuestProgress(
  quest: Quest,
  workouts: Workout[],
  sessions: StudySession[]
): QuestProgress {
  const { tracker } = quest;
  const link: Quest["link"] = quest.link ?? { kind: "free" };

  if (tracker.kind === "manual") {
    return {
      current: tracker.done ? 1 : 0,
      target: 1,
      ratio: tracker.done ? 1 : 0,
      done: tracker.done,
      unit: "",
      label: tracker.done ? "Fait ✓" : "À faire",
    };
  }

  if (tracker.kind === "count") {
    let count = 0;
    if (link.kind === "sport") {
      for (const w of workouts) {
        if (!isInScope(w.date, quest.scope, quest.createdAt)) continue;
        if (!workoutMatches(link, w)) continue;
        count++;
      }
    } else if (link.kind === "study") {
      for (const s of sessions) {
        if (!isInScope(s.date, quest.scope, quest.createdAt)) continue;
        if (!sessionMatches(link, s)) continue;
        count++;
      }
    }
    const unit = link.kind === "study" ? "sessions" : "séances";
    return {
      current: count,
      target: tracker.target,
      ratio: Math.min(1, count / tracker.target),
      done: count >= tracker.target,
      unit,
      label: `${count}/${tracker.target} ${unit}`,
    };
  }

  if (tracker.kind === "duration") {
    let minutes = 0;
    if (link.kind === "sport") {
      for (const w of workouts) {
        if (!isInScope(w.date, quest.scope, quest.createdAt)) continue;
        if (!workoutMatches(link, w)) continue;
        minutes += w.durationMin;
      }
    } else if (link.kind === "study") {
      for (const s of sessions) {
        if (!isInScope(s.date, quest.scope, quest.createdAt)) continue;
        if (!sessionMatches(link, s)) continue;
        minutes += s.durationMin;
      }
    }
    return {
      current: minutes,
      target: tracker.targetMin,
      ratio: Math.min(1, minutes / tracker.targetMin),
      done: minutes >= tracker.targetMin,
      unit: "min",
      label: `${minutes}/${tracker.targetMin} min`,
    };
  }

  if (tracker.kind === "distance") {
    let km = 0;
    if (link.kind === "sport") {
      for (const w of workouts) {
        if (!isInScope(w.date, quest.scope, quest.createdAt)) continue;
        if (!workoutMatches(link, w)) continue;
        if (w.distanceKm) km += w.distanceKm;
      }
    }
    const rounded = Math.round(km * 10) / 10;
    return {
      current: rounded,
      target: tracker.targetKm,
      ratio: Math.min(1, km / tracker.targetKm),
      done: km >= tracker.targetKm,
      unit: "km",
      label: `${rounded}/${tracker.targetKm} km`,
    };
  }

  return {
    current: 0,
    target: 1,
    ratio: 0,
    done: false,
    unit: "",
    label: "",
  };
}

export function computeSubQuestsSummary(
  parentId: string,
  allQuests: Quest[]
): { done: number; total: number } {
  const subs = allQuests.filter((q) => q.parentId === parentId);
  const done = subs.filter(
    (q) =>
      q.status === "completed" ||
      (q.tracker.kind === "manual" && q.tracker.done)
  ).length;
  return { done, total: subs.length };
}
