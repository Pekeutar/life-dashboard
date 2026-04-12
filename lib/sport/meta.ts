"use client";

import { useCallback, useMemo } from "react";
import { SPORTS, SPORTS_BY_ID, type SportMeta } from "./constants";
import { useCustomSports } from "./custom";

/**
 * Unified sport lookup across built-ins and user-defined custom sports.
 * Use in any component that needs to render a SportMeta from an id.
 */
export function useSportMetas() {
  const { customs, add, remove, hydrated } = useCustomSports();

  const all: SportMeta[] = useMemo(
    () => [
      ...SPORTS.filter((s) => s.id !== "other"),
      ...customs.map<SportMeta>((c) => ({
        id: c.id,
        label: c.label,
        emoji: c.emoji,
        color: c.color,
        hasDistance: c.hasDistance,
      })),
      SPORTS_BY_ID["other"],
    ],
    [customs]
  );

  const byId = useMemo(() => {
    const map = new Map<string, SportMeta>();
    for (const m of all) map.set(m.id, m);
    return map;
  }, [all]);

  const resolve = useCallback(
    (id: string): SportMeta => byId.get(id) ?? SPORTS_BY_ID["other"],
    [byId]
  );

  return {
    all,
    customs,
    resolve,
    addCustom: add,
    removeCustom: remove,
    hydrated,
  };
}
