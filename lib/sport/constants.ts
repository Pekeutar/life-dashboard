import type { SportType } from "./types";

export interface SportMeta {
  id: SportType;
  label: string;
  emoji: string;
  hasDistance: boolean;
  color: string; // Tailwind-friendly hex
}

export const SPORTS: SportMeta[] = [
  { id: "running", label: "Course", emoji: "🏃", hasDistance: true, color: "#8b1a3a" },
  { id: "cycling", label: "Vélo", emoji: "🚴", hasDistance: true, color: "#8a6f3c" },
  { id: "gym", label: "Muscu", emoji: "🏋️", hasDistance: false, color: "#5a0f1f" },
  { id: "swimming", label: "Natation", emoji: "🏊", hasDistance: true, color: "#6b552a" },
  { id: "boxing", label: "Boxe", emoji: "🥊", hasDistance: false, color: "#6a0a0a" },
  { id: "climbing", label: "Escalade", emoji: "🧗", hasDistance: false, color: "#3a0a14" },
  { id: "football", label: "Foot", emoji: "⚽", hasDistance: false, color: "#5a0f1f" },
  { id: "tennis", label: "Tennis", emoji: "🎾", hasDistance: false, color: "#c5a364" },
  { id: "yoga", label: "Yoga", emoji: "🧘", hasDistance: false, color: "#8a6f3c" },
  { id: "hiking", label: "Rando", emoji: "🥾", hasDistance: true, color: "#6b552a" },
  { id: "walking", label: "Marche", emoji: "🚶", hasDistance: true, color: "#8a6f3c" },
  { id: "other", label: "Autre", emoji: "⭐", hasDistance: false, color: "#6d6055" },
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
