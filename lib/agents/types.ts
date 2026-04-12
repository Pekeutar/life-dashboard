/**
 * Agent system — types & interfaces.
 *
 * Each agent is a specialist with an isolated prompt.
 * Agents never see each other's prompts — the companion
 * orchestrates by routing user intent to the right agent.
 */

/* ── Pillar ── */

export type AgentPillar = "sport" | "study" | "any";

/* ── Snapshot passed to agents as context ── */

export interface SportSnapshot {
  totalXp: number;
  streak: number;
  bestStreak: number;
  totalSessions: number;
  thisWeek: { count: number; totalMin: number; totalKm: number };
  lastWorkoutDate: string | null;
  topSportTypes: string[]; // top 3 by frequency
  avgIntensity: number;
  avgFeeling: number;
}

export interface StudySnapshot {
  totalXp: number;
  totalSessions: number;
  thisWeek: { count: number; totalMin: number };
  lastSessionDate: string | null;
  topTopics: string[]; // top 3 by frequency
  avgFocus: number;
}

export interface FlashcardSnapshot {
  totalDecks: number;
  totalCards: number;
  dueToday: number;
  /** % of "good" reviews out of total reviews (0..1). null if no reviews yet. */
  successRate: number | null;
  /** Topics/decks where the user struggles most (low ease factor). */
  weakDecks: { deckTitle: string; avgEase: number }[];
  /** Average ease factor across all reviewed cards. */
  avgEaseFactor: number | null;
}

export interface QuestSnapshot {
  active: number;
  completed: number;
  totalXpEarned: number;
}

export interface AgentContext {
  /** ISO date of when the snapshot was taken. */
  timestamp: string;
  level: { id: string; label: string; totalXp: number; progress: number };
  sport: SportSnapshot;
  study: StudySnapshot;
  flashcards: FlashcardSnapshot;
  quests: QuestSnapshot;
}

/* ── Agent definition ── */

export interface AgentDefinition {
  /** Unique agent id (e.g. "flashcards", "sport-coach"). */
  id: string;
  /** Display name (e.g. "Coach Révisions"). */
  name: string;
  /** Which pillar this agent specialises in. "any" = cross-pillar. */
  pillar: AgentPillar;
  /** One-line description shown in the companion's routing. */
  description: string;
  /**
   * Build the system prompt for this agent.
   * Receives the full snapshot so the prompt can adapt to the user's profile.
   * The returned string is injected as the LLM's system message.
   */
  buildSystemPrompt: (ctx: AgentContext) => string;
}

/* ── Agent response ── */

export interface AgentResponse {
  agentId: string;
  content: string;
  /** Structured data the agent may return (e.g. generated flashcards). */
  data?: unknown;
}
