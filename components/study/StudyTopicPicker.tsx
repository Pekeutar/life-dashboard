"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useStudyMetas } from "@/lib/study/meta";
import AddTypeSheet from "@/components/shared/AddTypeSheet";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const STUDY_EMOJI_SUGGESTIONS = [
  "💻", "🗣️", "📖", "🎓", "📚", "✍️", "🔬", "🧮",
  "🧠", "📐", "🔭", "🎨", "🎵", "🗂️", "📊", "🕯️",
  "📜", "🧪", "♟️", "🏛️", "🌐", "💡", "📝", "🔖",
];

export default function StudyTopicPicker({ value, onChange }: Props) {
  const { all, customs, addCustom, removeCustom } = useStudyMetas();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {all.map((topic) => {
          const active = value === topic.id;
          return (
            <motion.button
              key={topic.id}
              type="button"
              onClick={() => onChange(topic.id)}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-none p-3 transition-colors",
                active
                  ? "bg-[var(--color-surface-2)] ring-2 ring-[var(--color-level)]"
                  : "bg-[var(--color-surface)] ghost-border active:bg-[var(--color-surface-2)]"
              )}
              aria-pressed={active}
            >
              <span className="text-2xl leading-none ember-emoji">{topic.emoji}</span>
              <span className="truncate text-[11px] font-medium text-[var(--color-text-muted)]">
                {topic.label}
              </span>
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          onClick={() => setSheetOpen(true)}
          whileTap={{ scale: 0.92 }}
          className="flex flex-col items-center justify-center gap-1 rounded-none border-2 border-dashed border-[var(--color-border-strong)] p-3 text-[var(--color-text-subtle)] transition-colors active:bg-[var(--color-surface)]"
          aria-label="Ajouter un sujet personnalisé"
        >
          <Plus size={22} />
          <span className="text-[11px] font-medium">Ajouter</span>
        </motion.button>
      </div>

      <AddTypeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Nouveau sujet d'étude"
        subtitle="Crée ton sujet personnalisé."
        accent="#3a0a14"
        emojiSuggestions={STUDY_EMOJI_SUGGESTIONS}
        customs={customs}
        onCreate={(draft) => {
          const created = addCustom({
            label: draft.label,
            emoji: draft.emoji,
            color: draft.color,
          });
          onChange(created.id);
          setSheetOpen(false);
        }}
        onDelete={(id) => {
          removeCustom(id);
          if (value === id) onChange("programming");
        }}
      />
    </>
  );
}
