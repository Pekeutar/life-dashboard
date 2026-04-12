// Agent system barrel export
export type {
  AgentPillar,
  AgentContext,
  AgentDefinition,
  AgentResponse,
  SportSnapshot,
  StudySnapshot,
  FlashcardSnapshot,
  QuestSnapshot,
} from "./types";
export { register, get, list, listByPillar, describeForCompanion } from "./registry";
export { useAgentContext, contextToPromptString } from "./context";

// Import agents to trigger their self-registration
import "./flashcards-agent";
