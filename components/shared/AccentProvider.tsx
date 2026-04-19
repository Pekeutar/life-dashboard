"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/settings/store";
import { ACCENT_COLORS } from "@/lib/settings/types";

/**
 * Applies the user-chosen accent color as a CSS variable on <html>.
 * Drop this once in the layout — it's invisible (renders nothing).
 */
export default function AccentProvider() {
  const { settings, hydrated } = useSettings();

  useEffect(() => {
    if (!hydrated) return;
    const hex = ACCENT_COLORS[settings.accent]?.hex ?? ACCENT_COLORS.gold.hex;
    document.documentElement.style.setProperty("--color-accent", hex);

    // Derived glow (lighter version)
    document.documentElement.style.setProperty(
      "--color-accent-glow",
      hex + "cc"
    );
  }, [hydrated, settings.accent]);

  return null;
}
