"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Plus, Sparkles, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import FlashcardForm from "@/components/flashcards/FlashcardForm";
import GenerateSheet from "@/components/flashcards/GenerateSheet";
import ReviewMode from "@/components/flashcards/ReviewMode";
import { useDecks, useFlashcards } from "@/lib/flashcards/store";
import { dueCards } from "@/lib/flashcards/stats";

export default function DeckDetailPage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params?.deckId ?? "";
  const router = useRouter();

  const {
    decks,
    remove: removeDeck,
    hydrated: decksReady,
  } = useDecks();
  const {
    cards,
    add: addCard,
    remove: removeCard,
    removeByDeck,
    review,
    hydrated: cardsReady,
  } = useFlashcards();

  const [formOpen, setFormOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hydrated = decksReady && cardsReady;
  const deck = useMemo(
    () => decks.find((d) => d.id === deckId),
    [decks, deckId]
  );
  const deckCards = useMemo(
    () => cards.filter((c) => c.deckId === deckId),
    [cards, deckId]
  );
  const due = useMemo(() => dueCards(deckCards), [deckCards]);

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Deck" backHref="/etude/flashcards" />
        <div className="px-5">
          <div className="h-32 animate-pulse rounded-none bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  if (!deck) {
    return (
      <>
        <PageHeader title="Deck introuvable" backHref="/etude/flashcards" />
        <div className="px-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            Ce deck n&apos;existe plus.
          </p>
        </div>
      </>
    );
  }

  function handleDeleteDeck() {
    if (!deck) return;
    removeByDeck(deck.id);
    removeDeck(deck.id);
    router.replace("/etude/flashcards");
  }

  return (
    <>
      <PageHeader
        title={deck.title}
        subtitle={deck.description ?? "Flashcards"}
        backHref="/etude/flashcards"
      />

      <div className="flex flex-col gap-4 px-5 pb-6">
        {/* Hero */}
        <div
          className="flex items-center gap-4 rounded-none p-5 ghost-border"
          style={{
            background: `linear-gradient(135deg, ${deck.color}33 0%, ${deck.color}0a 100%)`,
          }}
        >
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-none text-4xl ember-emoji ghost-border"
            style={{ background: `${deck.color}33` }}
          >
            {deck.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              À réviser
            </p>
            <p
              className="text-3xl font-bold leading-tight"
              style={{ color: deck.color }}
            >
              {due.length}
              <span className="ml-1 text-sm font-medium text-[var(--color-text-muted)]">
                / {deckCards.length}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={due.length === 0}
            onClick={() => setReviewing(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-none py-4 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            style={{
              background: deck.color,
              boxShadow: `0 12px 32px -14px ${deck.color}`,
            }}
          >
            <Play size={16} />
            {due.length > 0
              ? `Réviser (${due.length})`
              : "Rien à réviser"}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setFormOpen(true)}
            className="flex items-center justify-center gap-2 rounded-none bg-[var(--color-surface)] px-4 py-4 text-sm font-semibold text-[var(--color-text)] ghost-border"
          >
            <Plus size={16} /> Carte
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setGenerateOpen(true)}
            className="flex items-center justify-center gap-2 rounded-none px-4 py-4 text-sm font-semibold ghost-border"
            style={{
              background: `${deck.color}15`,
              color: deck.color,
            }}
          >
            <Sparkles size={16} /> IA
          </motion.button>
        </div>

        {/* Cards list */}
        {deckCards.length === 0 ? (
          <div className="rounded-none bg-[var(--color-surface)] p-8 text-center ghost-border">
            <p className="text-4xl ember-emoji">{deck.emoji}</p>
            <h3 className="mt-3 font-semibold">Deck vide</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Ajoute ta première carte pour démarrer.
            </p>
          </div>
        ) : (
          <section>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              Cartes ({deckCards.length})
            </h2>
            <div className="flex flex-col gap-2">
              {deckCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-start gap-3 rounded-none bg-[var(--color-surface)] p-4 ghost-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {card.front}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                      {card.back}
                    </p>
                    <p className="mt-1.5 text-[10px] text-[var(--color-text-subtle)]">
                      Prochaine :{" "}
                      {new Date(card.dueDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                      {card.interval > 0 && ` · ${card.interval} j`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-subtle)] active:scale-95 active:bg-[var(--color-surface-2)]"
                    aria-label="Supprimer la carte"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Danger zone */}
        <div className="mt-2">
          {confirmDelete ? (
            <div className="rounded-none bg-[var(--color-surface)] p-4 ring-1 ring-red-500/30">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Supprimer ce deck ?
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {deckCards.length} carte{deckCards.length > 1 ? "s" : ""}{" "}
                seront supprimées définitivement.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-none bg-[var(--color-surface-2)] py-2.5 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDeck}
                  className="flex-1 rounded-none bg-red-500 py-2.5 text-xs font-semibold text-white"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-none py-3 text-xs font-medium text-[var(--color-text-subtle)]"
            >
              <Trash2 size={13} /> Supprimer le deck
            </button>
          )}
        </div>
      </div>

      <FlashcardForm
        open={formOpen}
        deckId={deck.id}
        color={deck.color}
        onClose={() => setFormOpen(false)}
        onCreate={(input) => addCard(input)}
      />

      <GenerateSheet
        open={generateOpen}
        deckColor={deck.color}
        onClose={() => setGenerateOpen(false)}
        onImport={(importedCards) => {
          for (const c of importedCards) {
            addCard({ deckId: deck.id, front: c.front, back: c.back });
          }
        }}
      />

      <AnimatePresence>
        {reviewing && (
          <ReviewMode
            cards={due}
            deckColor={deck.color}
            onGrade={(cardId, grade) => review(cardId, grade)}
            onExit={() => setReviewing(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
