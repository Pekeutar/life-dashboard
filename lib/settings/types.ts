export type ThemeMode = "dark" | "light" | "auto";

export type AccentColor =
  | "orange"
  | "blue"
  | "purple"
  | "green"
  | "pink"
  | "cyan";

export interface WeeklyGoals {
  sportSessions: number;
  studySessions: number;
  studyMinutes: number;
}

export type DietType =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "gluten_free"
  | "keto"
  | "paleo";

export type FoodGoal = "balanced" | "muscle_gain" | "weight_loss";

export interface FoodProfile {
  diet: DietType;
  allergies: string[];
  defaultServings: number;
  goal: FoodGoal;
}

export interface UserSettings {
  /** Display name used in greetings. */
  name: string;
  /** Theme preference. */
  theme: ThemeMode;
  /** Accent color key. */
  accent: AccentColor;
  /** Weekly goals for progress tracking. */
  weeklyGoals: WeeklyGoals;
  /** Food preferences for recipe generation. */
  food: FoodProfile;
}

export const DEFAULT_SETTINGS: UserSettings = {
  name: "",
  theme: "dark",
  accent: "orange",
  weeklyGoals: {
    sportSessions: 4,
    studySessions: 5,
    studyMinutes: 300,
  },
  food: {
    diet: "omnivore",
    allergies: [],
    defaultServings: 2,
    goal: "balanced",
  },
};

export const ACCENT_COLORS: Record<AccentColor, { label: string; hex: string }> = {
  orange: { label: "Orange", hex: "#f97316" },
  blue:   { label: "Bleu",   hex: "#3b82f6" },
  purple: { label: "Violet", hex: "#a855f7" },
  green:  { label: "Vert",   hex: "#22c55e" },
  pink:   { label: "Rose",   hex: "#ec4899" },
  cyan:   { label: "Cyan",   hex: "#06b6d4" },
};
