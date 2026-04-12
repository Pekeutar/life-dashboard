/**
 * Relaxed to `string` to support user-defined custom categories
 * (id prefixed `custom:xxxxxxxx`). Built-in ids remain:
 *   "exam" | "deadline" | "meeting" | "reminder" | "goal" | "other"
 */
export type EventCategory = string;

export interface AgendaEvent {
  id: string;
  date: string; // ISO datetime (local)
  title: string;
  category: EventCategory;
  description?: string;
  notes?: string;
  createdAt: string;
}

export type NewAgendaEventInput = Omit<AgendaEvent, "id" | "createdAt">;
