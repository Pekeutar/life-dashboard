/**
 * Sport identifier. Built-in sports have stable ids ("running", "gym"…),
 * user-created customs have ids prefixed with "custom:" (see lib/sport/custom.ts).
 */
export type SportType = string;

export type Intensity = 1 | 2 | 3 | 4 | 5;
export type Feeling = 1 | 2 | 3 | 4 | 5;

export interface Workout {
  id: string;
  date: string; // ISO datetime local
  type: SportType;
  durationMin: number;
  distanceKm?: number;
  intensity: Intensity;
  feeling: Feeling;
  notes?: string;
  xp: number;
  createdAt: string;
}

export type NewWorkoutInput = Omit<Workout, "id" | "xp" | "createdAt">;
