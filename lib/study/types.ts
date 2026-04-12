/**
 * Study topic identifier. Built-in ids are stable ("programming", "language"…),
 * user-created customs have ids prefixed with "custom:" (see lib/study/custom.ts).
 */
export type StudyTopic = string;

export type Focus = 1 | 2 | 3 | 4 | 5;

export interface StudySession {
  id: string;
  date: string; // ISO datetime
  topic: StudyTopic;
  title: string;
  durationMin: number;
  focus: Focus;
  notes?: string;
  xp: number;
  createdAt: string;
}

export type NewStudyInput = Omit<StudySession, "id" | "xp" | "createdAt">;
