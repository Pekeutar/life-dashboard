import type { Quest, QuestPillarKey } from "./types";

export interface QuestBadge {
  /** "manual" (à cocher) vs "auto" (nourrie par les sessions). */
  mode: "manual" | "auto";
  /** Tag court : "Manuel", "Auto · Course", "Libre"… */
  label: string;
  /** Explication complète. */
  description: string;
  emoji: string;
  /** Pilier qui nourrit la progression, si auto. */
  pillar: QuestPillarKey | null;
}

export interface LabelResolvers {
  sport: (id: string) => string;
  study: (id: string) => string;
}

/**
 * Dérive un badge humain à partir de la quête. Point unique de vérité pour
 * "qui coche cette quête ?" et "quelle matière la nourrit ?".
 */
export function describeQuest(quest: Quest, labels: LabelResolvers): QuestBadge {
  const { tracker } = quest;
  const link: Quest["link"] = quest.link ?? { kind: "free" };

  if (tracker.kind === "manual") {
    if (link.kind === "free") {
      return {
        mode: "manual",
        label: "Libre",
        description: "Quête transverse à cocher toi-même.",
        emoji: "✋",
        pillar: null,
      };
    }
    const pillarLabel = link.kind === "sport" ? "Sport" : "Étude";
    const topicLabel = matiereLabel(link, labels);
    return {
      mode: "manual",
      label: topicLabel
        ? `Manuel · ${topicLabel}`
        : `Manuel · ${pillarLabel}`,
      description: "À cocher toi-même quand c'est fait.",
      emoji: link.kind === "sport" ? "🏃" : "📚",
      pillar: link.kind,
    };
  }

  // Auto trackers : count / duration / distance
  const topicLabel = matiereLabel(link, labels);
  const pillar: QuestPillarKey | null =
    link.kind === "free" ? null : link.kind;
  const emoji = pillar === "sport" ? "🏃" : pillar === "study" ? "📚" : "⚙️";

  const verb =
    tracker.kind === "count"
      ? pillar === "study"
        ? "chaque session"
        : "chaque séance"
      : tracker.kind === "duration"
        ? "chaque minute"
        : "chaque kilomètre";
  const description = topicLabel
    ? `${verb} de ${topicLabel} fait avancer la quête.`
    : "Matière à définir pour activer l'auto-tracking.";

  return {
    mode: "auto",
    label: topicLabel ? `Auto · ${topicLabel}` : "Auto · à compléter",
    description,
    emoji,
    pillar,
  };
}

function matiereLabel(
  link: Quest["link"],
  labels: LabelResolvers
): string | null {
  if (link.kind === "sport" && link.sportType) return labels.sport(link.sportType);
  if (link.kind === "study" && link.studyTopic) return labels.study(link.studyTopic);
  return null;
}

/**
 * Liste des quêtes actives impactées par une activité qu'on vient de logger.
 * Match strict : le link doit pointer vers ce pilier ET la matière doit
 * correspondre. Les quêtes sans matière ou free ne sont jamais impactées.
 */
export function questsImpactedBy(
  quests: Quest[],
  event: { pillar: "sport" | "study"; type: string }
): Quest[] {
  return quests.filter((q) => {
    if (q.status !== "active") return false;
    if (q.tracker.kind === "manual") return false;
    const link = q.link ?? { kind: "free" };
    if (link.kind !== event.pillar) return false;
    if (event.pillar === "sport") {
      return link.kind === "sport" && link.sportType === event.type;
    }
    return link.kind === "study" && link.studyTopic === event.type;
  });
}
