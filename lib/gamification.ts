/* ══════════════════════════════════════════════════════════
 *  Gamification — Niveaux globaux, rangs pilier, streak bonus
 * ══════════════════════════════════════════════════════════ */

/* ── Niveau global (13 paliers × 3 étoiles = 39 micro-étapes) ── */

export interface Level {
  /** 1-based tier number. */
  tier: number;
  id: string;
  label: string;
  emoji: string;
  /** XP cumulé pour atteindre ce niveau. */
  min: number;
  /** XP cumulé pour le niveau suivant (Infinity for top). */
  max: number;
  color: string;
}

export const LEVELS: Level[] = [
  { tier: 1,  id: "eveil",        label: "Éveil",        emoji: "🌱", min: 0,       max: 100,     color: "#6d6055" },
  { tier: 2,  id: "apprenti",     label: "Apprenti",     emoji: "📖", min: 100,     max: 350,     color: "#6d6055" },
  { tier: 3,  id: "initie",       label: "Initié",       emoji: "🔰", min: 350,     max: 850,     color: "#6b552a" },
  { tier: 4,  id: "explorateur",  label: "Explorateur",  emoji: "🧭", min: 850,     max: 1_850,   color: "#6b552a" },
  { tier: 5,  id: "regulier",     label: "Régulier",     emoji: "⚡", min: 1_850,   max: 3_650,   color: "#8a6f3c" },
  { tier: 6,  id: "engage",       label: "Engagé",       emoji: "🔥", min: 3_650,   max: 6_850,   color: "#8a6f3c" },
  { tier: 7,  id: "confirme",     label: "Confirmé",     emoji: "🛡️", min: 6_850,   max: 12_350,  color: "#8b1a3a" },
  { tier: 8,  id: "expert",       label: "Expert",       emoji: "⚔️", min: 12_350,  max: 22_350,  color: "#8b1a3a" },
  { tier: 9,  id: "maitre",       label: "Maître",       emoji: "👑", min: 22_350,  max: 40_350,  color: "#5a0f1f" },
  { tier: 10, id: "champion",     label: "Champion",     emoji: "🏆", min: 40_350,  max: 72_350,  color: "#5a0f1f" },
  { tier: 11, id: "legende",      label: "Légende",      emoji: "🌟", min: 72_350,  max: 127_350, color: "#c5a364" },
  { tier: 12, id: "transcendant", label: "Transcendant", emoji: "💎", min: 127_350, max: 227_350, color: "#c5a364" },
  { tier: 13, id: "eternel",      label: "Éternel",      emoji: "🌌", min: 227_350, max: Infinity, color: "#c5a364" },
];

export function getLevel(totalXp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export interface LevelProgress {
  level: Level;
  next: Level | null;
  /** 0..1 progress within current level. */
  progress: number;
  xpInLevel: number;
  xpToNext: number;
  /** Sub-level star (1, 2, or 3). Each level has 3 stars. */
  star: 1 | 2 | 3;
  /** Display string like "Confirmé ★★☆" */
  display: string;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = getLevel(totalXp);
  const idx = LEVELS.indexOf(level);
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;

  if (!next) {
    return {
      level,
      next: null,
      progress: 1,
      xpInLevel: totalXp - level.min,
      xpToNext: 0,
      star: 3,
      display: `${level.label} ★★★`,
    };
  }

  const xpInLevel = totalXp - level.min;
  const span = next.min - level.min;
  const progress = Math.min(1, xpInLevel / span);

  // Star: 0-33% = ★, 33-66% = ★★, 66-100% = ★★★
  const star: 1 | 2 | 3 = progress < 0.333 ? 1 : progress < 0.666 ? 2 : 3;
  const stars = "★".repeat(star) + "☆".repeat(3 - star);

  return {
    level,
    next,
    progress,
    xpInLevel,
    xpToNext: next.min - totalXp,
    star,
    display: `${level.label} ${stars}`,
  };
}

export function getTitle(level: Level): string {
  switch (level.id) {
    case "eveil":        return "Premier pas";
    case "apprenti":     return "Débutant déterminé";
    case "initie":       return "Sur la bonne voie";
    case "explorateur":  return "Curieux de tout";
    case "regulier":     return "L'habitude se forme";
    case "engage":       return "Ça devient sérieux";
    case "confirme":     return "Joueur confirmé";
    case "expert":       return "Force tranquille";
    case "maitre":       return "Maître de ta vie";
    case "champion":     return "Inarrêtable";
    case "legende":      return "Inspirant les autres";
    case "transcendant": return "Au-delà des limites";
    case "eternel":      return "Légende vivante";
    default:             return "";
  }
}

/* ── Rangs par pilier (5 paliers) ── */

export interface PillarRank {
  id: string;
  label: string;
  emoji: string;
  min: number;
  max: number;
  color: string;
}

export const PILLAR_RANKS: PillarRank[] = [
  { id: "debutant",   label: "Débutant",   emoji: "🌱", min: 0,      max: 500,    color: "#6d6055" },
  { id: "pratiquant", label: "Pratiquant",  emoji: "🎯", min: 500,    max: 3_000,  color: "#6b552a" },
  { id: "avance",     label: "Avancé",     emoji: "⚡", min: 3_000,  max: 12_000, color: "#8a6f3c" },
  { id: "expert",     label: "Expert",     emoji: "🔥", min: 12_000, max: 40_000, color: "#8b1a3a" },
  { id: "elite",      label: "Élite",      emoji: "👑", min: 40_000, max: Infinity, color: "#c5a364" },
];

export function getPillarRank(pillarXp: number): PillarRank {
  for (let i = PILLAR_RANKS.length - 1; i >= 0; i--) {
    if (pillarXp >= PILLAR_RANKS[i].min) return PILLAR_RANKS[i];
  }
  return PILLAR_RANKS[0];
}

export interface PillarRankProgress {
  rank: PillarRank;
  next: PillarRank | null;
  progress: number;
  xpToNext: number;
}

export function getPillarRankProgress(pillarXp: number): PillarRankProgress {
  const rank = getPillarRank(pillarXp);
  const idx = PILLAR_RANKS.indexOf(rank);
  const next = idx < PILLAR_RANKS.length - 1 ? PILLAR_RANKS[idx + 1] : null;

  if (!next) {
    return { rank, next: null, progress: 1, xpToNext: 0 };
  }

  const span = next.min - rank.min;
  const inRank = pillarXp - rank.min;

  return {
    rank,
    next,
    progress: Math.min(1, inRank / span),
    xpToNext: next.min - pillarXp,
  };
}

/* ── Streak bonus multiplier ── */

export interface StreakBonus {
  multiplier: number;
  label: string;
  /** Next threshold to reach a higher multiplier. null if max. */
  nextThreshold: number | null;
}

export function getStreakBonus(streakDays: number): StreakBonus {
  if (streakDays >= 90) {
    return { multiplier: 2.0, label: "×2.0", nextThreshold: null };
  }
  if (streakDays >= 30) {
    return { multiplier: 1.5, label: "×1.5", nextThreshold: 90 };
  }
  if (streakDays >= 7) {
    return { multiplier: 1.2, label: "×1.2", nextThreshold: 30 };
  }
  return { multiplier: 1.0, label: "×1.0", nextThreshold: 7 };
}
