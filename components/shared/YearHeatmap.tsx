"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import {
  buildYearHeatmap,
  type HeatmapDay,
} from "@/lib/heatmap/data";
import type { Workout } from "@/lib/sport/types";
import type { StudySession } from "@/lib/study/types";

const LEVEL_COLORS = [
  "rgba(255,255,255,0.05)",
  "rgba(90, 15, 31,0.28)",
  "rgba(90, 15, 31,0.52)",
  "rgba(90, 15, 31,0.78)",
  "#5a0f1f",
];

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_LABELS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "jan", "fév", "mar", "avr", "mai", "juin",
  "juil", "août", "sep", "oct", "nov", "déc",
];

type ViewMode = "week" | "month" | "year";

interface Props {
  workouts: Workout[];
  sessions: StudySession[];
}

export default function YearHeatmap({ workouts, sessions }: Props) {
  const fullData = useMemo(
    () => buildYearHeatmap(workouts, sessions, new Date()),
    [workouts, sessions]
  );

  const [view, setView] = useState<ViewMode>("month");
  const [selected, setSelected] = useState<HeatmapDay | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Flatten days for linear views
  const linearDays = useMemo(() => {
    const allDays = fullData.weeks.flat().filter((d) => !d.isFuture);
    const today = new Date();
    if (view === "week") {
      return allDays.slice(-7);
    }
    if (view === "month") {
      // Last 30 days
      const thirtyAgo = new Date(today);
      thirtyAgo.setDate(thirtyAgo.getDate() - 29);
      const cutoff = thirtyAgo.getTime();
      return allDays.filter(
        (d) => d.dateObj.getTime() >= cutoff
      );
    }
    return [];
  }, [fullData.weeks, view]);

  // Year view data
  const yearWeeks = fullData.weeks;

  // Stats for current view
  const viewStats = useMemo(() => {
    const days = view === "year"
      ? yearWeeks.flat().filter((d) => !d.isFuture)
      : linearDays;
    const active = days.filter((d) => d.xp > 0);
    const totalXp = active.reduce((s, d) => s + d.xp, 0);
    return { activeDays: active.length, totalDays: days.length, totalXp };
  }, [view, linearDays, yearWeeks]);

  // Auto-scroll to right on year view
  useEffect(() => {
    const el = scrollRef.current;
    if (el && view === "year") el.scrollLeft = el.scrollWidth;
  }, [view]);

  // Month labels for year view
  const monthLabels = useMemo(() => {
    if (view !== "year") return [];
    const labels: { index: number; label: string }[] = [];
    let lastMonth = -1;
    yearWeeks.forEach((week, i) => {
      const m = week[0].dateObj.getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        labels.push({ index: i, label: MONTH_NAMES[m] });
      }
    });
    return labels;
  }, [yearWeeks, view]);

  const viewTitle =
    view === "week"
      ? "Cette semaine"
      : view === "month"
        ? "30 derniers jours"
        : "Ton année";

  const VIEW_BUTTONS: { value: ViewMode; label: string }[] = [
    { value: "week", label: "Sem" },
    { value: "month", label: "Mois" },
    { value: "year", label: "Année" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-none bg-[var(--color-surface)] p-4 ghost-border"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            <Flame size={12} /> {viewTitle}
          </h3>
          <p className="mt-0.5 text-[10px] text-[var(--color-text-subtle)]">
            {viewStats.activeDays}/{viewStats.totalDays} jour
            {viewStats.totalDays > 1 ? "s" : ""} actif
            {viewStats.activeDays > 1 ? "s" : ""} ·{" "}
            <span className="text-[var(--color-text-muted)]">
              {viewStats.totalXp.toLocaleString("fr-FR")} XP
            </span>
          </p>
        </div>

        {/* View toggle */}
        <div className="flex shrink-0 items-center gap-0.5 rounded-none bg-[var(--color-surface-2)] p-0.5">
          {VIEW_BUTTONS.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => {
                setView(btn.value);
                setSelected(null);
              }}
              className="rounded-none px-2.5 py-1 text-[10px] font-semibold transition-all"
              style={
                view === btn.value
                  ? { background: "rgba(90, 15, 31,0.15)", color: "#5a0f1f" }
                  : { color: "var(--color-text-subtle)" }
              }
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Week view: 7 cells, horizontal, full width ── */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-1.5">
          {linearDays.map((day) => {
            const active = selected?.date === day.date;
            const isToday =
              day.date ===
              new Date().toISOString().slice(0, 10);
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelected(day)}
                className="flex flex-col items-center gap-1 transition active:scale-95"
              >
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isToday
                      ? "#5a0f1f"
                      : "var(--color-text-subtle)",
                  }}
                >
                  {DAY_LABELS[day.dateObj.getDay() === 0 ? 6 : day.dateObj.getDay() - 1]}
                </span>
                <div
                  className="flex w-full items-center justify-center transition-all"
                  style={{
                    height: 44,
                    borderRadius: 10,
                    background: LEVEL_COLORS[day.level],
                    boxShadow: active
                      ? "0 0 0 2px var(--color-text)"
                      : isToday
                        ? "inset 0 0 0 1.5px rgba(90, 15, 31,0.4)"
                        : undefined,
                  }}
                >
                  {day.xp > 0 && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#5a0f1f" }}
                    >
                      {day.xp}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-[var(--color-text-subtle)]">
                  {day.dateObj.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Month view: 30 cells, horizontal, full width ── */}
      {view === "month" && (
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${Math.min(linearDays.length, 15)}, 1fr)`,
          }}
        >
          {linearDays.map((day) => {
            const active = selected?.date === day.date;
            const isToday =
              day.date ===
              new Date().toISOString().slice(0, 10);
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelected(day)}
                className="flex flex-col items-center gap-0.5 transition active:scale-90"
              >
                <div
                  className="w-full transition-all"
                  style={{
                    height: 22,
                    borderRadius: 4,
                    background: LEVEL_COLORS[day.level],
                    boxShadow: active
                      ? "0 0 0 1.5px var(--color-text)"
                      : isToday
                        ? "inset 0 0 0 1px rgba(90, 15, 31,0.5)"
                        : undefined,
                  }}
                />
                {/* Show date number every few days to avoid clutter */}
                <span
                  className="text-[7px]"
                  style={{
                    color: isToday
                      ? "#5a0f1f"
                      : "var(--color-text-subtle)",
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {day.dateObj.getDate() === 1 ||
                  day.dateObj.getDate() % 5 === 0 ||
                  isToday
                    ? day.dateObj.getDate()
                    : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Year view: classic grid ── */}
      {view === "year" && (
        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex" style={{ minWidth: "fit-content" }}>
            {/* Day-of-week labels */}
            <div
              className="mr-1.5 flex shrink-0 flex-col"
              style={{ paddingTop: 16, gap: "3px", width: 22 }}
            >
              {DAY_LABELS_SHORT.map((label, i) => (
                <div
                  key={`${label}-${i}`}
                  className="text-[8px] text-[var(--color-text-subtle)]"
                  style={{ height: 12, lineHeight: "12px" }}
                >
                  {i % 2 === 0 ? label : ""}
                </div>
              ))}
            </div>

            <div>
              {/* Month labels */}
              <div
                className="relative"
                style={{
                  height: 14,
                  marginBottom: 2,
                  width: yearWeeks.length * 15,
                }}
              >
                {monthLabels.map(({ index, label }) => (
                  <span
                    key={`${index}-${label}`}
                    className="absolute text-[9px] font-medium text-[var(--color-text-subtle)]"
                    style={{ left: index * 15, top: 0 }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Grid */}
              <div className="flex" style={{ gap: "3px" }}>
                {yearWeeks.map((week, w) => (
                  <div
                    key={w}
                    className="flex flex-col"
                    style={{ gap: "3px" }}
                  >
                    {week.map((day) => {
                      const isActive = selected?.date === day.date;
                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSelected(day)}
                          disabled={day.isFuture}
                          className="rounded-[3px] transition disabled:cursor-default active:scale-90"
                          style={{
                            width: 12,
                            height: 12,
                            background: day.isFuture
                              ? "transparent"
                              : LEVEL_COLORS[day.level],
                            boxShadow: isActive
                              ? "0 0 0 1.5px var(--color-text)"
                              : day.isFuture
                                ? "inset 0 0 0 1px rgba(255,255,255,0.04)"
                                : undefined,
                          }}
                          aria-label={`${day.date}: ${day.xp} XP`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail / legend row */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {selected ? (
          <div className="min-w-0 flex-1 text-[11px]">
            <span className="font-semibold text-[var(--color-text)]">
              {selected.dateObj.toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="text-[var(--color-text-subtle)]"> · </span>
            {selected.xp === 0 ? (
              <span className="text-[var(--color-text-subtle)]">
                Journée libre
              </span>
            ) : (
              <>
                <span
                  className="font-semibold"
                  style={{ color: "#5a0f1f" }}
                >
                  {selected.xp} XP
                </span>
                {selected.sportCount > 0 && (
                  <span className="text-[var(--color-text-muted)]">
                    {" · "}
                    {selected.sportCount}× sport
                  </span>
                )}
                {selected.studyCount > 0 && (
                  <span className="text-[var(--color-text-muted)]">
                    {" · "}
                    {selected.studyCount}× étude
                  </span>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-[var(--color-text-subtle)]">
            Touche une case pour voir le détail
          </p>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <span className="text-[9px] text-[var(--color-text-subtle)]">
            −
          </span>
          {LEVEL_COLORS.map((c, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{ width: 10, height: 10, background: c }}
            />
          ))}
          <span className="text-[9px] text-[var(--color-text-subtle)]">
            +
          </span>
        </div>
      </div>
    </motion.section>
  );
}
