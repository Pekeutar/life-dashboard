"use client";

import { useCallback, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type { NewQuestInput, Quest, QuestLink, QuestTracker } from "./types";

const STORAGE_KEY = "life-dashboard.quests.v1";

// Legacy shape (pré-refonte link) pour la migration.
interface LegacyQuestFilter {
  sportType?: string;
  studyTopic?: string;
}
type LegacyTracker =
  | { kind: "manual"; done: boolean }
  | { kind: "count"; pillar?: string; target: number; filter?: LegacyQuestFilter }
  | {
      kind: "duration";
      pillar?: string;
      targetMin: number;
      filter?: LegacyQuestFilter;
    }
  | { kind: "distance"; targetKm: number; filter?: LegacyQuestFilter };

interface LegacyQuest extends Omit<Quest, "link" | "tracker"> {
  pillar?: "sport" | "study" | "any";
  tracker: LegacyTracker;
  link?: QuestLink;
}

function migrateQuest(raw: LegacyQuest): Quest {
  if (raw.link) {
    // Déjà au nouveau format — on nettoie juste le tracker.
    const cleanTracker = stripLegacyTracker(raw.tracker);
    return { ...(raw as unknown as Quest), tracker: cleanTracker };
  }

  const filter =
    raw.tracker.kind !== "manual" ? raw.tracker.filter : undefined;

  let link: QuestLink;
  if (raw.tracker.kind === "distance") {
    link = { kind: "sport", sportType: filter?.sportType };
  } else if (raw.tracker.kind === "manual") {
    // Manuel legacy: on garde le pilier s'il était défini, sinon free.
    link =
      raw.pillar === "sport"
        ? { kind: "sport" }
        : raw.pillar === "study"
          ? { kind: "study" }
          : { kind: "free" };
  } else {
    // count / duration
    const trackerPillar = raw.tracker.pillar;
    if (trackerPillar === "sport") {
      link = { kind: "sport", sportType: filter?.sportType };
    } else if (trackerPillar === "study") {
      link = { kind: "study", studyTopic: filter?.studyTopic };
    } else {
      link = { kind: "free" };
    }
  }

  return {
    id: raw.id,
    parentId: raw.parentId,
    title: raw.title,
    description: raw.description,
    emoji: raw.emoji,
    color: raw.color,
    link,
    scope: raw.scope,
    tracker: stripLegacyTracker(raw.tracker),
    xpReward: raw.xpReward,
    status: raw.status,
    createdAt: raw.createdAt,
    completedAt: raw.completedAt,
  };
}

function stripLegacyTracker(t: LegacyTracker): QuestTracker {
  switch (t.kind) {
    case "manual":
      return { kind: "manual", done: t.done };
    case "count":
      return { kind: "count", target: t.target };
    case "duration":
      return { kind: "duration", targetMin: t.targetMin };
    case "distance":
      return { kind: "distance", targetKm: t.targetKm };
  }
}

export function useQuests() {
  const [quests, setQuests, hydrated] = useLocalStorage<Quest[]>(
    STORAGE_KEY,
    []
  );
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || migratedRef.current) return;
    migratedRef.current = true;
    setQuests((prev) => {
      const needs = prev.some(
        (q) => !("link" in q) || (q as unknown as LegacyQuest).pillar !== undefined
      );
      if (!needs) return prev;
      return prev.map((q) => migrateQuest(q as unknown as LegacyQuest));
    });
  }, [hydrated, setQuests]);

  const add = useCallback(
    (input: NewQuestInput): Quest => {
      const q: Quest = {
        ...input,
        id: nanoid(10),
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setQuests((prev) => [q, ...prev]);
      return q;
    },
    [setQuests]
  );

  const update = useCallback(
    (id: string, patch: Partial<Quest>) => {
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
      );
    },
    [setQuests]
  );

  /** Remove a quest and cascade-delete its sub-quests. */
  const remove = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.filter((q) => q.id !== id && q.parentId !== id)
      );
    },
    [setQuests]
  );

  const toggleManual = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          if (q.tracker.kind !== "manual") return q;
          return {
            ...q,
            tracker: { ...q.tracker, done: !q.tracker.done },
          };
        })
      );
    },
    [setQuests]
  );

  const claim = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : q
        )
      );
    },
    [setQuests]
  );

  const archive = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "archived" } : q))
      );
    },
    [setQuests]
  );

  const restore = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: "active", completedAt: undefined }
            : q
        )
      );
    },
    [setQuests]
  );

  return {
    quests,
    add,
    update,
    remove,
    toggleManual,
    claim,
    archive,
    restore,
    hydrated,
  };
}
