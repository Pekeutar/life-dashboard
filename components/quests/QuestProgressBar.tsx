"use client";

import { motion } from "framer-motion";

interface Props {
  ratio: number; // 0..1
  color: string;
  height?: number;
}

export default function QuestProgressBar({
  ratio,
  color,
  height = 8,
}: Props) {
  const clamped = Math.max(0, Math.min(1, ratio));
  return (
    <div
      className="relative overflow-hidden rounded-full bg-[var(--color-surface-2)]/60"
      style={{ height }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped * 100}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}
