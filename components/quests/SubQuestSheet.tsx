"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Quest } from "@/lib/quests/types";
import QuestForm from "./QuestForm";

interface Props {
  open: boolean;
  onClose: () => void;
  parent: Quest | null;
}

export default function SubQuestSheet({ open, onClose, parent }: Props) {
  return (
    <AnimatePresence>
      {open && parent && (
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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-border)]"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
          >
            <div className="pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-4 flex items-start justify-between px-6">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Nouvelle étape
                  </h2>
                  <p className="truncate text-xs text-[var(--color-text-subtle)]">
                    Pour : {parent.emoji} {parent.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <QuestForm
                parentId={parent.id}
                presetFromParent={{
                  emoji: parent.emoji,
                  color: parent.color,
                  pillar: parent.pillar,
                }}
                onDone={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
