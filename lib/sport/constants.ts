import type { SportType } from "./types";

export interface SportMeta {
  id: SportType;
  label: string;
  emoji: string;
  hasDistance: boolean;
  color: string; // Tailwind-friendly hex
}

export const SPORTS: SportMeta[] = [
  { id: "running", label: "Course", emoji: "🏃", hasDistance: true, color: "#f97316" },
  { id: "cycling", label: "Vélo", emoji: "🚴", hasDistance: true, color: "#22c55e" },
  { id: "gym", label: "Muscu", emoji: "🏋️", hasDistance: false, color: "#ef4444" },
  { id: "swimming", label: "Natation", emoji: "🏊", hasDistance: true, color: "#3b82f6" },
  { id: "boxing", label: "Boxe", emoji: "🥊", hasDistance: false, color: "#dc2626" },
  { id: "climbing", label: "Escalade", emoji: "🧗", hasDistance: false, color: "#a855f7" },
  { id: "football", label: "Foot", emoji: "⚽", hasDistance: false, color: "#10b981" },
  { id: "tennis", label: "Tennis", emoji: "🎾", hasDistance: false, color: "#eab308" },
  { id: "yoga", label: "Yoga", emoji: "🧘", hasDistance: false, color: "#8b5cf6" },
  { id: "hiking", label: "Rando", emoji: "🥾", hasDistance: true, color: "#84cc16" },
  { id: "walking", label: "Marche", emoji: "🚶", hasDistance: true, color: "#06b6d4" },
  { id: "other", label: "Autre", emoji: "⭐", hasDistance: false, color: "#a1a1aa" },
];

export const SPORTS_BY_ID: Record<SportType, SportMeta> = SPORTS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<SportType, SportMeta>
);

export const FEELING_EMOJIS = ["😫", "😟", "😐", "😊", "🔥"] as const;
export const INTENSITY_LABELS = ["Très cool", "Cool", "Modéré", "Dur", "Max"] as const;
