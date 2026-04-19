"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import type { Quest } from "@/lib/quests/types";
import type { Workout } from "@/lib/sport/types";
import type { StudySession } from "@/lib/study/types";
import {
  computeQuestProgress,
  computeSubQuestsSummary,
} from "@/lib/quests/progress";
import { describeQuest } from "@/lib/quests/tracker-info";
import { useSportMetas } from "@/lib/sport/meta";
import { useStudyMetas } from "@/lib/study/meta";
import QuestProgressBar from "./QuestProgressBar";

interface Props {
  quest: Quest;
  workouts: Workout[];
  sessions: StudySession[];
  /** All quests in the store — needed to render sub-quests. */
  allQuests: Quest[];
  onToggleManual: (id: string) => void;
  onClaim: (id: string) => void;
  onRemove: (id: string) => void;
  onAddSubQuest?: (parentId: string) => void;
  /** True if this card is itself rendered as a sub-quest (nested). */
  nested?: boolean;
}

export default function QuestCard({
  quest,
  workouts,
  sessions,
  allQuests,
  onToggleManual,
  onClaim,
  onRemove,
  onAddSubQuest,
  nested = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const { resolve: resolveSport } = useSportMetas();
  const { resolve: resolveStudy } = useStudyMetas();

  const progress = computeQuestProgress(quest, workouts, sessions);
  const badge = describeQuest(quest, {
    sport: (id) => resolveSport(id).label,
    study: (id) => resolveStudy(id).label,
  });
  const subs = allQuests.filter((q) => q.parentId === quest.id);
  const subSummary = computeSubQuestsSummary(quest.id, allQuests);
  const completed = quest.status === "completed";
  const canClaim = progress.done && !completed;

  const scopeLabel =
    quest.scope.kind === "week"
      ? "Quête hebdo"
      : quest.scope.kind === "deadline"
        ? `Avant le ${new Date(quest.scope.until).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}`
        : "Objectif continu";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        "rounded-none p-4 ring-1 " +
        (completed
          ? "bg-[var(--color-surface)]/60 ring-[var(--color-border)]/60"
          : "bg-[var(--color-surface)] ring-[var(--color-border)]")
      }
      style={{
        boxShadow: canClaim ? `0 0 0 1px ${quest.color}55` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none text-2xl ember-emoji ghost-border"
          style={{ background: `${quest.color}22` }}
        >
          {quest.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className={
                  "text-sm font-semibold " +
                  (completed
                    ? "text-[var(--color-text-muted)] line-through"
                    : "text-[var(--color-text)]")
                }
              >
                {quest.title}
              </h3>
              <p
                className="mt-0.5 text-[10px] font-medium uppercase tracking-wide"
                style={{ color: quest.color }}
              >
                {scopeLabel}
                {nested && " · étape"}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 " +
                    (badge.mode === "manual"
                      ? "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] ring-[var(--color-border)]"
                      : "bg-[var(--color-accent)]/10 text-[var(--color-accent)] ring-[var(--color-accent)]/30")
                  }
                  title={badge.description}
                >
                  <span className="ember-emoji">{badge.emoji}</span>
                  {badge.label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemove(quest.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--color-text-subtle)] transition active:scale-90 active:bg-red-500/10 active:text-red-400"
              aria-label="Supprimer"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {quest.description && (
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              {quest.description}
            </p>
          )}

          {/* Tracker progress */}
          <div className="mt-3">
            {quest.tracker.kind === "manual" ? (
              <button
                type="button"
                onClick={() => onToggleManual(quest.id)}
                disabled={completed}
                className="flex w-full items-center justify-between rounded-none bg-[var(--color-surface-2)]/50 px-3 py-2 ghost-border active:bg-[var(--color-surface-2)] disabled:opacity-60"
              >
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  {quest.tracker.done ? "Fait ✓" : "Marquer comme fait"}
                </span>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-none"
                  style={{
                    background: quest.tracker.done
                      ? quest.color
                      : "var(--color-surface-2)",
                    color: quest.tracker.done ? "#fff" : undefined,
                  }}
                >
                  {quest.tracker.done && <Check size={13} />}
                </div>
              </button>
            ) : (
              <>
                <QuestProgressBar ratio={progress.ratio} color={quest.color} />
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[var(--color-text-muted)]">
                    {progress.label}
                  </span>
                  <span
                    className="flex items-center gap-0.5 font-semibold"
                    style={{ color: quest.color }}
                  >
                    <Zap size={11} /> {quest.xpReward} XP
                  </span>
                </div>
              </>
            )}

            {quest.tracker.kind === "manual" && (
              <div className="mt-1.5 flex items-center justify-end text-[11px]">
                <span
                  className="flex items-center gap-0.5 font-semibold"
                  style={{ color: quest.color }}
                >
                  <Zap size={11} /> {quest.xpReward} XP
                </span>
              </div>
            )}
          </div>

          {/* Sub-quest summary (not nested) */}
          {!nested && subs.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2.5 flex w-full items-center justify-between rounded-none bg-[var(--color-surface-2)]/40 px-3 py-1.5 text-[11px] text-[var(--color-text-muted)] ghost-border/60 active:bg-[var(--color-surface-2)]"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={11} />
                {subSummary.done}/{subSummary.total} étapes
              </span>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          {/* Claim button */}
          {canClaim && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onClaim(quest.id)}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-none py-2.5 text-sm font-semibold text-white shadow-lg"
              style={{
                background: quest.color,
                boxShadow: `0 10px 30px -12px ${quest.color}`,
              }}
            >
              <Sparkles size={15} /> Récupérer {quest.xpReward} XP
            </motion.button>
          )}

          {completed && (
            <p className="mt-2 text-center text-[11px] font-medium text-[var(--color-text-subtle)]">
              ✓ Quête accomplie
            </p>
          )}

          {/* Sub-quests nested */}
          {!nested && (
            <AnimatePresence initial={false}>
              {expanded && subs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-col gap-2 border-l-2 pl-3" style={{ borderColor: `${quest.color}44` }}>
                    {subs.map((sub) => (
                      <QuestCard
                        key={sub.id}
                        quest={sub}
                        workouts={workouts}
                        sessions={sessions}
                        allQuests={allQuests}
                        onToggleManual={onToggleManual}
                        onClaim={onClaim}
                        onRemove={onRemove}
                        nested
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Add sub-quest */}
          {!nested && onAddSubQuest && !completed && (
            <button
              type="button"
              onClick={() => onAddSubQuest(quest.id)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-none border border-dashed border-[var(--color-border)] px-3 py-2 text-[11px] text-[var(--color-text-subtle)] active:bg-[var(--color-surface-2)]/40"
            >
              <Plus size={12} /> Ajouter une étape
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
