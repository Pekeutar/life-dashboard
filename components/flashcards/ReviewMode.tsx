"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import type { Flashcard, ReviewGrade } from "@/lib/flashcards/types";
import { previewNextInterval } from "@/lib/flashcards/sm2";
import { sortedDueFirst } from "@/lib/flashcards/stats";

interface Props {
  cards: Flashcard[];
  deckColor: string;
  onGrade: (cardId: string, grade: ReviewGrade) => void;
  onExit: () => void;
}

interface SessionStats {
  good: number;
  hard: number;
  again: number;
}

const INITIAL_STATS: SessionStats = { good: 0, hard: 0, again: 0 };

export default function ReviewMode({
  cards,
  deckColor,
  onGrade,
  onExit,
}: Props) {
  // Snapshot the queue at mount — we don't want the grid to reshuffle
  // as cards get graded (they'd reappear at the end because they're no longer "due").
  const queue = useMemo(() => sortedDueFirst(cards), [cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<SessionStats>(INITIAL_STATS);

  const total = queue.length;
  const current = queue[index];
  const done = index >= total;

  function handleGrade(grade: ReviewGrade) {
    if (!current) return;
    onGrade(current.id, grade);
    setStats((s) => ({ ...s, [grade]: s[grade] + 1 }));
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
        <button
          type="button"
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] active:scale-95"
          aria-label="Quitter la session"
        >
          <X size={18} />
        </button>
        <div className="flex-1">
          <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (Math.min(index, total) / Math.max(1, total)) * 100)}%`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: deckColor }}
            />
          </div>
          <p className="mt-1 text-center text-[10px] font-medium text-[var(--color-text-subtle)]">
            {done ? `${total} / ${total}` : `${index + 1} / ${total}`}
          </p>
        </div>
        <div className="h-10 w-10" />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-5">
        {done ? (
          <SessionSummary
            stats={stats}
            total={total}
            color={deckColor}
            onExit={onExit}
          />
        ) : current ? (
          <CardFace
            key={current.id}
            card={current}
            flipped={flipped}
            onFlip={() => setFlipped((v) => !v)}
            color={deckColor}
          />
        ) : null}
      </div>

      {/* Grade buttons */}
      {!done && current && (
        <div className="px-5 pb-4 pt-2">
          <AnimatePresence mode="wait">
            {flipped ? (
              <motion.div
                key="grades"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-2"
              >
                <GradeButton
                  color="#ef4444"
                  label="Raté"
                  sublabel={previewNextInterval(current, "again")}
                  onClick={() => handleGrade("again")}
                />
                <GradeButton
                  color="#f59e0b"
                  label="Hésité"
                  sublabel={previewNextInterval(current, "hard")}
                  onClick={() => handleGrade("hard")}
                />
                <GradeButton
                  color="#22c55e"
                  label="Savais"
                  sublabel={previewNextInterval(current, "good")}
                  onClick={() => handleGrade("good")}
                />
              </motion.div>
            ) : (
              <motion.button
                key="flip"
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFlipped(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg"
                style={{
                  background: deckColor,
                  boxShadow: `0 14px 40px -14px ${deckColor}`,
                }}
              >
                <RotateCcw size={16} /> Voir la réponse
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function CardFace({
  card,
  flipped,
  onFlip,
  color,
}: {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
  color: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onFlip}
      className="relative flex aspect-[3/4] w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl ring-1 ring-[var(--color-border)]"
      style={{
        background: `linear-gradient(160deg, ${color}22 0%, var(--color-surface) 60%)`,
      }}
      whileTap={{ scale: 0.98 }}
      aria-label={flipped ? "Retourner la carte" : "Voir la réponse"}
    >
      <span
        className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color }}
      >
        {flipped ? "Réponse" : "Question"}
      </span>

      <AnimatePresence mode="wait">
        <motion.p
          key={flipped ? "back" : "front"}
          initial={{ opacity: 0, rotateY: flipped ? -90 : 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: flipped ? 90 : -90 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="whitespace-pre-wrap px-8 text-center text-xl font-semibold leading-snug text-[var(--color-text)]"
        >
          {flipped ? card.back : card.front}
        </motion.p>
      </AnimatePresence>

      {!flipped && (
        <span className="absolute bottom-4 text-[10px] text-[var(--color-text-subtle)]">
          Touche pour retourner
        </span>
      )}
    </motion.button>
  );
}

function GradeButton({
  color,
  label,
  sublabel,
  onClick,
}: {
  color: string;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg"
      style={{
        background: color,
        boxShadow: `0 10px 30px -12px ${color}`,
      }}
    >
      <span>{label}</span>
      <span className="text-[10px] font-normal opacity-80">{sublabel}</span>
    </motion.button>
  );
}

function SessionSummary({
  stats,
  total,
  color,
  onExit,
}: {
  stats: SessionStats;
  total: number;
  color: string;
  onExit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-[var(--color-surface)] p-6 text-center ring-1 ring-[var(--color-border)]"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: `${color}22`, color }}
      >
        <Sparkles size={30} />
      </div>
      <div>
        <h3 className="text-xl font-bold">Session terminée !</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {total} {total <= 1 ? "carte révisée" : "cartes révisées"}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <StatRow label="Savais" value={stats.good} color="#22c55e" />
        <StatRow label="Hésité" value={stats.hard} color="#f59e0b" />
        <StatRow label="Raté" value={stats.again} color="#ef4444" />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onExit}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white"
        style={{
          background: color,
          boxShadow: `0 12px 32px -12px ${color}`,
        }}
      >
        <Check size={16} /> Retour au deck
      </motion.button>
    </motion.div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-2)]/50 px-4 py-2">
      <span className="text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
