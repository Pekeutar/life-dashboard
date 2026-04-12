/* ══════════════════════════════════════════════════════════
 *  Food — Types
 * ══════════════════════════════════════════════════════════ */

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_CATEGORIES: Record<MealCategory, { label: string; emoji: string }> = {
  breakfast: { label: "Petit-déj", emoji: "🌅" },
  lunch:     { label: "Déjeuner", emoji: "☀️" },
  dinner:    { label: "Dîner",    emoji: "🌙" },
  snack:     { label: "Snack",    emoji: "🍎" },
};

export type DietType =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "gluten_free"
  | "keto"
  | "paleo";

export const DIET_TYPES: Record<DietType, { label: string; emoji: string }> = {
  omnivore:    { label: "Omnivore",     emoji: "🍖" },
  vegetarian:  { label: "Végétarien",   emoji: "🥦" },
  vegan:       { label: "Végan",        emoji: "🌱" },
  pescatarian: { label: "Pescétarien",  emoji: "🐟" },
  gluten_free: { label: "Sans gluten",  emoji: "🌾" },
  keto:        { label: "Keto",         emoji: "🥑" },
  paleo:       { label: "Paléo",        emoji: "🦴" },
};

export type FoodGoal = "balanced" | "muscle_gain" | "weight_loss";

export const FOOD_GOALS: Record<FoodGoal, { label: string; emoji: string }> = {
  balanced:    { label: "Équilibré",      emoji: "⚖️" },
  muscle_gain: { label: "Prise de masse", emoji: "💪" },
  weight_loss: { label: "Perte de poids", emoji: "🔥" },
};

/** Grocery store aisle for shopping list grouping. */
export type GroceryAisle =
  | "fruits_vegetables"
  | "proteins"
  | "dairy"
  | "grains_bread"
  | "spices_condiments"
  | "frozen"
  | "beverages"
  | "other";

export const GROCERY_AISLES: Record<GroceryAisle, { label: string; emoji: string; order: number }> = {
  fruits_vegetables:  { label: "Fruits & Légumes",     emoji: "🥬", order: 0 },
  proteins:           { label: "Protéines",             emoji: "🥩", order: 1 },
  dairy:              { label: "Crèmerie",              emoji: "🧀", order: 2 },
  grains_bread:       { label: "Féculents & Pain",      emoji: "🍞", order: 3 },
  spices_condiments:  { label: "Épices & Condiments",   emoji: "🧂", order: 4 },
  frozen:             { label: "Surgelés",              emoji: "🧊", order: 5 },
  beverages:          { label: "Boissons",              emoji: "🥤", order: 6 },
  other:              { label: "Autre",                 emoji: "📦", order: 7 },
};

export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  aisle: GroceryAisle;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: MealCategory;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  /** Optional — stored for future use. */
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  /** Whether this recipe was saved to favorites. */
  favorite: boolean;
  createdAt: string;
}

export type NewRecipeInput = Omit<Recipe, "id" | "favorite" | "createdAt">;

/** Shopping list item (derived from recipe ingredients). */
export interface ShoppingItem {
  name: string;
  quantity: string;
  unit?: string;
  aisle: GroceryAisle;
  checked: boolean;
  /** Source recipe IDs. */
  fromRecipes: string[];
}

export interface ShoppingList {
  id: string;
  title: string;
  items: ShoppingItem[];
  recipeIds: string[];
  createdAt: string;
}

/** Food preferences stored in settings. */
export interface FoodProfile {
  diet: DietType;
  allergies: string[];
  defaultServings: number;
  goal: FoodGoal;
}

export const DEFAULT_FOOD_PROFILE: FoodProfile = {
  diet: "omnivore",
  allergies: [],
  defaultServings: 2,
  goal: "balanced",
};
