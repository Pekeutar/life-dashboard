"use client";

const STORAGE_KEY = "life-dashboard.quests.lastImpact";

export interface LastImpactPayload {
  /** Unix ms, ignored after 60 s to avoid stale banners. */
  at: number;
  pillar: "sport" | "study";
  /** Titles of quests that just got +progress. */
  questTitles: string[];
}

export function writeLastImpact(payload: Omit<LastImpactPayload, "at">): void {
  if (typeof window === "undefined") return;
  try {
    const full: LastImpactPayload = { ...payload, at: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
}

/** Returns payload if less than 60 s old, then clears it. */
export function consumeLastImpact(
  pillar: "sport" | "study"
): LastImpactPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastImpactPayload;
    if (parsed.pillar !== pillar) return null;
    if (Date.now() - parsed.at > 60_000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    return parsed;
  } catch {
    return null;
  }
}
