export interface Level {
  id: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  label: string;
  emoji: string;
  min: number;
  max: number; // upper bound exclusive (Infinity for top)
  color: string;
}

export const LEVELS: Level[] = [
  { id: "bronze", label: "Bronze", emoji: "🥉", min: 0, max: 500, color: "#b45309" },
  { id: "silver", label: "Argent", emoji: "🥈", min: 500, max: 2000, color: "#9ca3af" },
  { id: "gold", label: "Or", emoji: "🥇", min: 2000, max: 5000, color: "#f59e0b" },
  { id: "platinum", label: "Platine", emoji: "💎", min: 5000, max: 12000, color: "#a855f7" },
  { id: "diamond", label: "Diamant", emoji: "🔷", min: 12000, max: Infinity, color: "#38bdf8" },
];

export function getLevel(totalXp: number): Level {
  return LEVELS.find((l) => totalXp >= l.min && totalXp < l.max) ?? LEVELS[0];
}

export interface LevelProgress {
  level: Level;
  next: Level | null;
  progress: number; // 0..1
  xpInLevel: number;
  xpToNext: number;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = getLevel(totalXp);
  const idx = LEVELS.indexOf(level);
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  if (!next) {
    return { level, next: null, progress: 1, xpInLevel: totalXp - level.min, xpToNext: 0 };
  }
  const xpInLevel = totalXp - level.min;
  const span = next.min - level.min;
  return {
    level,
    next,
    progress: Math.min(1, xpInLevel / span),
    xpInLevel,
    xpToNext: next.min - totalXp,
  };
}

/**
 * Motivational titles that evolve with level.
 * Used in the home hero card to give a sense of identity progression.
 */
export function getTitle(level: Level): string {
  switch (level.id) {
    case "bronze":
      return "Débutant déterminé";
    case "silver":
      return "Joueur régulier";
    case "gold":
      return "Champion en route";
    case "platinum":
      return "Maître de ta vie";
    case "diamond":
      return "Légende vivante";
  }
}
