import type { StudyTopic } from "./types";

export interface StudyTopicMeta {
  id: StudyTopic;
  label: string;
  emoji: string;
  color: string;
}

export const STUDY_TOPICS: StudyTopicMeta[] = [
  { id: "programming", label: "Code", emoji: "💻", color: "#06b6d4" },
  { id: "language", label: "Langue", emoji: "🗣️", color: "#f59e0b" },
  { id: "reading", label: "Lecture", emoji: "📖", color: "#a855f7" },
  { id: "course", label: "Cours", emoji: "🎓", color: "#3b82f6" },
  { id: "formation", label: "Formation", emoji: "📚", color: "#22c55e" },
  { id: "writing", label: "Écriture", emoji: "✍️", color: "#ec4899" },
  { id: "research", label: "Recherche", emoji: "🔬", color: "#14b8a6" },
  { id: "math", label: "Maths", emoji: "🧮", color: "#ef4444" },
  { id: "other", label: "Autre", emoji: "⭐", color: "#a1a1aa" },
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
