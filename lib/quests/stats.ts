import type { Quest, QuestPillar } from "./types";

/** Sum of XP from completed (claimed) quests. */
export function totalQuestXp(quests: Quest[]): number {
  return quests
    .filter((q) => q.status === "completed")
    .reduce((sum, q) => sum + q.xpReward, 0);
}

/** Sum of XP from completed quests for a specific pillar. */
export function totalQuestXpForPillar(
  quests: Quest[],
  pillar: QuestPillar
): number {
  return quests
    .filter((q) => q.status === "completed" && q.pillar === pillar)
    .reduce((sum, q) => sum + q.xpReward, 0);
}

/** Number of quests in "active" state. */
export function activeQuestsCount(quests: Quest[]): number {
  return quests.filter((q) => q.status === "active").length;
}
