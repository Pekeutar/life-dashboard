"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";

export interface CustomStudyTopic {
  id: string; // "custom:xxxxx"
  label: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export type NewCustomStudyTopicInput = Omit<
  CustomStudyTopic,
  "id" | "createdAt"
>;

const STORAGE_KEY = "life-dashboard.custom-study-topics.v1";

export function useCustomStudyTopics() {
  const [customs, setCustoms, hydrated] = useLocalStorage<CustomStudyTopic[]>(
    STORAGE_KEY,
    []
  );

  const add = useCallback(
    (input: NewCustomStudyTopicInput): CustomStudyTopic => {
      const item: CustomStudyTopic = {
        ...input,
        id: `custom:${nanoid(8)}`,
        createdAt: new Date().toISOString(),
      };
      setCustoms((prev) => [...prev, item]);
      return item;
    },
    [setCustoms]
  );

  const remove = useCallback(
    (id: string) => {
      setCustoms((prev) => prev.filter((c) => c.id !== id));
    },
    [setCustoms]
  );

  return { customs, add, remove, hydrated };
}
