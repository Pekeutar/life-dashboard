"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Trash2, X } from "lucide-react";
import type { NewSkillInput, Skill, SkillPillar } from "@/lib/skills/types";

const EMOJIS = [
  "⭐", "🔥", "💎", "🏆", "👟", "🏃", "🚴", "🏋️",
  "🧠", "📚", "🎓", "💡", "⚖️", "🌱", "🌳", "🗡️",
  "🛡️", "🧘", "⚡", "🧬", "🎯", "🏁", "🥇", "🌟",
];

const COLORS = [
  "#c5a364", "#8a6f3c", "#6b552a", "#3a0a14",
  "#8b1a3a", "#5a0f1f", "#6a0a0a", "#2d0810",
];

const PILLARS: { value: SkillPillar; label: string; hint: string }[] = [
  { value: "any", label: "Cross", hint: "XP total" },
  { value: "sport", label: "Sport", hint: "XP sport" },
  { value: "study", label: "Étude", hint: "XP étude" },
];

interface Props {
  open: boolean;
  /** null = create, Skill = edit */
  editing: Skill | null;
  /** All other skills, for parent picking. */
  allSkills: Skill[];
  onClose: () => void;
  onSave: (input: NewSkillInput) => void;
  onDelete?: () => void;
}

const EMPTY: NewSkillInput = {
  label: "",
  emoji: "⭐",
  description: "",
  col: 0,
  row: 0,
  requiredXp: 100,
  pillar: "any",
  parents: [],
  color: "#3a0a14",
};

