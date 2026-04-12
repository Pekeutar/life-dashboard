"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/lib/storage";
import type { UserSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const STORAGE_KEY = "life-dashboard.settings.v1";

export function useSettings() {
  const [settings, setSettings, hydrated] = useLocalStorage<UserSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const update = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [setSettings]
  );

  const updateGoals = useCallback(
    (patch: Partial<UserSettings["weeklyGoals"]>) => {
      setSettings((prev) => ({
        ...prev,
        weeklyGoals: { ...prev.weeklyGoals, ...patch },
      }));
    },
    [setSettings]
  );

  const updateFood = useCallback(
    (patch: Partial<UserSettings["food"]>) => {
      setSettings((prev) => ({
        ...prev,
        food: { ...prev.food, ...patch },
      }));
    },
    [setSettings]
  );

  return { settings, update, updateGoals, updateFood, hydrated };
}
