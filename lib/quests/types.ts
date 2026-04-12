export type QuestPillar = "sport" | "study" | "any";

export type QuestStatus = "active" | "completed" | "archived";

/**
 * Scope of a quest — the time window during which tracked actions count.
 *  - ongoing: no time limit, counts everything since creation
 *  - week: restricted to a specific week (weekStart = ISO of monday 00:00)
 *  - deadline: restricted to [createdAt, until] inclusive
 */
export type QuestScope =
  | { kind: "ongoing" }
  | { kind: "week"; weekStart: string }
  | { kind: "deadline"; until: string };

/**
 * Optional filter to narrow auto-tracked quests to a specific sport/topic.
 */
export interface QuestFilter {
  sportType?: string;
  studyTopic?: string;
}

/**
 * How the quest's completion is tracked.
 *  - manual: simple toggle ("I did it")
 *  - count: counts matching actions in scope
 *  - duration: sums matching durations (minutes)
 *  - distance: sums matching distances (km, sport only)
 */
export type QuestTracker =
  | { kind: "manual"; done: boolean }
  | {
      kind: "count";
      pillar: QuestPillar;
      target: number;
      filter?: QuestFilter;
    }
  | {
      kind: "duration";
      pillar: QuestPillar;
      targetMin: number;
      filter?: QuestFilter;
    }
  | {
      kind: "distance";
      targetKm: number;
      filter?: QuestFilter;
    };

export interface Quest {
  id: string;
  /** If present, this quest is a sub-quest (child step) of another. */
  parentId?: string;
  title: string;
  description?: string;
  emoji: string;
  color: string;
  /** For cross-pilier level aggregation. */
  pillar: QuestPillar;
  scope: QuestScope;
  tracker: QuestTracker;
  xpReward: number;
  status: QuestStatus;
  createdAt: string;
  completedAt?: string;
}

export type NewQuestInput = Omit<
  Quest,
  "id" | "status" | "createdAt" | "completedAt"
>;
