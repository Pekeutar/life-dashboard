"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Heart,
  Pencil,
  ShoppingCart,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { MEAL_CATEGORIES, GROCERY_AISLES, type Recipe } from "@/lib/food/types";

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
  onToggleFavorite: () => void;
  onAddToList: () => void;
  onRename?: (title: string) => void;
  onDelete?: () => void;
}

export default function RecipeDetail({
  recipe,
  onClose,
  onToggleFavorite,
  onAddToList,
  onRename,
  onDelete,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!recipe) {
      setEditing(false);
      setConfirmingDelete(false);
      return;
    }
    setDraft(recipe.title);
    setConfirmingDelete(false);
  }, [recipe?.id, recipe?.title, recipe]);

  function saveTitle() {
    if (!recipe || !onRename) return;
    const t = draft.trim();
    if (t && t !== recipe.title) onRename(t);
    setEditing(false);
  }
  return (
    <AnimatePresence>
      {recipe && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col rounded-t-3xl bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-border)]"
            style={{
              maxHeight: "92vh",
              paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
            }}
          >
            {/* Header */}
            <div className="shrink-0 px-6 pt-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-3xl">{recipe.emoji}</span>
                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          type="text"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle();
                            if (e.key === "Escape") {
                              setDraft(recipe.title);
                              setEditing(false);
                            }
                          }}
                          className="w-full rounded-lg bg-[var(--color-surface)] px-2 py-1 text-lg font-bold ring-1 ring-[var(--color-accent)] outline-none"
                        />
                        <button
                          type="button"
                          onClick={saveTitle}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white active:scale-95"
                          aria-label="Valider"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-lg font-bold truncate">{recipe.title}</h2>
                        {onRename && (
                          <button
                            type="button"
                            onClick={() => {
                              setDraft(recipe.title);
                              setEditing(true);
                            }}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-text-subtle)] hover:text-[var(--color-text)] active:scale-95"
                            aria-label="Renommer"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {recipe.description}
                    </p>
                  </div>
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

              {/* Meta */}
              <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {recipe.prepMinutes + recipe.cookMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {recipe.servings} pers.
                </span>
                <span>
                  {MEAL_CATEGORIES[recipe.category].emoji}{" "}
                  {MEAL_CATEGORIES[recipe.category].label}
                </span>
              </div>

              {/* Macros if available */}
              {recipe.calories && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    { label: "Calories", value: `${recipe.calories}`, unit: "kcal" },
                    { label: "Protéines", value: `${recipe.protein ?? "?"}`, unit: "g" },
                    { label: "Glucides", value: `${recipe.carbs ?? "?"}`, unit: "g" },
                    { label: "Lipides", value: `${recipe.fat ?? "?"}`, unit: "g" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl bg-[var(--color-surface)] px-2 py-2 text-center ring-1 ring-[var(--color-border)]"
                    >
                      <p className="text-sm font-bold">{m.value}</p>
                      <p className="text-[9px] text-[var(--color-text-subtle)]">
                        {m.unit}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-surface)] px-3 py-2.5 text-xs font-semibold ring-1 ring-[var(--color-border)] active:scale-[0.98]"
                >
                  <Heart
                    size={14}
                    className={
                      recipe.favorite
                        ? "fill-[var(--color-danger)] text-[var(--color-danger)]"
                        : ""
                    }
                  />
                  {recipe.favorite ? "Favori" : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={onAddToList}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)]/15 px-3 py-2.5 text-xs font-semibold text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30 active:scale-[0.98]"
                >
                  <ShoppingCart size={14} />
                  Liste de courses
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmingDelete) {
                        onDelete();
                      } else {
                        setConfirmingDelete(true);
                      }
                    }}
                    className={
                      "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold ring-1 active:scale-[0.98] " +
                      (confirmingDelete
                        ? "bg-red-500 text-white ring-red-500"
                        : "bg-red-500/10 text-red-400 ring-red-500/30")
                    }
                    aria-label={
                      confirmingDelete ? "Confirmer la suppression" : "Supprimer la recette"
                    }
                  >
                    <Trash2 size={14} />
                    {confirmingDelete && "Confirmer"}
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="mt-4 flex-1 overflow-y-auto px-6 pb-4">
              {/* Ingredients */}
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Ingrédients
              </h3>
              <div className="flex flex-col gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] px-3 py-2 ring-1 ring-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {GROCERY_AISLES[ing.aisle]?.emoji ?? "📦"}
                      </span>
                      <span className="text-sm">{ing.name}</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {ing.quantity}
                      {ing.unit ? ` ${ing.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>

              {/* Steps */}
              <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Préparation
              </h3>
              <div className="flex flex-col gap-2">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        color: "#ef4444",
                      }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
