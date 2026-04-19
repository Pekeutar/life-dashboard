"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  buildMonthGrid,
  cn,
  dayKey,
  formatMonthYear,
  isSameDay,
} from "@/lib/utils";
import type { AgendaItem } from "@/lib/agenda/use-agenda-items";

interface Props {
  monthCursor: Date; // any date within the month to display
  onMonthChange: (d: Date) => void;
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  itemsByDay: Map<string, AgendaItem[]>;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function MonthGrid({
  monthCursor,
  onMonthChange,
  selectedDay,
  onSelectDay,
  itemsByDay,
}: Props) {
  const cells = buildMonthGrid(
    monthCursor.getFullYear(),
    monthCursor.getMonth()
  );
  const currentMonth = monthCursor.getMonth();
  const today = new Date();

  return (
    <div className="rounded-none bg-[var(--color-surface)] p-3 ghost-border">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(monthCursor, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] active:bg-[var(--color-surface-2)]"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-sm font-semibold">
          {formatMonthYear(monthCursor)}
        </h2>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(monthCursor, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] active:bg-[var(--color-surface-2)]"
          aria-label="Mois suivant"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 gap-1 px-0.5">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold uppercase text-[var(--color-text-subtle)]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const inMonth = cell.getMonth() === currentMonth;
          const isToday = isSameDay(cell, today);
          const isSelected = isSameDay(cell, selectedDay);
          const key = dayKey(cell);
          const items = itemsByDay.get(key) ?? [];
          const dots = Array.from(
            new Set(items.slice(0, 3).map((i) => i.color))
          );
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(cell)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-none text-sm transition-colors",
                isSelected
                  ? "bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)]"
                  : isToday
                    ? "bg-[var(--color-surface-2)] text-[var(--color-text)] ring-1 ring-[var(--color-accent)]"
                    : inMonth
                      ? "text-[var(--color-text)] active:bg-[var(--color-surface-2)]"
                      : "text-[var(--color-text-subtle)] active:bg-[var(--color-surface-2)]"
              )}
            >
              <span className={cn(inMonth ? "" : "opacity-50")}>
                {cell.getDate()}
              </span>
              {dots.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {dots.map((c, i) => (
                    <span
                      key={i}
                      className="h-1 w-1 rounded-full"
                      style={{
                        background: isSelected ? "white" : c,
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
