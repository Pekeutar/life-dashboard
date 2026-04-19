"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Target, Trophy, Zap } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import QuestCard from "@/components/quests/QuestCard";
import SubQuestSheet from "@/components/quests/SubQuestSheet";
import { useQuests } from "@/lib/quests/store";
import { useWorkouts } from "@/lib/sport/store";
import { useStudySessions } from "@/lib/study/store";
import { totalQuestXp, activeQuestsCount } from "@/lib/quests/stats";
import type { Quest } from "@/lib/quests/types";
import { cn } from "@/lib/utils";

type Tab = "active" | "completed";

export default function QuestsPage() {
  const { quests, toggleManual, claim, remove, hydrated } = useQuests();
  const { workouts } = useWorkouts();
  const { sessions } = useStudySessions();
  const [tab, setTab] = useState<Tab>("active");
  const [subParent, setSubParent] = useState<Quest | null>(null);

  const topLevel = useMemo(() => quests.filter((q) => !q.parentId), [quests]);
  const activeQuests = topLevel.filter((q) => q.status === "active");
  const completedQuests = topLevel.filter((q) => q.status === "completed");
  const visible = tab === "active" ? activeQuests : completedQuests;

  const totalXp = totalQuestXp(quests);
  const activeCount = activeQuestsCount(quests);

  if (!hydrated) {
    return (
      <>
        <PageHeader
          title="Quêtes"
          subtitle="Tes objectifs à conquérir"
          backHref="/"
        />
        <div className="px-5">
          <div className="h-32 animate-pulse rounded-none bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Quêtes"
        subtitle="Tes objectifs à conquérir"
        backHref="/"
      />

      <div className="flex flex-col gap-4 px-5 pb-6">
        {/* Hero stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-none p-5 ghost-border"
          style={{
            background:
              "linear-gradient(135deg, rgba(58, 10, 20,0.22) 0%, rgba(139, 26, 58,0.16) 60%, rgba(28,28,33,0.9) 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                <Trophy size={12} /> Mission en cours
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-tight">
                {activeCount} {activeCount <= 1 ? "quête active" : "quêtes actives"}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Zap size={12} />
                {totalXp.toLocaleString("fr-FR")} XP déjà gagnés
              </p>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-none text-[var(--color-gold)]"
              style={{
                background: "rgba(139, 26, 58,0.22)",
                border: "1px solid var(--color-gold-faint)",
              }}
            >
              <Target size={32} />
            </div>
          </div>
        </motion.div>

        {/* New quest CTA */}
        <Link
          href="/quetes/new"
          className="flex items-center justify-center gap-2 rounded-none px-4 py-3.5 text-sm font-semibold text-white shadow-lg active:scale-[0.98]"
          style={{
            background: "#8b1a3a",
            boxShadow: "0 14px 40px -14px #8b1a3a",
          }}
        >
          <Plus size={16} /> Nouvelle quête
        </Link>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-none bg-[var(--color-surface)] p-1 ghost-border">
          <TabButton
            active={tab === "active"}
            onClick={() => setTab("active")}
            label="Actives"
            count={activeQuests.length}
          />
          <TabButton
            active={tab === "completed"}
            onClick={() => setTab("completed")}
            label="Accomplies"
            count={completedQuests.length}
          />
        </div>

        {/* Quest list */}
        {visible.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {visible.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                workouts={workouts}
                sessions={sessions}
                allQuests={quests}
                onToggleManual={toggleManual}
                onClaim={claim}
                onRemove={remove}
                onAddSubQuest={(parentId) => {
                  const parent = quests.find((x) => x.id === parentId);
                  if (parent) setSubParent(parent);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-none bg-[var(--color-surface)] p-6 text-center ghost-border">
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-3xl"
              style={{ background: "rgba(139, 26, 58,0.15)", color: "#8b1a3a" }}
            >
              <Target size={28} />
            </div>
            <h3 className="font-semibold">
              {tab === "active"
                ? "Pas encore de quête active"
                : "Aucune quête accomplie"}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {tab === "active"
                ? "Fixe-toi un objectif et commence l'aventure."
                : "Termine une quête pour la voir ici."}
            </p>
            {tab === "active" && (
              <Link
                href="/quetes/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white active:scale-95"
                style={{ background: "#8b1a3a" }}
              >
                <Plus size={14} /> Créer ma première quête
              </Link>
            )}
          </div>
        )}
      </div>

      <SubQuestSheet
        open={!!subParent}
        onClose={() => setSubParent(null)}
        parent={subParent}
      />
    </>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-none py-2 text-xs font-semibold transition",
        active
          ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
          : "text-[var(--color-text-subtle)]"
      )}
    >
      {label}{" "}
      <span
        className={cn(
          "ml-1 rounded-full px-1.5 py-0.5 text-[10px]",
          !active && "bg-[var(--color-surface-2)]"
        )}
        style={
          active
            ? { background: "rgba(139, 26, 58,0.2)", color: "#8b1a3a" }
            : undefined
        }
      >
        {count}
      </span>
    </button>
  );
}
