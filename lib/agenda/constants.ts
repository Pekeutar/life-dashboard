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
    color: "#6a0a0a",
    hint: "Concours, examen, certification",
  },
  {
    id: "deadline",
    label: "Deadline",
    emoji: "⏰",
    color: "#8b1a3a",
    hint: "Remise, échéance projet",
  },
  {
    id: "meeting",
    label: "RDV",
    emoji: "👥",
    color: "#6b552a",
    hint: "Réunion, rendez-vous, appel",
  },
  {
    id: "reminder",
    label: "Rappel",
    emoji: "🔔",
    color: "#3a0a14",
    hint: "Pense-bête, petit rappel",
  },
  {
    id: "goal",
    label: "Objectif",
    emoji: "🎯",
    color: "#c5a364",
    hint: "Jalon, objectif à atteindre",
  },
  {
    id: "other",
    label: "Autre",
    emoji: "📌",
    color: "#6d6055",
    hint: "Tout le reste",
  },
];

export const EVENT_CATEGORIES_BY_ID: Record<string, EventCategoryMeta> =
  EVENT_CATEGORIES.reduce<Record<string, EventCategoryMeta>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});
