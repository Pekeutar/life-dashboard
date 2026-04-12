"use client";

import { useCallback, useMemo } from "react";
import {
  STUDY_TOPICS,
  STUDY_TOPICS_BY_ID,
  type StudyTopicMeta,
} from "./constants";
import { useCustomStudyTopics } from "./custom";

/**
 * Unified study topic lookup across built-ins and user-defined customs.
 */
export function useStudyMetas() {
  const { customs, add, remove, hydrated } = useCustomStudyTopics();

  const all: StudyTopicMeta[] = useMemo(
    () => [
      ...STUDY_TOPICS.filter((t) => t.id !== "other"),
      ...customs.map<StudyTopicMeta>((c) => ({
        id: c.id,
        label: c.label,
        emoji: c.emoji,
        color: c.color,
      })),
      STUDY_TOPICS_BY_ID["other"],
    ],
    [customs]
  );

  const byId = useMemo(() => {
    const map = new Map<string, StudyTopicMeta>();
    for (const m of all) map.set(m.id, m);
    return map;
  }, [all]);

  const resolve = useCallback(
    (id: string): StudyTopicMeta => byId.get(id) ?? STUDY_TOPICS_BY_ID["other"],
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
