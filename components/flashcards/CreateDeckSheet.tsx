"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { NewDeckInput } from "@/lib/flashcards/types";

const DECK_EMOJIS = [
  "🃏", "📚", "🧠", "💡", "🎓", "🧮",
  "🇬🇧", "🇪🇸", "🇩🇪", "🇯🇵", "💻", "🧬",
  "⚗️", "📖", "✍️", "🔬", "🎨", "🎵",
];

const DECK_COLORS = [
  "#c5a364", "#8a6f3c", "#6b552a", "#3a0a14",
  "#8b1a3a", "#5a0f1f", "#6a0a0a", "#2d0810",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewDeckInput) => void;
}

export default function CreateDeckSheet({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🃏");
  const [color, setColor] = useState("#3a0a14");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setEmoji("🃏");
      setColor("#3a0a14");
    }
  }, [open]);

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate({
      title: trimmed,
      description: description.trim() || undefined,
      emoji,
      color,
    });
    onClose();
  }

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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-none bg-[var(--color-bg-elevated)] ghost-border"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Nouveau deck
                  </h2>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    Crée un paquet de flashcards
                  </p>
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

              {/* Preview */}
              <div className="mb-5 flex items-center gap-3 rounded-none bg-[var(--color-surface)] p-4 ghost-border">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-none text-2xl"
                  style={{ background: `${color}22` }}
                >
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {title || "Nouveau deck"}
                  </p>
                  <p className="truncate text-[11px] text-[var(--color-text-subtle)]">
                    {description || "0 carte"}
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Titre
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vocabulaire anglais, Biochimie…"
                maxLength={48}
                className="mb-5 w-full rounded-none bg-[var(--color-surface)] px-4 py-3 text-base outline-none ghost-border placeholder:text-[var(--color-text-subtle)]"
                style={{ caretColor: color }}
              />

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Description (optionnel)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Une ligne pour t'y retrouver"
                maxLength={80}
                className="mb-5 w-full rounded-none bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ghost-border placeholder:text-[var(--color-text-subtle)]"
                style={{ caretColor: color }}
              />

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Emoji
              </label>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {DECK_EMOJIS.map((e) => {
                  const active = emoji === e;
                  return (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setEmoji(e)}
                      className="flex h-10 w-10 items-center justify-center rounded-none bg-[var(--color-surface)] text-xl ghost-border transition active:scale-95"
                      style={
                        active
                          ? {
                              background: `${color}22`,
                              boxShadow: `inset 0 0 0 2px ${color}`,
                            }
                          : undefined
                      }
                    >
                      {e}
                    </button>
                  );
                })}
              </div>

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Couleur
              </label>
              <div className="mb-6 flex flex-wrap gap-2">
                {DECK_COLORS.map((c) => {
                  const active = color === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className="h-9 w-9 rounded-full transition active:scale-95"
                      style={{
                        background: c,
                        boxShadow: active
                          ? `0 0 0 2px var(--color-bg-elevated), 0 0 0 4px ${c}`
                          : "none",
                      }}
                      aria-label={c}
                    />
                  );
                })}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!title.trim()}
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-none py-4 text-base font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                style={{
                  background: color,
                  boxShadow: `0 14px 40px -14px ${color}`,
                }}
              >
                <Plus size={18} /> Créer le deck
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
