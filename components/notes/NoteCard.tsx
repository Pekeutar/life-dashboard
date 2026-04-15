"use client";

import { motion } from "framer-motion";
import type { Note } from "@/lib/notes/types";
import { formatShortDayDate } from "@/lib/utils";

interface Props {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: Props) {
  const preview = note.content.trim();
  const firstLine = preview.split("\n")[0];
  const rest = preview.slice(firstLine.length).trim();

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex h-full flex-col gap-2 rounded-2xl bg-[var(--color-surface)] p-3 text-left ring-1 ring-[var(--color-border)] active:bg-[var(--color-surface-2)]"
    >
      <p className="line-clamp-1 text-[13px] font-semibold text-[var(--color-text)]">
        {firstLine || "Note vide"}
      </p>
      {rest && (
        <p className="line-clamp-5 whitespace-pre-wrap text-[12px] leading-snug text-[var(--color-text-muted)]">
          {rest}
        </p>
      )}
      {note.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--color-accent)]/15 px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-accent)]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      <p className="text-[9px] uppercase tracking-wide text-[var(--color-text-subtle)]">
        {formatShortDayDate(new Date(note.updatedAt))}
      </p>
    </motion.button>
  );
}
