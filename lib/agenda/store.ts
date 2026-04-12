"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type { AgendaEvent, NewAgendaEventInput } from "./types";

const STORAGE_KEY = "life-dashboard.agenda-events.v1";

export function useAgendaEvents() {
  const [events, setEvents, hydrated] = useLocalStorage<AgendaEvent[]>(
    STORAGE_KEY,
    []
  );

  const add = useCallback(
    (input: NewAgendaEventInput): AgendaEvent => {
      const event: AgendaEvent = {
        ...input,
        id: nanoid(10),
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [event, ...prev]);
      return event;
    },
    [setEvents]
  );

  const update = useCallback(
    (id: string, patch: Partial<NewAgendaEventInput>) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      );
    },
    [setEvents]
  );

  const remove = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    },
    [setEvents]
  );

  const sorted = [...events].sort((a, b) => (a.date < b.date ? -1 : 1));

  return { events: sorted, add, update, remove, hydrated };
}
