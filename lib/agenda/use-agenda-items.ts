"use client";

import { useMemo } from "react";
import { useWorkouts } from "@/lib/sport/store";
import { useStudySessions } from "@/lib/study/store";
import { useSportMetas } from "@/lib/sport/meta";
import { useStudyMetas } from "@/lib/study/meta";
import { useAgendaEvents } from "./store";
import { useCategoryMetas } from "./meta";
import { useQuests } from "@/lib/quests/store";
import { dayKey } from "@/lib/utils";

export type AgendaItemKind = "workout" | "study" | "event" | "quest";

export interface AgendaItem {
  id: string; // kind-prefixed unique id
  sourceId: string; // original id in the backing store
  kind: AgendaItemKind;
  date: string; // ISO datetime
  dayKey: string; // YYYY-MM-DD (local)
  title: string;
  emoji: string;
  color: string;
  subtitle?: string;
  notes?: string;
  xp?: number;
  categoryLabel?: string; // for events
  parentQuestId?: string; // for sub-quest items
}

/**
 * Unified agenda hook: merges workouts + study sessions + scheduled events
 * into a single stream of AgendaItems, indexed by day for calendar rendering.
 */
export function useAgendaItems() {
  const { workouts, hydrated: wh } = useWorkouts();
  const { sessions, hydrated: sh } = useStudySessions();
  const { events, remove: removeEvent, hydrated: eh } = useAgendaEvents();
  const { quests, hydrated: qh } = useQuests();
  const { resolve: resolveSport } = useSportMetas();
  const { resolve: resolveStudy } = useStudyMetas();
  const { resolve: resolveCategory } = useCategoryMetas();

  const hydrated = wh && sh && eh && qh;

  const items = useMemo<AgendaItem[]>(() => {
    const out: AgendaItem[] = [];

    for (const w of workouts) {
      const meta = resolveSport(w.type);
      out.push({
        id: `workout:${w.id}`,
        sourceId: w.id,
        kind: "workout",
        date: w.date,
        dayKey: dayKey(w.date),
        title: meta.label,
        emoji: meta.emoji,
        color: meta.color,
        subtitle: `${w.durationMin} min · +${w.xp} XP`,
        notes: w.notes,
        xp: w.xp,
      });
    }

    for (const s of sessions) {
      const meta = resolveStudy(s.topic);
      out.push({
        id: `study:${s.id}`,
        sourceId: s.id,
        kind: "study",
        date: s.date,
        dayKey: dayKey(s.date),
        title: s.title || meta.label,
        emoji: meta.emoji,
        color: meta.color,
        subtitle: `${meta.label} · ${s.durationMin} min · +${s.xp} XP`,
        notes: s.notes,
        xp: s.xp,
      });
    }

    for (const e of events) {
      const cat = resolveCategory(e.category);
      out.push({
        id: `event:${e.id}`,
        sourceId: e.id,
        kind: "event",
        date: e.date,
        dayKey: dayKey(e.date),
        title: e.title,
        emoji: cat.emoji,
        color: cat.color,
        subtitle: e.description,
        notes: e.notes,
        categoryLabel: cat.label,
      });
    }

    const questTitles = new Map(quests.map((q) => [q.id, q.title]));
    for (const q of quests) {
      if (q.status !== "active") continue;
      if (q.scope.kind !== "deadline") continue;
      const parentTitle = q.parentId
        ? questTitles.get(q.parentId)
        : undefined;
      const subtitle = q.parentId
        ? parentTitle
          ? `Sous-quête · ${parentTitle}`
          : "Sous-quête"
        : `Échéance · +${q.xpReward} XP`;
      out.push({
        id: `quest:${q.id}`,
        sourceId: q.id,
        kind: "quest",
        date: q.scope.until,
        dayKey: dayKey(q.scope.until),
        title: q.title,
        emoji: q.emoji,
        color: q.color,
        subtitle,
        notes: q.description,
        xp: q.xpReward,
        parentQuestId: q.parentId,
      });
    }

    // Sort chronologically ascending (past → future).
    return out.sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [
    workouts,
    sessions,
    events,
    quests,
    resolveSport,
    resolveStudy,
    resolveCategory,
  ]);

  const byDay = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    for (const it of items) {
      const arr = map.get(it.dayKey) ?? [];
      arr.push(it);
      map.set(it.dayKey, arr);
    }
    return map;
  }, [items]);

  return { items, byDay, hydrated, removeEvent };
}
