"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/lib/storage";
import type { UserSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const STORAGE_KEY = "life-dashboard.settings.v1";

/**
 * Deep-merges stored settings with defaults so old localStorage blobs
 * that predate newer fields (e.g. `food`) don't crash consumers.
 */
function withDefaults(raw: UserSettings): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    weeklyGoals: {
      ...DEFAULT_SETTINGS.weeklyGoals,
      ...(raw.weeklyGoals ?? {}),
    },
    food: {
      ...DEFAULT_SETTINGS.food,
      ...(raw.food ?? {}),
    },
  };
}

export function useSettings() {
  const [rawSettings, setSettings, hydrated] = useLocalStorage<UserSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS
  );
  const settings = useMemo(() => withDefaults(rawSettings), [rawSettings]);

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
