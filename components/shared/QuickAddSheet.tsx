"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarPlus, Dumbbell, Lock, Target, X } from "lucide-react";

interface PillarOption {
  id: string;
  label: string;
  description: string;
  href: string | null; // null = coming soon
  emoji: string;
  icon?: React.ReactNode;
  accent: string;
  available: boolean;
}

const PILLARS: PillarOption[] = [
  {
    id: "quest",
    label: "Nouvelle quête",
    description: "Objectif, défi, étape",
    href: "/quetes/new",
    emoji: "🎯",
    icon: <Target size={20} />,
    accent: "#ec4899",
    available: true,
  },
  {
    id: "event",
    label: "Événement",
    description: "Examen, deadline, rappel…",
    href: "/agenda/new",
    emoji: "🗓️",
    icon: <CalendarPlus size={20} />,
    accent: "#f97316",
    available: true,
  },
  {
    id: "sport",
    label: "Séance de sport",
    description: "Course, muscu, yoga, vélo…",
    href: "/sport/new",
    emoji: "🏋️",
    icon: <Dumbbell size={20} />,
    accent: "#f97316",
    available: true,
  },
  {
    id: "study",
    label: "Session d'étude",
    description: "Cours, lectures, synthèses",
    href: "/etude/new",
    emoji: "📚",
    icon: <BookOpen size={20} />,
    accent: "#a855f7",
    available: true,
  },
  {
    id: "health",
    label: "Recette healthy",
    description: "Génère une recette par IA",
    href: "/sante/food",
    emoji: "🍽️",
    accent: "#ef4444",
    available: true,
  },
  {
    id: "biz",
    label: "Business",
    description: "Revenus, deals, projets",
    href: null,
    emoji: "💼",
    accent: "#22c55e",
    available: false,
  },
  {
    id: "journal",
    label: "Journal",
    description: "Pensées libres, décisions",
    href: null,
    emoji: "📝",
    accent: "#06b6d4",
    available: false,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QuickAddSheet({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-md rounded-t-3xl bg-[var(--color-bg-elevated)] pb-10 ring-1 ring-[var(--color-border)]"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Quoi ajouter ?
                  </h2>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    Choisis le pilier concerné
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {PILLARS.map((p) => {
                  const content = (
                    <motion.div
                      whileTap={p.available ? { scale: 0.98 } : {}}
                      className={
                        "flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition " +
                        (p.available
                          ? "bg-[var(--color-surface)] ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
                          : "bg-[var(--color-surface)]/40 ring-[var(--color-border)]/50")
                      }
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                        style={{
                          background: p.available
                            ? `${p.accent}22`
                            : "var(--color-surface-2)",
                        }}
                      >
                        {p.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={
                            "text-sm font-semibold " +
                            (p.available
                              ? "text-[var(--color-text)]"
                              : "text-[var(--color-text-subtle)]")
                          }
                        >
                          {p.label}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-subtle)]">
                          {p.description}
                        </p>
                      </div>
                      {!p.available && (
                        <div className="flex items-center gap-1 rounded-full bg-[var(--color-surface-2)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                          <Lock size={10} />
                          Bientôt
                        </div>
                      )}
                    </motion.div>
                  );

                  if (p.available && p.href) {
                    return (
                      <Link key={p.id} href={p.href} onClick={onClose}>
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <div key={p.id} aria-disabled>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
