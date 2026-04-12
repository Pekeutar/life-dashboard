/**
 * Agent registry — central directory of all agents.
 *
 * Adding a new agent = one call to `register()`.
 * The companion queries the registry to discover what agents exist
 * and route user intent accordingly.
 */

import type { AgentDefinition } from "./types";

const agents = new Map<string, AgentDefinition>();

/** Register a new agent. Throws if the id is already taken. */
export function register(agent: AgentDefinition): void {
  if (agents.has(agent.id)) {
    throw new Error(`[agents] Agent "${agent.id}" is already registered.`);
  }
  agents.set(agent.id, agent);
}

/** Retrieve an agent by id. Returns undefined if not found. */
export function get(id: string): AgentDefinition | undefined {
  return agents.get(id);
}

/** List all registered agents. */
export function list(): AgentDefinition[] {
  return [...agents.values()];
}

/** List agents for a specific pillar (includes "any" agents). */
export function listByPillar(
  pillar: "sport" | "study"
): AgentDefinition[] {
  return [...agents.values()].filter(
    (a) => a.pillar === pillar || a.pillar === "any"
  );
}

/** Describe all agents in a format suitable for the companion's routing prompt. */
export function describeForCompanion(): string {
  return list()
    .map((a) => `- [${a.id}] ${a.name} (${a.pillar}) : ${a.description}`)
    .join("\n");
}
