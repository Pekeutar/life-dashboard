"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAgendaEvents } from "@/lib/agenda/store";
import { useCategoryMetas } from "@/lib/agenda/meta";
import AddTypeSheet from "@/components/shared/AddTypeSheet";
import { cn } from "@/lib/utils";

const CATEGORY_EMOJI_SUGGESTIONS = [
  "📝", "⏰", "👥", "🔔", "🎯", "📌",
  "🎂", "✈️", "🎉", "💊", "💰", "🏠",
  "🧾", "📞", "🎬", "🍽️", "🩺", "🚗",
  "🎓", "🏆", "💍", "🛫", "🧳", "🔑",
];

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm() {
  const router = useRouter();
  const { add } = useAgendaEvents();
  const searchParams = useSearchParams();
  const { all, customs, addCustom, removeCustom } = useCategoryMetas();

  // Allow /agenda/new?date=YYYY-MM-DD to prefill the date
  const prefilledDate = searchParams.get("date");
  const initialDate = (() => {
    if (prefilledDate) {
      const d = new Date(prefilledDate + "T09:00");
      if (!isNaN(d.getTime())) return d;
    }
    const now = new Date();
    // Default: today at next round hour
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now;
  })();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("exam");
  const [datetime, setDatetime] = useState(toDatetimeLocal(initialDate));
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    add({
      title: title.trim(),
      category,
      date: new Date(datetime).toISOString(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    router.push("/agenda");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-5 pb-8">
      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Catégorie
        </label>
        <div className="grid grid-cols-3 gap-2">
          {all.map((c) => {
            const active = category === c.id;
            return (
              <motion.button
                type="button"
                key={c.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl p-3 transition-colors",
                  active
                    ? "bg-[var(--color-surface-2)]"
                    : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]"
                )}
                style={
                  active
                    ? { boxShadow: `inset 0 0 0 2px ${c.color}` }
                    : undefined
                }
              >
                <span className="text-2xl leading-none">{c.emoji}</span>
                <span className="truncate text-[11px] font-medium text-[var(--color-text-muted)]">
                  {c.label}
                </span>
              </motion.button>
            );
          })}

          <motion.button
            type="button"
            onClick={() => setSheetOpen(true)}
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--color-border-strong)] p-3 text-[var(--color-text-subtle)] transition-colors active:bg-[var(--color-surface)]"
            aria-label="Ajouter une catégorie personnalisée"
          >
            <Plus size={22} />
            <span className="text-[11px] font-medium">Ajouter</span>
          </motion.button>
        </div>
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Titre
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Examen de maths, deadline projet…"
          maxLength={80}
          className="w-full rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-base outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
          required
        />
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Date & heure
        </label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-base outline-none ring-1 ring-[var(--color-border)]"
          required
        />
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Description (optionnel)
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Un petit résumé en une ligne"
          maxLength={120}
          className="w-full rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-base outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
        />
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Notes (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Ce qu'il faut préparer, points à réviser, contexte…"
          className="w-full resize-none rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
        />
      </section>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={!title.trim()}
        className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:shadow-none"
      >
        Enregistrer
      </motion.button>

      <AddTypeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Nouvelle catégorie"
        subtitle="Crée une catégorie qui te ressemble"
        accent="#f97316"
        emojiSuggestions={CATEGORY_EMOJI_SUGGESTIONS}
        customs={customs}
        onCreate={(draft) => {
          const created = addCustom({
            label: draft.label,
            emoji: draft.emoji,
            color: draft.color,
          });
          setCategory(created.id);
          setSheetOpen(false);
        }}
        onDelete={(id) => {
          removeCustom(id);
          if (category === id) setCategory("other");
        }}
      />
    </form>
  );
}
