"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { NewFlashcardInput } from "@/lib/flashcards/types";

interface Props {
  open: boolean;
  deckId: string;
  color: string;
  onClose: () => void;
  onCreate: (input: NewFlashcardInput) => void;
}

export default function FlashcardForm({
  open,
  deckId,
  color,
  onClose,
  onCreate,
}: Props) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const frontRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setFront("");
      setBack("");
      // Focus after the sheet animation kicks in
      const t = setTimeout(() => frontRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  function handleSave(stayOpen: boolean) {
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) return;
    onCreate({ deckId, front: f, back: b });
    if (stayOpen) {
      setFront("");
      setBack("");
      frontRef.current?.focus();
    } else {
      onClose();
    }
  }

  const canSave = front.trim().length > 0 && back.trim().length > 0;

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
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-border)]"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Nouvelle carte
                  </h2>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    Recto / verso
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

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Recto (question)
              </label>
              <textarea
                ref={frontRef}
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Ex: What does 'ubiquitous' mean?"
                rows={3}
                maxLength={500}
                className="mb-5 w-full resize-none rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-base outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
                style={{ caretColor: color }}
              />

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Verso (réponse)
              </label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Présent partout, omniprésent"
                rows={3}
                maxLength={500}
                className="mb-5 w-full resize-none rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-base outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
                style={{ caretColor: color }}
              />

              <div className="flex gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  disabled={!canSave}
                  onClick={() => handleSave(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-surface)] py-4 text-sm font-semibold text-[var(--color-text)] ring-1 ring-[var(--color-border)] transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} /> Ajouter & continuer
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  disabled={!canSave}
                  onClick={() => handleSave(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  style={{
                    background: color,
                    boxShadow: `0 12px 32px -14px ${color}`,
                  }}
                >
                  Terminer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
