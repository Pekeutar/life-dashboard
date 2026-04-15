import type { Quest, QuestPillarKey } from "./types";
import { questPillar } from "./types";

/** Sum of XP from completed quests, toutes catégories confondues. */
export function totalQuestXp(quests: Quest[]): number {
  return quests
    .filter((q) => q.status === "completed")
    .reduce((sum, q) => sum + q.xpReward, 0);
}

/** XP des quêtes terminées rattachées à un pilier précis (sport / study). */
export function totalQuestXpForPillar(
  quests: Quest[],
  pillar: QuestPillarKey
): number {
  return quests
    .filter((q) => q.status === "completed" && questPillar(q) === pillar)
    .reduce((sum, q) => sum + q.xpReward, 0);
}

/** XP des quêtes terminées sans rattachement (transverses). */
export function totalQuestXpFree(quests: Quest[]): number {
  return quests
    .filter((q) => q.status === "completed" && questPillar(q) === null)
    .reduce((sum, q) => sum + q.xpReward, 0);
}

/** Number of quests in "active" state. */
export function activeQuestsCount(quests: Quest[]): number {
  return quests.filter((q) => q.status === "active").length;
}
