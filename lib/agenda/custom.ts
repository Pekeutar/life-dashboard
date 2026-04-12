"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";

export interface CustomCategory {
  id: string; // "custom:xxxxx"
  label: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export type NewCustomCategoryInput = Omit<CustomCategory, "id" | "createdAt">;

const STORAGE_KEY = "life-dashboard.custom-categories.v1";

export function useCustomCategories() {
  const [customs, setCustoms, hydrated] = useLocalStorage<CustomCategory[]>(
    STORAGE_KEY,
    []
  );

  const add = useCallback(
    (input: NewCustomCategoryInput): CustomCategory => {
      const item: CustomCategory = {
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
