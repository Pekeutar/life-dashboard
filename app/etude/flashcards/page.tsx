"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Library, Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import CreateDeckSheet from "@/components/flashcards/CreateDeckSheet";
import { useDecks, useFlashcards } from "@/lib/flashcards/store";
import { countByDeck, dueCount } from "@/lib/flashcards/stats";

export default function FlashcardsPage() {
  const { decks, add: addDeck, hydrated: decksReady } = useDecks();
  const { cards, hydrated: cardsReady } = useFlashcards();
  const [sheetOpen, setSheetOpen] = useState(false);

  const hydrated = decksReady && cardsReady;

  const totalDue = useMemo(() => dueCount(cards), [cards]);

  return (
    <>
      <PageHeader
        title="Flashcards"
        subtitle="Révisions espacées"
        backHref="/etude"
      />

      <div className="flex flex-col gap-4 px-5 pb-6">
        {!hydrated ? (
          <div className="h-32 animate-pulse rounded-none bg-[var(--color-surface)]" />
        ) : (
          <>
            {/* Hero stats */}
            <div
              className="rounded-none p-5 ghost-border"
              style={{
                background:
                  "linear-gradient(135deg, rgba(197,163,100,0.15) 0%, rgba(58,10,20,0.08) 100%)",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                À réviser aujourd&apos;hui
              </p>
              <p
                className="mt-1 font-headline text-4xl font-bold"
                style={{ color: "var(--color-gold)" }}
              >
                {totalDue}
                <span className="ml-1 text-sm font-medium text-[var(--color-text-muted)]">
                  carte{totalDue > 1 ? "s" : ""}
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {decks.length} deck{decks.length > 1 ? "s" : ""} ·{" "}
                {cards.length} carte{cards.length > 1 ? "s" : ""} au total
              </p>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setSheetOpen(true)}
              className="flex items-center justify-center gap-2 rounded-none bg-[var(--color-surface)] py-4 text-sm font-semibold text-[var(--color-text)] ghost-border"
            >
              <Plus size={18} /> Nouveau deck
            </motion.button>

            {decks.length === 0 ? (
              <div className="rounded-none bg-[var(--color-surface)] p-8 text-center ghost-border">
                <Library size={40} className="mx-auto text-[var(--color-gold-deep)]" />
                <h3 className="mt-3 font-semibold">Aucun deck</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Crée ton premier paquet pour commencer à réviser.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {decks.map((deck) => {
                  const total = countByDeck(cards, deck.id);
                  const due = dueCount(cards, deck.id);
                  return (
                    <Link
                      key={deck.id}
                      href={`/etude/flashcards/${deck.id}`}
                      className="flex items-center gap-3 rounded-none bg-[var(--color-surface)] p-4 ghost-border active:scale-[0.99]"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none text-2xl ember-emoji ghost-border"
                        style={{ background: `${deck.color}22` }}
                      >
                        {deck.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {deck.title}
                        </p>
                        <p className="truncate text-[11px] text-[var(--color-text-subtle)]">
                          {total === 0
                            ? "Vide — ajoute des cartes"
                            : `${total} carte${total > 1 ? "s" : ""}${
                                due > 0 ? ` · ${due} à réviser` : ""
                              }`}
                        </p>
                      </div>
                      {due > 0 && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: deck.color }}
                        >
                          {due}
                        </span>
                      )}
                      <ChevronRight
                        size={18}
                        className="text-[var(--color-text-subtle)]"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <CreateDeckSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreate={(input) => addDeck(input)}
      />
    </>
  );
}
