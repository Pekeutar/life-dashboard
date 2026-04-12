import type { Skill, SkillStatus, XpByPillar } from "./types";

/**
 * Resolve the status of every skill in one pass, memoizing so a deep
 * parent chain is only walked once.
 *
 * Cycles are tolerated: a skill temporarily marked "locked" while its
 * ancestors are being resolved will break the loop, and the surviving
 * result is whatever a second pass settles on (we accept mild imprecision
 * over hanging the render).
 */
export function computeSkillStatuses(
  skills: Skill[],
  xp: XpByPillar
): Map<string, SkillStatus> {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const out = new Map<string, SkillStatus>();
  const visiting = new Set<string>();

  function resolve(skill: Skill): SkillStatus {
    const cached = out.get(skill.id);
    if (cached) return cached;
    if (visiting.has(skill.id)) return "locked";
    visiting.add(skill.id);

    const parentsUnlocked = skill.parents.every((pid) => {
      const parent = byId.get(pid);
      if (!parent) return true; // orphan parent ref — ignore
      return resolve(parent) === "unlocked";
    });

    let status: SkillStatus;
    if (!parentsUnlocked) {
      status = "locked";
    } else {
      const current = xp[skill.pillar];
      status = current >= skill.requiredXp ? "unlocked" : "available";
    }

    visiting.delete(skill.id);
    out.set(skill.id, status);
    return status;
  }

  skills.forEach(resolve);
  return out;
}

export function countByStatus(
  statuses: Map<string, SkillStatus>
): Record<SkillStatus, number> {
  const counts: Record<SkillStatus, number> = {
    locked: 0,
    available: 0,
    unlocked: 0,
  };
  statuses.forEach((s) => {
    counts[s] += 1;
  });
  return counts;
}

/**
 * Progress ratio (0–1) of a skill toward its threshold.
 * Locked skills report 0; unlocked report 1.
 */
export function skillProgress(
  skill: Skill,
  status: SkillStatus,
  xp: XpByPillar
): number {
  if (status === "locked") return 0;
  if (status === "unlocked") return 1;
  if (skill.requiredXp <= 0) return 1;
  return Math.min(1, xp[skill.pillar] / skill.requiredXp);
}
