"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Pencil, X } from "lucide-react";
import type { Skill, SkillStatus, XpByPillar } from "@/lib/skills/types";
import { skillProgress } from "@/lib/skills/stats";

const PILLAR_LABEL: Record<string, string> = {
  any: "Cross-pilier",
  sport: "Sport",
  study: "Étude",
};

interface Props {
  skill: Skill | null;
  status: SkillStatus;
  xp: XpByPillar;
  allSkills: Skill[];
  onClose: () => void;
  onEdit: () => void;
}

export default function SkillDetailSheet({
  skill,
  status,
  xp,
  allSkills,
  onClose,
  onEdit,
}: Props) {
  if (!skill) return null;

  const progress = skillProgress(skill, status, xp);
  const currentXp = xp[skill.pillar];
  const parentSkills = skill.parents
    .map((pid) => allSkills.find((s) => s.id === pid))
    .filter(Boolean) as Skill[];

  return (
    <AnimatePresence>
      {skill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-none bg-[var(--color-bg-elevated)] ghost-border"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-none text-3xl"
                    style={{
                      background:
                        status === "unlocked"
                          ? `linear-gradient(135deg, ${skill.color}55 0%, ${skill.color}22 100%)`
                          : "var(--color-surface)",
                      boxShadow:
                        status === "unlocked"
                          ? `0 0 24px -6px ${skill.color}cc, inset 0 0 0 2px ${skill.color}`
                          : "inset 0 0 0 1px rgba(255,255,255,0.1)",
                      filter: status === "locked" ? "grayscale(0.8)" : undefined,
                      opacity: status === "locked" ? 0.5 : 1,
                    }}
                  >
                    {status === "locked" ? (
                      <Lock size={22} className="text-[var(--color-text-subtle)]" />
                    ) : (
                      skill.emoji
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{skill.label}</h2>
                    <p className="text-xs text-[var(--color-text-subtle)]">
                      {PILLAR_LABEL[skill.pillar]} · {skill.requiredXp} XP
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ghost-border active:scale-95"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              {skill.description && (
                <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                  {skill.description}
                </p>
              )}

              {/* Progress bar */}
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                  Progression
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: status === "unlocked" ? skill.color : undefined }}
                >
                  {status === "unlocked"
                    ? "Débloqué ✓"
                    : status === "locked"
                      ? "Verrouillé"
                      : `${currentXp} / ${skill.requiredXp}`}
                </span>
              </div>
              <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: skill.color }}
                />
              </div>

              {/* Parents */}
              {parentSkills.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                    Prérequis
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {parentSkills.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-medium ghost-border"
                      >
                        <span className="ember-emoji">{p.emoji}</span> {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onEdit}
                className="flex w-full items-center justify-center gap-2 rounded-none bg-[var(--color-surface)] py-3.5 text-sm font-semibold ghost-border"
              >
                <Pencil size={15} /> Modifier
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
