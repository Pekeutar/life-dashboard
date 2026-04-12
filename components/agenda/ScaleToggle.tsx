"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AgendaScale = "month" | "week" | "day";

interface Props {
  value: AgendaScale;
  onChange: (v: AgendaScale) => void;
}

const OPTIONS: { id: AgendaScale; label: string }[] = [
  { id: "month", label: "Mois" },
  { id: "week", label: "Semaine" },
  { id: "day", label: "Jour" },
];

export default function ScaleToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-[var(--color-surface)] p-1 ring-1 ring-[var(--color-border)]">
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              active
                ? "text-white"
                : "text-[var(--color-text-subtle)] active:text-[var(--color-text)]"
            )}
          >
            {active && (
              <motion.div
                layoutId="scale-toggle-bg"
                className="absolute inset-0 rounded-xl bg-[var(--color-accent)]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
