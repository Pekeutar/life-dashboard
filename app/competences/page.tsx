"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import SkillTreeCanvas from "@/components/skills/SkillTreeCanvas";
import SkillDetailSheet from "@/components/skills/SkillDetailSheet";
import SkillEditor from "@/components/skills/SkillEditor";
import { useSkillTree } from "@/lib/skills/store";
import {
  computeSkillStatuses,
  countByStatus,
} from "@/lib/skills/stats";
import type { NewSkillInput, Skill, XpByPillar } from "@/lib/skills/types";
import { STARTER_SKILLS } from "@/lib/skills/seed";
import { useWorkouts } from "@/lib/sport/store";
import { useStudySessions } from "@/lib/study/store";
import { useQuests } from "@/lib/quests/store";
import { totalStats } from "@/lib/sport/stats";
import { totalStudyStats } from "@/lib/study/stats";
import {
  totalQuestXpForPillar,
  totalQuestXpFree,
} from "@/lib/quests/stats";

export default function SkillTreePage() {
  const { skills, add, update, remove, loadSeed, replaceAll, hydrated } =
    useSkillTree();
  const { workouts } = useWorkouts();
  const { sessions } = useStudySessions();
  const { quests } = useQuests();

  // XP aggregation
  const xp = useMemo<XpByPillar>(() => {
    const sportBase = totalStats(workouts).totalXp;
    const studyBase = totalStudyStats(sessions).totalXp;
    const sportQuest = totalQuestXpForPillar(quests, "sport");
    const studyQuest = totalQuestXpForPillar(quests, "study");
    const anyQuest = totalQuestXpFree(quests);
    const sport = sportBase + sportQuest;
    const study = studyBase + studyQuest;
    return { sport, study, any: sport + study + anyQuest };
  }, [workouts, sessions, quests]);

  const statuses = useMemo(
    () => computeSkillStatuses(skills, xp),
    [skills, xp]
  );
  const counts = useMemo(() => countByStatus(statuses), [statuses]);

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const selectedSkill = selectedId
    ? skills.find((s) => s.id === selectedId) ?? null
    : null;
  const selectedStatus = selectedId
    ? statuses.get(selectedId) ?? "locked"
    : "locked";

  function handleNodeTap(id: string) {
    setSelectedId(id);
    setDetailOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit() {
    if (!selectedSkill) return;
    setEditing(selectedSkill);
    setDetailOpen(false);
    setEditorOpen(true);
  }

  function handleSave(input: NewSkillInput) {
    if (editing) {
      update(editing.id, input);
    } else {
      add(input);
    }
  }

  function handleDelete() {
    if (editing) {
      remove(editing.id);
      setEditing(null);
    }
  }

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Compétences" subtitle="Arbre de progression" backHref="/" />
        <div className="px-5">
          <div className="h-64 animate-pulse rounded-3xl bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Compétences" subtitle="Arbre de progression" backHref="/" />

      <div className="flex flex-col gap-4 px-5 pb-6">
        {/* Stats banner */}
        <div
          className="flex items-center gap-5 rounded-2xl p-5 ring-1 ring-[var(--color-border)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(234,179,8,0.18) 0%, rgba(234,179,8,0.04) 100%)",
          }}
        >
          <Stat label="Débloquées" value={counts.unlocked} color="#22c55e" />
          <Stat label="En cours" value={counts.available} color="#f59e0b" />
          <Stat label="Verrouillées" value={counts.locked} color="var(--color-text-subtle)" />
        </div>

        {/* Canvas or empty state */}
        {skills.length === 0 ? (
          <div className="rounded-3xl bg-[var(--color-surface)] p-8 text-center ring-1 ring-[var(--color-border)]">
            <p className="text-5xl">🌳</p>
            <h3 className="mt-3 text-lg font-bold">Ton arbre est vide</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Charge un exemple pour commencer, ou crée tes propres compétences.
            </p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => loadSeed(STARTER_SKILLS)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#eab308] px-6 py-3 text-sm font-semibold text-white shadow-lg"
              style={{ boxShadow: "0 12px 32px -14px #eab308" }}
            >
              <Download size={16} /> Charger l&apos;exemple
            </motion.button>
          </div>
        ) : (
          <SkillTreeCanvas
            skills={skills}
            statuses={statuses}
            xp={xp}
            selectedId={selectedId}
            onSelect={handleNodeTap}
          />
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-surface)] py-3.5 text-sm font-semibold ring-1 ring-[var(--color-border)]"
          >
            <Plus size={16} /> Ajouter un nœud
          </motion.button>

          {skills.length > 0 && (
            <>
              {confirmWipe ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(false)}
                    className="rounded-2xl bg-[var(--color-surface)] px-4 py-3.5 text-xs font-semibold ring-1 ring-[var(--color-border)]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      replaceAll([]);
                      setConfirmWipe(false);
                    }}
                    className="rounded-2xl bg-red-500 px-4 py-3.5 text-xs font-semibold text-white"
                  >
                    Tout supprimer
                  </button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmWipe(true)}
                  className="flex items-center justify-center gap-1 rounded-2xl bg-[var(--color-surface)] px-4 py-3.5 text-xs font-medium text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)]"
                >
                  <Trash2 size={13} />
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* XP summary */}
        <div className="rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            XP actuels
          </p>
          <div className="grid grid-cols-3 gap-3">
            <XpPill label="Sport" value={xp.sport} color="#f97316" />
            <XpPill label="Étude" value={xp.study} color="#a855f7" />
            <XpPill label="Total" value={xp.any} color="#eab308" />
          </div>
        </div>
      </div>

      {/* Detail overlay */}
      {detailOpen && selectedSkill && (
        <SkillDetailSheet
          skill={selectedSkill}
          status={selectedStatus}
          xp={xp}
          allSkills={skills}
          onClose={() => setDetailOpen(false)}
          onEdit={openEdit}
        />
      )}

      {/* Editor sheet */}
      <SkillEditor
        open={editorOpen}
        editing={editing}
        allSkills={skills}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
        {label}
      </span>
    </div>
  );
}

function XpPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-[var(--color-surface-2)] py-2">
      <span className="text-sm font-bold" style={{ color }}>
        {value.toLocaleString("fr-FR")}
      </span>
      <span className="text-[9px] font-semibold uppercase text-[var(--color-text-subtle)]">
        {label}
      </span>
    </div>
  );
}
