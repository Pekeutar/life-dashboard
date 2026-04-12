export type SkillPillar = "sport" | "study" | "any";

export type SkillStatus = "locked" | "available" | "unlocked";

export interface Skill {
  id: string;
  label: string;
  emoji: string;
  description?: string;
  /** Column in the grid (0 = leftmost). */
  col: number;
  /** Row in the grid (0 = top). */
  row: number;
  /** XP threshold on `pillar` at which the skill unlocks. */
  requiredXp: number;
  pillar: SkillPillar;
  /** IDs of skills that must be unlocked first. */
  parents: string[];
  color: string;
  createdAt: string;
}

export type NewSkillInput = Omit<Skill, "id" | "createdAt">;

export interface XpByPillar {
  sport: number;
  study: number;
  /** Cross-pillar total. */
  any: number;
}
