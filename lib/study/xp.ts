import type { Focus } from "./types";

/**
 * Study XP: durée × focus. Une session de 60 min très concentrée vaut plus
 * qu'une session longue mais dispersée — c'est la qualité qui fait l'XP.
 */
export function computeStudyXp(durationMin: number, focus: Focus): number {
  return Math.max(0, Math.round(durationMin * focus));
}
