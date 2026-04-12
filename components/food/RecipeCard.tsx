"use client";

import { motion } from "framer-motion";
import { Clock, Heart, Users } from "lucide-react";
import { MEAL_CATEGORIES, type Recipe } from "@/lib/food/types";

interface Props {
  recipe: Recipe;
  onTap: () => void;
  onToggleFavorite: () => void;
}

export default function RecipeCard({ recipe, onTap, onToggleFavorite }: Props) {
  const cat = MEAL_CATEGORIES[recipe.category];
  const totalMin = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className="cursor-pointer rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          {recipe.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{recipe.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--color-text-muted)]">
            {recipe.description}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[var(--color-text-subtle)]">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {totalMin} min
            </span>
            <span className="flex items-center gap-1">
              <Users size={10} /> {recipe.servings}
            </span>
            <span>
              {cat.emoji} {cat.label}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="mt-1 active:scale-90"
          aria-label={recipe.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            size={18}
            className={
              recipe.favorite
                ? "fill-[var(--color-danger)] text-[var(--color-danger)]"
                : "text-[var(--color-text-subtle)]"
            }
          />
        </button>
      </div>
      {recipe.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {recipe.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[9px] text-[var(--color-text-subtle)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
