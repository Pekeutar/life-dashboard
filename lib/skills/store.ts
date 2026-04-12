"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type { NewSkillInput, Skill } from "./types";

const KEY = "life-dashboard.skills.v1";

/**
 * A seed template uses human-readable label keys for `parents` (instead of
 * real IDs) so authors can describe a tree without worrying about nanoid.
 * loadSeed resolves those references before persisting.
 */
export interface SeedTemplate
  extends Omit<NewSkillInput, "parents"> {
  parents: string[]; // labels of other seed entries
}

export function useSkillTree() {
  const [skills, setSkills, hydrated] = useLocalStorage<Skill[]>(KEY, []);

  const add = useCallback(
    (input: NewSkillInput): Skill => {
      const s: Skill = {
        ...input,
        id: nanoid(10),
        createdAt: new Date().toISOString(),
      };
      setSkills((prev) => [...prev, s]);
      return s;
    },
    [setSkills]
  );

  const update = useCallback(
    (id: string, patch: Partial<Skill>) => {
      setSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
    },
    [setSkills]
  );

  const remove = useCallback(
    (id: string) => {
      setSkills((prev) =>
        prev
          .filter((s) => s.id !== id)
          // also scrub dangling parent refs so children don't stay stuck
          .map((s) => ({
            ...s,
            parents: s.parents.filter((pid) => pid !== id),
          }))
      );
    },
    [setSkills]
  );

  const replaceAll = useCallback(
    (next: Skill[]) => setSkills(next),
    [setSkills]
  );

  const loadSeed = useCallback(
    (template: SeedTemplate[]) => {
      const now = new Date().toISOString();
      const labelToId = new Map<string, string>();
      template.forEach((t) => labelToId.set(t.label, nanoid(10)));

      const resolved: Skill[] = template.map((t) => ({
        ...t,
        id: labelToId.get(t.label)!,
        createdAt: now,
        parents: t.parents
          .map((p) => labelToId.get(p))
          .filter((p): p is string => Boolean(p)),
      }));

      setSkills(resolved);
    },
    [setSkills]
  );

  return { skills, add, update, remove, replaceAll, loadSeed, hydrated };
}
