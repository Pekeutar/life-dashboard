"use client";

import { useMemo } from "react";
import { useWorkouts } from "@/lib/sport/store";
import { useStudySessions } from "@/lib/study/store";
import { useSportMetas } from "@/lib/sport/meta";
import { useStudyMetas } from "@/lib/study/meta";
import { useAgendaEvents } from "./store";
import { useCategoryMetas } from "./meta";
import { dayKey } from "@/lib/utils";

export type AgendaItemKind = "workout" | "study" | "event";

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
}

/**
 * Unified agenda hook: merges workouts + study sessions + scheduled events
 * into a single stream of AgendaItems, indexed by day for calendar rendering.
 */
export function useAgendaItems() {
  const { workouts, hydrated: wh } = useWorkouts();
  const { sessions, hydrated: sh } = useStudySessions();
  const { events, remove: removeEvent, hydrated: eh } = useAgendaEvents();
  const { resolve: resolveSport } = useSportMetas();
  const { resolve: resolveStudy } = useStudyMetas();
  const { resolve: resolveCategory } = useCategoryMetas();

  const hydrated = wh && sh && eh;

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

    // Sort chronologically ascending (past → future).
    return out.sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [workouts, sessions, events, resolveSport, resolveStudy, resolveCategory]);

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
