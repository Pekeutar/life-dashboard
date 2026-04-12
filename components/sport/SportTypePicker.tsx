"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useSportMetas } from "@/lib/sport/meta";
import AddTypeSheet from "@/components/shared/AddTypeSheet";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const SPORT_EMOJI_SUGGESTIONS = [
  "🏃", "🚴", "🏊", "🏋️", "🧘", "🥾", "⚽", "🎾",
  "🥊", "🧗", "🚶", "🏀", "🏐", "🏓", "⛹️", "🤺",
  "🏹", "🏌️", "🛹", "⛷️", "🏂", "🤸", "🚣", "🏇",
];

export default function SportTypePicker({ value, onChange }: Props) {
  const { all, customs, addCustom, removeCustom } = useSportMetas();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {all.map((sport) => {
          const active = value === sport.id;
          return (
            <motion.button
              key={sport.id}
              type="button"
              onClick={() => onChange(sport.id)}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-2xl p-3 transition-colors",
                active
                  ? "bg-[var(--color-surface-2)] ring-2 ring-[var(--color-accent)]"
                  : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
              )}
              aria-pressed={active}
            >
              <span className="text-2xl leading-none">{sport.emoji}</span>
              <span className="truncate text-[11px] font-medium text-[var(--color-text-muted)]">
                {sport.label}
              </span>
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          onClick={() => setSheetOpen(true)}
          whileTap={{ scale: 0.92 }}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--color-border-strong)] p-3 text-[var(--color-text-subtle)] transition-colors active:bg-[var(--color-surface)]"
          aria-label="Ajouter un sport personnalisé"
        >
          <Plus size={22} />
          <span className="text-[11px] font-medium">Ajouter</span>
        </motion.button>
      </div>

      <AddTypeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Nouveau sport"
        subtitle="Ton sport n'est pas dans la liste ? Ajoute-le."
        accent="#f97316"
        withDistance
        emojiSuggestions={SPORT_EMOJI_SUGGESTIONS}
        customs={customs}
        onCreate={(draft) => {
          const created = addCustom({
            label: draft.label,
            emoji: draft.emoji,
            color: draft.color,
            hasDistance: draft.hasDistance,
          });
          onChange(created.id);
          setSheetOpen(false);
        }}
        onDelete={(id) => {
          removeCustom(id);
          if (value === id) onChange("running");
        }}
      />
    </>
  );
}