export default function SkillEditor({
  open,
  editing,
  allSkills,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [state, setState] = useState<NewSkillInput>(EMPTY);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    if (editing) {
      const { id: _id, createdAt: _c, ...rest } = editing;
      void _id; void _c;
      setState(rest);
    } else {
      setState(EMPTY);
    }
  }, [open, editing]);

  function patch<K extends keyof NewSkillInput>(key: K, value: NewSkillInput[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function toggleParent(id: string) {
    setState((s) => ({
      ...s,
      parents: s.parents.includes(id)
        ? s.parents.filter((p) => p !== id)
        : [...s.parents, id],
    }));
  }

  function handleSave() {
    const label = state.label.trim();
    if (!label) return;
    onSave({ ...state, label, description: state.description?.trim() || undefined });
    onClose();
  }

  const availableParents = allSkills.filter((s) => s.id !== editing?.id);
  const canSave = state.label.trim().length > 0;

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
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-none bg-[var(--color-bg-elevated)] ghost-border"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    {editing ? "Modifier" : "Nouvelle compétence"}
                  </h2>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    {editing ? state.label : "Crée un nœud de ton arbre"}
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
                  className="flex h-14 w-14 items-center justify-center rounded-none text-2xl ember-emoji"
                  style={{
                    background: `linear-gradient(135deg, ${state.color}55 0%, ${state.color}22 100%)`,
                    boxShadow: `inset 0 0 0 2px ${state.color}`,
                  }}
                >
                  {state.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {state.label || "Sans titre"}
                  </p>
                  <p className="truncate text-[11px] text-[var(--color-text-subtle)]">
                    {PILLARS.find((p) => p.value === state.pillar)?.label} ·{" "}
                    {state.requiredXp} XP requis
                  </p>
                </div>
              </div>

              <Label>Titre</Label>
              <input
                value={state.label}
                onChange={(e) => patch("label", e.target.value)}
                placeholder="Ex: Premier semi-marathon"
                maxLength={48}
                className="mb-5 w-full rounded-none bg-[var(--color-surface)] px-4 py-3 text-base outline-none ghost-border placeholder:text-[var(--color-text-subtle)]"
                style={{ caretColor: state.color }}
              />

              <Label>Description</Label>
              <textarea
                value={state.description ?? ""}
                onChange={(e) => patch("description", e.target.value)}
                placeholder="Ce que ça symbolise"
                rows={2}
                maxLength={140}
                className="mb-5 w-full resize-none rounded-none bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ghost-border placeholder:text-[var(--color-text-subtle)]"
                style={{ caretColor: state.color }}
              />

              <Label>Catégorie XP</Label>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {PILLARS.map((p) => {
                  const active = state.pillar === p.value;
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => patch("pillar", p.value)}
                      className="flex flex-col items-start gap-0.5 rounded-none bg-[var(--color-surface)] px-3 py-2.5 text-left ghost-border transition active:scale-95"
                      style={
                        active
                          ? {
                              background: `${state.color}1a`,
                              boxShadow: `inset 0 0 0 2px ${state.color}`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-xs font-semibold">{p.label}</span>
                      <span className="text-[10px] text-[var(--color-text-subtle)]">
                        {p.hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Label>XP requis</Label>
              <div className="mb-5 flex items-center gap-2 rounded-none bg-[var(--color-surface)] px-3 py-2 ghost-border">
                <button
                  type="button"
                  onClick={() =>
                    patch("requiredXp", Math.max(0, state.requiredXp - 100))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-none bg-[var(--color-surface-2)] text-sm font-bold active:scale-95"
                >
                  −
                </button>
                <input
                  type="number"
                  value={state.requiredXp}
                  min={0}
                  onChange={(e) =>
                    patch("requiredXp", Math.max(0, Number(e.target.value) || 0))
                  }
                  className="flex-1 bg-transparent text-center text-lg font-bold outline-none"
                />
                <button
                  type="button"
                  onClick={() => patch("requiredXp", state.requiredXp + 100)}
                  className="flex h-9 w-9 items-center justify-center rounded-none bg-[var(--color-surface-2)] text-sm font-bold active:scale-95"
                >
                  +
                </button>
              </div>

              <Label>Position (col · row)</Label>
              <div className="mb-5 grid grid-cols-2 gap-2">
                <NumberBox
                  label="Colonne"
                  value={state.col}
                  onChange={(v) => patch("col", v)}
                />
                <NumberBox
                  label="Ligne"
                  value={state.row}
                  onChange={(v) => patch("row", v)}
                />
              </div>

              <Label>Emoji</Label>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => {
                  const active = state.emoji === e;
                  return (
                    <button
                      type="button"
                      key={e}
                      onClick={() => patch("emoji", e)}
                      className="flex h-10 w-10 items-center justify-center rounded-none bg-[var(--color-surface)] text-xl ghost-border transition active:scale-95"
                      style={
                        active
                          ? {
                              background: `${state.color}22`,
                              boxShadow: `inset 0 0 0 2px ${state.color}`,
                            }
                          : undefined
                      }
                    >
                      {e}
                    </button>
                  );
                })}
              </div>

              <Label>Couleur</Label>
              <div className="mb-5 flex flex-wrap gap-2">
                {COLORS.map((c) => {
                  const active = state.color === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => patch("color", c)}
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

              {availableParents.length > 0 && (
                <>
                  <Label>Prérequis (optionnel)</Label>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {availableParents.map((p) => {
                      const active = state.parents.includes(p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => toggleParent(p.id)}
                          className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium ghost-border transition active:scale-95"
                          style={
                            active
                              ? {
                                  background: `${p.color}22`,
                                  boxShadow: `inset 0 0 0 1.5px ${p.color}`,
                                  color: p.color,
                                }
                              : undefined
                          }
                        >
                          <span className="ember-emoji">{p.emoji}</span>
                          <span className="truncate max-w-[120px]">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!canSave}
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-none py-4 text-base font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                style={{
                  background: state.color,
                  boxShadow: `0 14px 40px -14px ${state.color}`,
                }}
              >
                <Check size={18} />
                {editing ? "Enregistrer" : "Créer la compétence"}
              </motion.button>

              {editing && onDelete && (
                <div className="mt-3">
                  {confirmDel ? (
                    <div className="rounded-none bg-[var(--color-surface)] p-3 ring-1 ring-red-500/30">
                      <p className="text-xs font-semibold">Supprimer ce nœud ?</p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        Les enfants perdront ce prérequis mais resteront intacts.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDel(false)}
                          className="flex-1 rounded-none bg-[var(--color-surface-2)] py-2 text-xs font-semibold"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete();
                            onClose();
                          }}
                          className="flex-1 rounded-none bg-red-500 py-2 text-xs font-semibold text-white"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDel(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-none py-3 text-xs font-medium text-[var(--color-text-subtle)]"
                    >
                      <Trash2 size={13} /> Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
      {children}
    </label>
  );
}

function NumberBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-none bg-[var(--color-surface)] px-3 py-2 ghost-border">
      <span className="text-[10px] font-semibold uppercase text-[var(--color-text-subtle)]">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-none bg-[var(--color-surface-2)] text-sm font-bold active:scale-95"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-none bg-[var(--color-surface-2)] text-sm font-bold active:scale-95"
      >
        +
      </button>
    </div>
  );
}
