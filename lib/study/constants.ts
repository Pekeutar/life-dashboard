import type { StudyTopic } from "./types";

export interface StudyTopicMeta {
  id: StudyTopic;
  label: string;
  emoji: string;
  color: string;
}

export const STUDY_TOPICS: StudyTopicMeta[] = [
  { id: "programming", label: "Code", emoji: "💻", color: "#6b552a" },
  { id: "language", label: "Langue", emoji: "🗣️", color: "#c5a364" },
  { id: "reading", label: "Lecture", emoji: "📖", color: "#3a0a14" },
  { id: "course", label: "Cours", emoji: "🎓", color: "#8a6f3c" },
  { id: "formation", label: "Formation", emoji: "📚", color: "#5a0f1f" },
  { id: "writing", label: "Écriture", emoji: "✍️", color: "#8b1a3a" },
  { id: "research", label: "Recherche", emoji: "🔬", color: "#6b552a" },
  { id: "math", label: "Maths", emoji: "🧮", color: "#6a0a0a" },
  { id: "other", label: "Autre", emoji: "⭐", color: "#6d6055" },
];

export const STUDY_TOPICS_BY_ID: Record<StudyTopic, StudyTopicMeta> = STUDY_TOPICS.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<StudyTopic, StudyTopicMeta>
);

export const FOCUS_LABELS = ["Dispersé", "Moyen", "Concentré", "En flow", "Zone"] as const;
export const FOCUS_EMOJIS = ["😵‍💫", "😐", "🙂", "🎯", "🧠"] as const;
