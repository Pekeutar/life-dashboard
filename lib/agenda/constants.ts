export interface EventCategoryMeta {
  id: string;
  label: string;
  emoji: string;
  color: string;
  hint: string;
}

export const EVENT_CATEGORIES: EventCategoryMeta[] = [
  {
    id: "exam",
    label: "Examen",
    emoji: "📝",
    color: "#ef4444",
    hint: "Concours, examen, certification",
  },
  {
    id: "deadline",
    label: "Deadline",
    emoji: "⏰",
    color: "#f97316",
    hint: "Remise, échéance projet",
  },
  {
    id: "meeting",
    label: "RDV",
    emoji: "👥",
    color: "#3b82f6",
    hint: "Réunion, rendez-vous, appel",
  },
  {
    id: "reminder",
    label: "Rappel",
    emoji: "🔔",
    color: "#a855f7",
    hint: "Pense-bête, petit rappel",
  },
  {
    id: "goal",
    label: "Objectif",
    emoji: "🎯",
    color: "#22c55e",
    hint: "Jalon, objectif à atteindre",
  },
  {
    id: "other",
    label: "Autre",
    emoji: "📌",
    color: "#a1a1aa",
    hint: "Tout le reste",
  },
];

export const EVENT_CATEGORIES_BY_ID: Record<string, EventCategoryMeta> =
  EVENT_CATEGORIES.reduce<Record<string, EventCategoryMeta>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});
