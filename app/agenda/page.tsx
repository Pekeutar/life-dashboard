"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import ScaleToggle, { type AgendaScale } from "@/components/agenda/ScaleToggle";
import MonthGrid from "@/components/agenda/MonthGrid";
import ItemRow from "@/components/agenda/ItemRow";
import ItemDetailSheet from "@/components/agenda/ItemDetailSheet";
import { useAgendaItems, type AgendaItem } from "@/lib/agenda/use-agenda-items";
import {
  addDays,
  cn,
  dayKey,
  formatShortDayDate,
  isSameDay,
  startOfWeek,
} from "@/lib/utils";

export default function AgendaPage() {
  const { byDay, hydrated, removeEvent } = useAgendaItems();
  const [scale, setScale] = useState<AgendaScale>("month");
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date());
  const [openItem, setOpenItem] = useState<AgendaItem | null>(null);

  // When selecting a day, keep month cursor in sync
  function handleSelectDay(d: Date) {
    setSelectedDay(d);
    if (
      d.getMonth() !== monthCursor.getMonth() ||
      d.getFullYear() !== monthCursor.getFullYear()
    ) {
      setMonthCursor(d);
    }
  }

  const selectedDayItems = byDay.get(dayKey(selectedDay)) ?? [];

  const weekDays = useMemo(() => {
    const monday = startOfWeek(selectedDay);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [selectedDay]);

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle="Vue d'ensemble de ta vie"
        right={
          <Link
            href="/agenda/new"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg shadow-orange-500/20 active:scale-95"
            aria-label="Nouvel événement"
          >
            <CalendarPlus size={18} />
          </Link>
        }
      />

      <div className="px-5 pb-24">
        <div className="mb-4">
          <ScaleToggle value={scale} onChange={setScale} />
        </div>

        {!hydrated && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)]">
            Chargement…
          </div>
        )}

        {hydrated && scale === "month" && (
          <div className="flex flex-col gap-4">
            <MonthGrid
              monthCursor={monthCursor}
              onMonthChange={(d) => setMonthCursor(d)}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              itemsByDay={byDay}
            />
            <DayList
              day={selectedDay}
              items={selectedDayItems}
              onOpen={setOpenItem}
              emptyHref={`/agenda/new?date=${dayKey(selectedDay)}`}
            />
          </div>
        )}

        {hydrated && scale === "week" && (
          <WeekView
            weekDays={weekDays}
            byDay={byDay}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            onOpenItem={setOpenItem}
            onShiftWeek={(delta) =>
              setSelectedDay((d) => addDays(d, delta * 7))
            }
          />
        )}

        {hydrated && scale === "day" && (
          <DayView
            day={selectedDay}
            items={selectedDayItems}
            onOpen={setOpenItem}
            onShift={(delta) => setSelectedDay((d) => addDays(d, delta))}
          />
        )}
      </div>

      <ItemDetailSheet
        item={openItem}
        onClose={() => setOpenItem(null)}
        onDeleteEvent={removeEvent}
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Sub-views
// -----------------------------------------------------------------------------

function DayList({
  day,
  items,
  onOpen,
  emptyHref,
}: {
  day: Date;
  items: AgendaItem[];
  onOpen: (it: AgendaItem) => void;
  emptyHref: string;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {formatShortDayDate(day).replace(/^./, (c) => c.toUpperCase())}
        </h3>
        <span className="text-[11px] text-[var(--color-text-subtle)]">
          {items.length} {items.length > 1 ? "éléments" : "élément"}
        </span>
      </div>
      {items.length === 0 ? (
        <Link
          href={emptyHref}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-6 text-sm text-[var(--color-text-subtle)] active:bg-[var(--color-surface)]"
        >
          <CalendarPlus size={16} />
          Ajouter un événement
        </Link>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((it) => (
            <ItemRow key={it.id} item={it} onClick={() => onOpen(it)} />
          ))}
        </div>
      )}
    </section>
  );
}

function WeekView({
  weekDays,
  byDay,
  selectedDay,
  onSelectDay,
  onOpenItem,
  onShiftWeek,
}: {
  weekDays: Date[];
  byDay: Map<string, AgendaItem[]>;
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  onOpenItem: (it: AgendaItem) => void;
  onShiftWeek: (delta: number) => void;
}) {
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const rangeLabel = `${weekStart.getDate()} ${weekStart.toLocaleDateString("fr-FR", { month: "short" })} – ${weekEnd.getDate()} ${weekEnd.toLocaleDateString("fr-FR", { month: "short" })}`;
  const today = new Date();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl bg-[var(--color-surface)] p-2 ring-1 ring-[var(--color-border)]">
        <button
          type="button"
          onClick={() => onShiftWeek(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] active:bg-[var(--color-surface-2)]"
          aria-label="Semaine précédente"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold capitalize">{rangeLabel}</span>
        <button
          type="button"
          onClick={() => onShiftWeek(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] active:bg-[var(--color-surface-2)]"
          aria-label="Semaine suivante"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 7-day strip */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d) => {
          const isSel = isSameDay(d, selectedDay);
          const isToday = isSameDay(d, today);
          const items = byDay.get(dayKey(d)) ?? [];
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelectDay(d)}
              className={cn(
                "flex aspect-[2/3] flex-col items-center justify-start gap-1 rounded-xl p-2 text-xs transition-colors",
                isSel
                  ? "bg-[var(--color-accent)] text-white"
                  : isToday
                    ? "bg-[var(--color-surface-2)] ring-1 ring-[var(--color-accent)]"
                    : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]"
              )}
            >
              <span className="text-[9px] font-semibold uppercase opacity-80">
                {d
                  .toLocaleDateString("fr-FR", { weekday: "short" })
                  .slice(0, 3)}
              </span>
              <span className="text-base font-bold">{d.getDate()}</span>
              <div className="mt-auto flex flex-wrap justify-center gap-0.5">
                {items.slice(0, 3).map((it, i) => (
                  <span
                    key={i}
                    className="h-1 w-1 rounded-full"
                    style={{ background: isSel ? "white" : it.color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day sections with items */}
      <div className="flex flex-col gap-5">
        {weekDays.map((d) => {
          const items = byDay.get(dayKey(d)) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={d.toISOString()}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                {formatShortDayDate(d)}
              </h3>
              <div className="flex flex-col gap-2">
                {items.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    onClick={() => onOpenItem(it)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DayView({
  day,
  items,
  onOpen,
  onShift,
}: {
  day: Date;
  items: AgendaItem[];
  onOpen: (it: AgendaItem) => void;
  onShift: (delta: number) => void;
}) {
  const isToday = isSameDay(day, new Date());
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl bg-[var(--color-surface)] p-2 ring-1 ring-[var(--color-border)]">
        <button
          type="button"
          onClick={() => onShift(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] active:bg-[var(--color-surface-2)]"
          aria-label="Jour précédent"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold capitalize">
            {formatShortDayDate(day)}
          </span>
          {isToday && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
              Aujourd&apos;hui
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onShift(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] active:bg-[var(--color-surface-2)]"
          aria-label="Jour suivant"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 p-8 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-3xl">
            🗓️
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Rien de prévu ce jour-là.
          </p>
          <Link
            href={`/agenda/new?date=${dayKey(day)}`}
            className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white active:scale-95"
          >
            <CalendarPlus size={14} />
            Ajouter un événement
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((it) => (
            <ItemRow key={it.id} item={it} onClick={() => onOpen(it)} />
          ))}
        </div>
      )}
    </div>
  );
}
