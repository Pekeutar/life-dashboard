"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mic, MicOff, Trash2, X } from "lucide-react";
import { useSpeechRecognition } from "@/lib/speech";
import { extractInlineTags, useNotes } from "@/lib/notes/store";
import type { Note } from "@/lib/notes/types";
import { cn } from "@/lib/utils";

interface Props {
  /** When string = existing note id, "new" = create, null = closed. */
  target: string | "new" | null;
  onClose: () => void;
}

export default function NoteEditorSheet({ target, onClose }: Props) {
  const { notes, add, update, remove } = useNotes();
  const existing = typeof target === "string" && target !== "new"
    ? notes.find((n) => n.id === target) ?? null
    : null;

  const [content, setContent] = useState("");
  const [dictating, setDictating] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const dictationStartRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    supported,
    listening,
    transcript,
    error: speechError,
    start,
    stop,
    reset,
  } = useSpeechRecognition({ lang: "fr-FR", continuous: true });

  // Remonter le sheet quand le clavier mobile s'ouvre
  useEffect(() => {
    if (target === null) { setKeyboardOffset(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    function onResize() {
      const offset = window.innerHeight - vv!.height;
      setKeyboardOffset(offset > 50 ? offset : 0);
    }
    vv.addEventListener("resize", onResize);
    // Vérifier immédiatement si le clavier est déjà ouvert (race condition au mount)
    onResize();
    return () => vv.removeEventListener("resize", onResize);
  }, [target]);

  // Load content when target changes
  useEffect(() => {
    if (target === null) return;
    setContent(existing?.content ?? "");
    reset();
    setDictating(false);
  }, [target, existing?.id, reset]);

  // Live-append dictation to existing content
  useEffect(() => {
    if (!dictating || !listening) return;
    if (!transcript) return;
    const base = dictationStartRef.current;
    const sep = base && !base.endsWith(" ") && !base.endsWith("\n") ? " " : "";
    setContent(base + sep + transcript);
  }, [transcript, listening, dictating]);

  function handleDictate() {
    if (!supported) return;
    if (listening) {
      stop();
      setDictating(false);
      return;
    }
    dictationStartRef.current = content;
    reset();
    setDictating(true);
    start();
  }

  function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) {
      // empty → if editing existing, delete it; if new, just close
      if (existing) remove(existing.id);
      onClose();
      return;
    }
    if (existing) {
      update(existing.id, { content: trimmed });
    } else {
      add({ content: trimmed, tags: [], links: [] });
    }
    onClose();
  }

  function handleDelete() {
    if (existing) remove(existing.id);
    onClose();
  }

  const inlineTags = extractInlineTags(content);
  const open = target !== null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (listening) stop();
            handleSave();
          }}
        >
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-none bg-[var(--color-bg-elevated)] ghost-border transition-transform duration-200"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
              transform: keyboardOffset > 0 ? `translateY(-${keyboardOffset}px)` : undefined,
            }}
          >
            <div className="px-5 pt-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--color-text-muted)]">
                  {existing ? "Modifier la note" : "Nouvelle note"}
                </h2>
                <div className="flex items-center gap-2">
                  {existing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/30 active:scale-95"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (listening) stop();
                      onClose();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ghost-border active:scale-95"
                    aria-label="Fermer sans enregistrer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écris ou dicte ta note… #tag pour taguer"
                rows={7}
                autoFocus={!existing}
                className="w-full resize-none rounded-none bg-[var(--color-surface)] p-4 text-[15px] leading-relaxed text-[var(--color-text)] ghost-border placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-[var(--color-accent)]"
              />

              {inlineTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {inlineTags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[var(--color-accent)]/15 px-2.5 py-1 text-[11px] font-medium text-[var(--color-accent)]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {speechError && (
                <p className="mt-2 text-[11px] text-red-400">
                  Micro : {speechError}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDictate}
                  disabled={!supported}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-none py-3 text-sm font-semibold ring-1 transition active:scale-98",
                    !supported && "opacity-40",
                    listening
                      ? "bg-red-500/15 text-red-400 ring-red-500/40"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-[var(--color-border)]"
                  )}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  {!supported
                    ? "Dictée indisponible"
                    : listening
                      ? "Arrêter la dictée"
                      : "Dicter"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-none bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  <Check size={16} />
                  Enregistrer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// NoteEditorSheet is client-only; no unused exports needed.
export type { Note };
