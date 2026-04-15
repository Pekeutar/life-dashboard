/**
 * A free-form note — cross-pilier, attachable later to quests/events.
 * Kept deliberately flat to support future IA indexing (embeddings, search).
 */
export type NoteLinkKind =
  | "quest"
  | "event"
  | "workout"
  | "session"
  | "free";

export interface NoteLink {
  kind: NoteLinkKind;
  id: string;
}

export interface Note {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  content: string; // free text (may contain dictated passages)
  /** Raw voice transcript stored separately so IA can distinguish origin. */
  voiceTranscript?: string;
  tags: string[];
  links: NoteLink[];
}

export type NewNoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;
