"use client";

import { useCallback, useMemo } from "react";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORIES_BY_ID,
  type EventCategoryMeta,
} from "./constants";
import { useCustomCategories } from "./custom";

/**
 * Unified agenda-category lookup across built-ins and user-defined customs.
 * Placement: built-ins (except "other") → customs → "other" as tail.
 */
export function useCategoryMetas() {
  const { customs, add, remove, hydrated } = useCustomCategories();

  const all: EventCategoryMeta[] = useMemo(
    () => [
      ...EVENT_CATEGORIES.filter((c) => c.id !== "other"),
      ...customs.map<EventCategoryMeta>((c) => ({
        id: c.id,
        label: c.label,
        emoji: c.emoji,
        color: c.color,
        hint: "Catégorie personnalisée",
      })),
      EVENT_CATEGORIES_BY_ID["other"],
    ],
    [customs]
  );

  const byId = useMemo(() => {
    const map = new Map<string, EventCategoryMeta>();
    for (const m of all) map.set(m.id, m);
    return map;
  }, [all]);

  const resolve = useCallback(
    (id: string): EventCategoryMeta =>
      byId.get(id) ?? EVENT_CATEGORIES_BY_ID["other"],
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
