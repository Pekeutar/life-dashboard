import type { Intensity } from "./types";

export function computeXp(durationMin: number, intensity: Intensity): number {
  return Math.max(0, Math.round(durationMin * intensity));
}

// Re-export gamification utilities for backward compat with existing imports.
export {
  LEVELS,
  getLevel,
  getLevelProgress,
  getTitle,
  getPillarRank,
  getPillarRankProgress,
  getStreakBonus,
  PILLAR_RANKS,
  type Level,
  type LevelProgress,
  type PillarRank,
  type PillarRankProgress,
  type StreakBonus,
} from "@/lib/gamification";
