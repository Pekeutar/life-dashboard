import type { Quest, QuestScope } from "./types";
import type { Workout } from "@/lib/sport/types";
import type { StudySession } from "@/lib/study/types";

export interface QuestProgress {
  current: number;
  target: number;
  /** Clamped 0..1 */
  ratio: number;
  done: boolean;
  unit: string; // "séances" | "min" | "km" | ""
  label: string; // short "2/3 séances" / "45/60 min" / "Fait ?"
}

/**
 * Does `isoDate` fall within the quest's scope?
 * createdAt acts as the lower bound for ongoing / deadline scopes.
 */
function isInScope(
  isoDate: string,
  scope: QuestScope,
  createdAt: string
): boolean {
  const d = new Date(isoDate).getTime();
  const created = new Date(createdAt).getTime();

  if (scope.kind === "ongoing") {
    return d >= created;
  }
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

export function computeQuestProgress(
  quest: Quest,
  workouts: Workout[],
  sessions: StudySession[]
): QuestProgress {
  const { tracker } = quest;

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
    if (tracker.pillar === "sport" || tracker.pillar === "any") {
      for (const w of workouts) {
        if (!isInScope(w.date, quest.scope, quest.createdAt)) continue;
        if (tracker.filter?.sportType && w.type !== tracker.filter.sportType)
          continue;
        count++;
      }
    }
    if (tracker.pillar === "study" || tracker.pillar === "any") {
      for (const s of sessions) {
        if (!isInScope(s.date, quest.scope, quest.createdAt)) continue;
        if (tracker.filter?.studyTopic && s.topic !== tracker.filter.studyTopic)
          continue;
        count++;
      }
    }
    const unit =
      tracker.pillar === "study"
        ? "sessions"
        : tracker.pillar === "sport"
          ? "séances"
          : "actions";
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
    if (tracker.pillar === "sport" || tracker.pillar === "any") {
      for (const w of workouts) {
        if (!isInScope(w.date, quest.scope, quest.createdAt)) continue;
        if (tracker.filter?.sportType && w.type !== tracker.filter.sportType)
          continue;
        minutes += w.durationMin;
      }
    }
    if (tracker.pillar === "study" || tracker.pillar === "any") {
      for (const s of sessions) {
        if (!isInScope(s.date, quest.scope, quest.createdAt)) continue;
        if (tracker.filter?.studyTopic && s.topic !== tracker.filter.studyTopic)
          continue;
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
    for (const w of workouts) {
      if (!isInScope(w.date, quest.scope, quest.createdAt)) continue;
      if (tracker.filter?.sportType && w.type !== tracker.filter.sportType)
        continue;
      if (w.distanceKm) km += w.distanceKm;
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

/**
 * Compute sub-quest completion ratio (fraction of sub-quests in "completed"
 * status or with a manual tracker marked done). Used as a secondary visual.
 */
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
