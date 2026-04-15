export type QuestStatus = "active" | "completed" | "archived";

/** Pilier sur lequel une quête est comptabilisée (XP + auto-tracking). */
export type QuestPillarKey = "sport" | "study";

/**
 * Rattachement de la quête à un pilier + matière.
 *  - free: quête transverse, pas de pilier. Tracker forcément manuel.
 *  - sport/study: pilier + matière optionnelle. Les auto-trackers exigent
 *    la matière (ex: "Programmation" pour Étude, "Course" pour Sport).
 */
export type QuestLink =
  | { kind: "free" }
  | { kind: "sport"; sportType?: string }
  | { kind: "study"; studyTopic?: string };

/**
 * Fenêtre temporelle pendant laquelle les actions comptent.
 *  - ongoing: depuis la création, pas de fin.
 *  - week: une semaine ISO précise.
 *  - deadline: entre createdAt et until inclus.
 */
export type QuestScope =
  | { kind: "ongoing" }
  | { kind: "week"; weekStart: string }
  | { kind: "deadline"; until: string };

/**
 * Mode de validation de la quête.
 *  - manual: à cocher à la main.
 *  - count/duration/distance: auto, alimenté par les sessions du pilier
 *    dont la matière correspond à link.sportType / link.studyTopic.
 */
export type QuestTracker =
  | { kind: "manual"; done: boolean }
  | { kind: "count"; target: number }
  | { kind: "duration"; targetMin: number }
  | { kind: "distance"; targetKm: number };

export interface Quest {
  id: string;
  /** Quête-étape d'une quête parente. */
  parentId?: string;
  title: string;
  description?: string;
  emoji: string;
  color: string;
  link: QuestLink;
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

/** Pilier porteur de la quête, ou null si free. */
export function questPillar(quest: Quest): QuestPillarKey | null {
  const link = quest.link ?? { kind: "free" };
  return link.kind === "free" ? null : link.kind;
}
