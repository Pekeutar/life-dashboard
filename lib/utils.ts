import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function formatDistance(km?: number): string {
  if (km == null) return "";
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS);
}

export function formatRelativeDate(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diff = daysBetween(now, date);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff === -1) return "Demain";
  if (diff > 1 && diff <= 6) return `Il y a ${diff} j`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function formatLongDate(d: Date = new Date()): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
  });
}

export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun
  const offset = day === 0 ? -6 : 1 - day; // make Monday the first day
  x.setDate(x.getDate() + offset);
  return x;
}

export function weekKey(iso: string): string {
  const d = new Date(iso);
  const monday = startOfWeek(d);
  return monday.toISOString().slice(0, 10);
}

/**
 * YYYY-MM-DD string in LOCAL time (not UTC). Used to key calendar cells.
 */
export function dayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Build a 6-row × 7-col grid of Dates covering the given month.
 * Starts on Monday, pads with days from the previous/next month to fill 42 cells.
 */
export function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstMonday = startOfWeek(firstOfMonth);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(firstMonday);
    d.setDate(firstMonday.getDate() + i);
    cells.push(d);
  }
  return cells;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function formatMonthYear(d: Date): string {
  return d
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());
}

export function formatShortDayDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
