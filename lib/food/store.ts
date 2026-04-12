"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type {
  Recipe,
  NewRecipeInput,
  ShoppingList,
  ShoppingItem,
  Ingredient,
} from "./types";

/* ── Recipes ── */

const RECIPES_KEY = "life-dashboard.recipes.v1";

export function useRecipes() {
  const [recipes, setRecipes, hydrated] = useLocalStorage<Recipe[]>(
    RECIPES_KEY,
    []
  );

  const add = useCallback(
    (input: NewRecipeInput): Recipe => {
      const recipe: Recipe = {
        ...input,
        id: nanoid(10),
        favorite: false,
        createdAt: new Date().toISOString(),
      };
      setRecipes((prev) => [recipe, ...prev]);
      return recipe;
    },
    [setRecipes]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r))
      );
    },
    [setRecipes]
  );

  const remove = useCallback(
    (id: string) => {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    },
    [setRecipes]
  );

  const favorites = recipes.filter((r) => r.favorite);

  return { recipes, favorites, add, toggleFavorite, remove, hydrated };
}

/* ── Shopping Lists ── */

const SHOPPING_KEY = "life-dashboard.shopping.v1";

export function useShoppingLists() {
  const [lists, setLists, hydrated] = useLocalStorage<ShoppingList[]>(
    SHOPPING_KEY,
    []
  );

  const create = useCallback(
    (title: string, recipes: Recipe[]): ShoppingList => {
      const items = consolidateIngredients(recipes);
      const list: ShoppingList = {
        id: nanoid(10),
        title,
        items,
        recipeIds: recipes.map((r) => r.id),
        createdAt: new Date().toISOString(),
      };
      setLists((prev) => [list, ...prev]);
      return list;
    },
    [setLists]
  );

  const toggleItem = useCallback(
    (listId: string, itemIndex: number) => {
      setLists((prev) =>
        prev.map((l) => {
          if (l.id !== listId) return l;
          const items = l.items.map((it, i) =>
            i === itemIndex ? { ...it, checked: !it.checked } : it
          );
          return { ...l, items };
        })
      );
    },
    [setLists]
  );

  const remove = useCallback(
    (id: string) => {
      setLists((prev) => prev.filter((l) => l.id !== id));
    },
    [setLists]
  );

  return { lists, create, toggleItem, remove, hydrated };
}

/** Merge ingredients from multiple recipes, consolidating duplicates. */
function consolidateIngredients(recipes: Recipe[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${(ing.unit ?? "").toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        // Try to sum quantities if both are numeric
        const a = parseFloat(existing.quantity);
        const b = parseFloat(ing.quantity);
        if (!isNaN(a) && !isNaN(b)) {
          existing.quantity = String(Math.round((a + b) * 100) / 100);
        } else {
          existing.quantity = `${existing.quantity} + ${ing.quantity}`;
        }
        existing.fromRecipes.push(recipe.id);
      } else {
        map.set(key, {
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          aisle: ing.aisle,
          checked: false,
          fromRecipes: [recipe.id],
        });
      }
    }
  }

  return [...map.values()];
}
