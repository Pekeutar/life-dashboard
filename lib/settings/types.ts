export type ThemeMode = "dark" | "light" | "auto";

export type AccentColor =
  | "gold"
  | "blood"
  | "bordeaux"
  | "ember"
  | "stone"
  | "oxide";

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
  accent: "gold",
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
  gold:     { label: "Or",       hex: "#c5a364" },
  blood:    { label: "Sang",     hex: "#8b1a3a" },
  bordeaux: { label: "Bordeaux", hex: "#5a0f1f" },
  ember:    { label: "Braise",   hex: "#6a0a0a" },
  stone:    { label: "Pierre",   hex: "#8a6f3c" },
  oxide:    { label: "Oxyde",    hex: "#3a0a14" },
};
