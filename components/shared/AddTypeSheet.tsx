"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";

export interface CustomItem {
  id: string;
  label: string;
  emoji: string;
  color: string;
  hasDistance?: boolean;
}

export interface CustomDraft {
  label: string;
  emoji: string;
  color: string;
  hasDistance: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accent: string;
  withDistance?: boolean;
  emojiSuggestions: string[];
  colorSuggestions?: string[];
  customs: CustomItem[];
  onCreate: (draft: CustomDraft) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_COLORS = [
  "#c5a364",
  "#8a6f3c",
  "#6b552a",
  "#8b1a3a",
  "#5a0f1f",
  "#3a0a14",
  "#6a0a0a",
  "#2d0810",
];

export default function AddTypeSheet({
  open,
  onClose,
  title,
  subtitle = "Crée ton propre type, adapte à ta vie",
  accent,
  withDistance = false,
  emojiSuggestions,
  colorSuggestions = DEFAULT_COLORS,
  customs,
  onCreate,
  onDelete,
}: Props) {
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState(emojiSuggestions[0] ?? "⭐");
  const [color, setColor] = useState(colorSuggestions[0] ?? accent);
  const [hasDistance, setHasDistance] = useState(false);

  // Reset form fields each time the sheet opens.
  useEffect(() => {
    if (open) {
      setLabel("");
      setEmoji(emojiSuggestions[0] ?? "⭐");
      setColor(colorSuggestions[0] ?? accent);
      setHasDistance(false);
    }
  }, [open, accent, emojiSuggestions, colorSuggestions]);

  function handleSave() {
    const trimmed = label.trim();
    if (!trimmed) return;
    onCreate({ label: trimmed, emoji, color, hasDistance });
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
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-none bg-[var(--color-bg-elevated)] ghost-border"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    {title}
                  </h2>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    {subtitle}
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

              {/* Preview card */}
              <div className="mb-5 flex items-center gap-3 rounded-none bg-[var(--color-surface)] p-4 ghost-border">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-none text-2xl"
                  style={{ background: `${color}22` }}
                >
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {label || "Aperçu"}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-subtle)]">
                    {withDistance
                      ? hasDistance
                        ? "Avec distance"
                        : "Sans distance"
                      : "Prêt à enregistrer"}
                  </p>
                </div>
              </div>

              {/* Label */}
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Nom
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: CrossFit, Padel, Méditation…"
                maxLength={28}
                className="mb-5 w-full rounded-none bg-[var(--color-surface)] px-4 py-3 text-base outline-none ghost-border placeholder:text-[var(--color-text-subtle)]"
                style={{ caretColor: accent }}
              />

              {/* Emoji */}
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Emoji
              </label>
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value.slice(0, 4) || "⭐")}
                  className="w-20 rounded-none bg-[var(--color-surface)] px-4 py-3 text-center text-2xl outline-none ghost-border"
                />
                <p className="flex-1 text-[11px] text-[var(--color-text-subtle)]">
                  Tape ou colle n&apos;importe quel emoji — ou choisis ci-dessous.
                </p>
              </div>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {emojiSuggestions.map((e) => {
                  const active = emoji === e;
                  return (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setEmoji(e)}
                      className="flex h-9 w-9 items-center justify-center rounded-none bg-[var(--color-surface)] text-xl ghost-border transition active:scale-95"
                      style={
                        active
                          ? {
                              background: `${accent}22`,
                              boxShadow: `inset 0 0 0 2px ${accent}`,
                            }
                          : undefined
                      }
                    >
                      {e}
                    </button>
                  );
                })}
              </div>

              {/* Color */}
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Couleur
              </label>
              <div className="mb-5 flex flex-wrap gap-2">
                {colorSuggestions.map((c) => {
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

              {/* Distance toggle */}
              {withDistance && (
                <button
                  type="button"
                  onClick={() => setHasDistance((v) => !v)}
                  className="mb-5 flex w-full items-center justify-between rounded-none bg-[var(--color-surface)] px-4 py-3 ghost-border active:bg-[var(--color-surface-2)]"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      Activité avec distance ?
                    </p>
                    <p className="text-[11px] text-[var(--color-text-subtle)]">
                      Course, vélo, nage… tu pourras saisir les km.
                    </p>
                  </div>
                  <div
                    className="relative h-6 w-11 rounded-full transition"
                    style={{
                      background: hasDistance
                        ? accent
                        : "var(--color-surface-2)",
                    }}
                  >
                    <motion.div
                      animate={{ x: hasDistance ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                    />
                  </div>
                </button>
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!label.trim()}
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-none py-4 text-base font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                style={{
                  background: accent,
                  boxShadow: `0 14px 40px -14px ${accent}`,
                }}
              >
                <Plus size={18} /> Ajouter à ma liste
              </motion.button>

              {customs.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                    Tes personnalisés
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {customs.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-3 rounded-none bg-[var(--color-surface)] px-3 py-2 ghost-border"
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none text-lg ember-emoji"
                          style={{ background: `${c.color}22` }}
                        >
                          {c.emoji}
                        </div>
                        <span className="flex-1 truncate text-sm font-medium text-[var(--color-text)]">
                          {c.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDelete(c.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition active:scale-90 active:bg-red-500/10"
                          aria-label={`Supprimer ${c.label}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
