"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Loader2,
  ShoppingCart,
  Sparkles,
  Send,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import RecipeCard from "@/components/food/RecipeCard";
import RecipeDetail from "@/components/food/RecipeDetail";
import { useRecipes, useShoppingLists } from "@/lib/food/store";
import { useSettings } from "@/lib/settings/store";
import {
  GROCERY_AISLES,
  MEAL_CATEGORIES,
  type GroceryAisle,
  type MealCategory,
  type Recipe,
  type NewRecipeInput,
} from "@/lib/food/types";
import { cn } from "@/lib/utils";

type Tab = "generate" | "favorites" | "lists";

const SUGGESTIONS = [
  "Un déjeuner rapide et protéiné",
  "Petit-déjeuner énergétique pour le sport",
  "Dîner léger et rassasiant",
  "Snack sain avant l'entraînement",
  "Repas batch cooking pour la semaine",
  "Bowl healthy et coloré",
];

export default function FoodPage() {
  const { recipes, favorites, add, toggleFavorite, hydrated } = useRecipes();
  const { create: createList } = useShoppingLists();
  const { settings } = useSettings();

  const [tab, setTab] = useState<Tab>("generate");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<MealCategory | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Keep selected recipe in sync with store (for favorite toggle)
  const syncedSelected = useMemo(() => {
    if (!selectedRecipe) return null;
    return recipes.find((r) => r.id === selectedRecipe.id) ?? selectedRecipe;
  }, [selectedRecipe, recipes]);

  async function generate() {
    const text = prompt.trim();
    if (!text) return;

    setLoading(true);
    setError("");

    try {
      const food = settings.food ?? {
        diet: "omnivore",
        allergies: [],
        defaultServings: 2,
        goal: "balanced",
      };

      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          category: category || undefined,
          servings: food.defaultServings,
          diet: food.diet,
          allergies: food.allergies,
          goal: food.goal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur inconnue.");
        return;
      }

      const r = data.recipe as NewRecipeInput;
      const saved = add(r);
      setSelectedRecipe(saved);
      setPrompt("");
    } catch (err) {
      console.error("[food] generate error:", err);
      setError(
        err instanceof Error
          ? `Erreur : ${err.message}`
          : "Erreur réseau. Vérifie ta connexion."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddToList(recipe: Recipe) {
    createList(recipe.title, [recipe]);
    setSelectedRecipe(null);
    setTab("lists");
  }

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Food" subtitle="Recettes healthy" backHref="/sante" />
        <div className="px-5">
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Food" subtitle="Recettes healthy" backHref="/sante" />

      <div className="flex flex-col gap-4 px-5 pb-6">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[var(--color-surface)] p-1 ring-1 ring-[var(--color-border)]">
          <TabBtn active={tab === "generate"} onClick={() => setTab("generate")} icon={<Sparkles size={13} />} label="Générer" />
          <TabBtn active={tab === "favorites"} onClick={() => setTab("favorites")} icon={<Heart size={13} />} label={`Favoris (${favorites.length})`} />
          <TabBtn active={tab === "lists"} onClick={() => setTab("lists")} icon={<ShoppingCart size={13} />} label="Courses" />
        </div>

        {/* ── Generate tab ── */}
        {tab === "generate" && (
          <>
            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setCategory("")}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ring-1",
                  !category
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-[var(--color-accent)]/30"
                    : "bg-[var(--color-surface)] text-[var(--color-text-subtle)] ring-[var(--color-border)]"
                )}
              >
                Tous
              </button>
              {(Object.entries(MEAL_CATEGORIES) as [MealCategory, { label: string; emoji: string }][]).map(
                ([key, { label, emoji }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ring-1",
                      category === key
                        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-[var(--color-accent)]/30"
                        : "bg-[var(--color-surface)] text-[var(--color-text-subtle)] ring-[var(--color-border)]"
                    )}
                  >
                    {emoji} {label}
                  </button>
                )
              )}
            </div>

            {/* Prompt input */}
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    e.preventDefault();
                    generate();
                  }
                }}
                placeholder="Décris le repas que tu veux..."
                disabled={loading}
                className="w-full rounded-2xl bg-[var(--color-surface)] px-4 py-3.5 pr-12 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)] outline-none focus:ring-[var(--color-accent)] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={generate}
                disabled={loading || !prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white disabled:opacity-40 active:scale-95"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>

            {error && (
              <p className="rounded-xl bg-[var(--color-danger)]/10 px-4 py-2 text-xs text-[var(--color-danger)]">
                {error}
              </p>
            )}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-xs text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
                <Loader2 size={14} className="animate-spin" />
                Le chef prépare ta recette...
              </div>
            )}

            {/* Suggestions */}
            {!loading && !prompt && (
              <div className="flex flex-col gap-1.5">
                <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-[11px] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent recipes */}
            {recipes.length > 0 && (
              <section>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                  Recettes générées
                </p>
                <div className="flex flex-col gap-2">
                  {recipes.slice(0, 10).map((r) => (
                    <RecipeCard
                      key={r.id}
                      recipe={r}
                      onTap={() => setSelectedRecipe(r)}
                      onToggleFavorite={() => toggleFavorite(r.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Favorites tab ── */}
        {tab === "favorites" && (
          <>
            {favorites.length > 0 ? (
              <div className="flex flex-col gap-2">
                {favorites.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    onTap={() => setSelectedRecipe(r)}
                    onToggleFavorite={() => toggleFavorite(r.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--color-surface)] p-6 text-center ring-1 ring-[var(--color-border)]">
                <p className="text-3xl">❤️</p>
                <h3 className="mt-2 font-semibold">Pas encore de favoris</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Génère des recettes et ajoute-les en favoris.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Shopping lists tab ── */}
        {tab === "lists" && <ShoppingListsTab />}
      </div>

      <RecipeDetail
        recipe={syncedSelected}
        onClose={() => setSelectedRecipe(null)}
        onToggleFavorite={() => {
          if (syncedSelected) toggleFavorite(syncedSelected.id);
        }}
        onAddToList={() => {
          if (syncedSelected) handleAddToList(syncedSelected);
        }}
      />
    </>
  );
}

function ShoppingListsTab() {
  const { lists, toggleItem, toggleRecipe, remove } = useShoppingLists();
  const { recipes: allRecipes } = useRecipes();

  if (lists.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface)] p-6 text-center ring-1 ring-[var(--color-border)]">
        <p className="text-3xl">🛒</p>
        <h3 className="mt-2 font-semibold">Pas de liste de courses</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Ouvre une recette et tape &quot;Liste de courses&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {lists.map((list) => {
        // Group items by aisle
        const byAisle = new Map<string, typeof list.items>();
        for (const item of list.items) {
          const arr = byAisle.get(item.aisle) ?? [];
          arr.push(item);
          byAisle.set(item.aisle, arr);
        }
        const sortedAisles = [...byAisle.entries()].sort(
          (a, b) =>
            (GROCERY_AISLES[a[0] as GroceryAisle]?.order ?? 99) -
            (GROCERY_AISLES[b[0] as GroceryAisle]?.order ?? 99)
        );
        const checkedCount = list.items.filter((it) => it.checked).length;

        // Recipe chips data
        const recipeChips = list.recipeIds.map((rid) => {
          const recipe = allRecipes.find((r) => r.id === rid);
          const recipeItems = list.items.filter((it) =>
            it.fromRecipes.includes(rid)
          );
          const allChecked =
            recipeItems.length > 0 && recipeItems.every((it) => it.checked);
          const checkedInRecipe = recipeItems.filter((it) => it.checked).length;
          return {
            id: rid,
            title: recipe?.title ?? "Recette",
            emoji: recipe?.emoji ?? "🍽️",
            allChecked,
            checked: checkedInRecipe,
            total: recipeItems.length,
          };
        });

        return (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{list.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--color-text-subtle)]">
                  {checkedCount}/{list.items.length}
                </span>
                <button
                  type="button"
                  onClick={() => remove(list.id)}
                  className="text-[10px] text-[var(--color-danger)] active:scale-95"
                >
                  Suppr.
                </button>
              </div>
            </div>

            {/* Recipe chips — tap to check/uncheck all ingredients for a recipe */}
            {recipeChips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {recipeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => toggleRecipe(list.id, chip.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ring-1 active:scale-95",
                      chip.allChecked
                        ? "bg-[var(--color-success)]/15 text-[var(--color-success)] ring-[var(--color-success)]/30"
                        : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] ring-[var(--color-border)]"
                    )}
                  >
                    <span>{chip.emoji}</span>
                    <span className="max-w-[120px] truncate">{chip.title}</span>
                    <span className="text-[9px] opacity-60">
                      {chip.checked}/{chip.total}
                    </span>
                    {chip.allChecked && (
                      <span className="text-[10px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-3">
              {sortedAisles.map(([aisle, items]) => (
                <div key={aisle}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                    {GROCERY_AISLES[aisle as GroceryAisle]?.emoji ?? "📦"}{" "}
                    {GROCERY_AISLES[aisle as GroceryAisle]?.label ?? aisle}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {items.map((item, idx) => {
                      const globalIdx = list.items.indexOf(item);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleItem(list.id, globalIdx)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left active:bg-[var(--color-surface-2)]"
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 text-[10px]",
                              item.checked
                                ? "bg-[var(--color-success)] ring-[var(--color-success)] text-white"
                                : "ring-[var(--color-border)]"
                            )}
                          >
                            {item.checked && "✓"}
                          </div>
                          <span
                            className={cn(
                              "flex-1 text-sm",
                              item.checked &&
                                "line-through text-[var(--color-text-subtle)]"
                            )}
                          >
                            {item.name}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            {item.quantity}
                            {item.unit ? ` ${item.unit}` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition",
        active
          ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
          : "text-[var(--color-text-subtle)]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
