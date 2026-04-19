"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  FileText,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { useSpeechRecognition } from "@/lib/speech";
import { useAgentContext, contextToPromptString } from "@/lib/agents/context";

type InputMode = "text" | "file" | "vocal";
type Difficulty = "beginner" | "intermediate" | "expert";
type Focus = "memorize" | "understand" | "apply";
type CardCount = "few" | "normal" | "many";

interface GeneratedCard {
  front: string;
  back: string;
  selected: boolean;
}

interface Props {
  open: boolean;
  deckColor: string;
  onClose: () => void;
  onImport: (cards: { front: string; back: string }[]) => void;
}

export default function GenerateSheet({
  open,
  deckColor,
  onClose,
  onImport,
}: Props) {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [focus, setFocus] = useState<Focus>("understand");
  const [cardCount, setCardCount] = useState<CardCount>("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedCard[] | null>(null);
  const [chunksProcessed, setChunksProcessed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speech = useSpeechRecognition({ lang: "fr-FR" });
  const agentCtx = useAgentContext();
  const userProfile = agentCtx ? contextToPromptString(agentCtx) : undefined;

  useEffect(() => {
    if (open) {
      setText("");
      setContext("");
      setFileName(null);
      setFile(null);
      setError(null);
      setGenerated(null);
      setChunksProcessed(0);
      setLoading(false);
      speech.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setFileName(f.name);
      setFile(f);
    },
    []
  );

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      let res: Response;
      const opts = { difficulty, focus, cardCount };
      const ctx = context.trim();

      if (mode === "text") {
        if (!text.trim()) {
          setError("Colle ou écris du texte d'abord.");
          setLoading(false);
          return;
        }
        const combined = ctx
          ? `${text.trim()}\n\n---\nInstructions supplémentaires : ${ctx}`
          : text.trim();
        res = await fetch("/api/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: combined, ...opts, userProfile }),
        });
      } else if (mode === "file") {
        if (!file) {
          setError("Sélectionne un fichier d'abord.");
          setLoading(false);
          return;
        }
        const fd = new FormData();
        fd.append("file", file);
        if (ctx) fd.append("text", ctx);
        fd.append("difficulty", difficulty);
        fd.append("focus", focus);
        fd.append("cardCount", cardCount);
        if (userProfile) fd.append("userProfile", userProfile);
        res = await fetch("/api/generate-flashcards", {
          method: "POST",
          body: fd,
        });
      } else {
        // vocal
        const vocalText = speech.transcript.trim();
        if (!vocalText) {
          setError("Dicte du contenu d'abord.");
          setLoading(false);
          return;
        }
        const combined = ctx
          ? `${vocalText}\n\n---\nInstructions supplémentaires : ${ctx}`
          : vocalText;
        res = await fetch("/api/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: combined, ...opts, userProfile }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur serveur");
        setLoading(false);
        return;
      }

      const cards: GeneratedCard[] = (
        data.cards as { front: string; back: string }[]
      ).map((c) => ({ ...c, selected: true }));

      if (data.chunks && data.chunks > 1) {
        setChunksProcessed(data.chunks as number);
      }

      setGenerated(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  function toggleCard(i: number) {
    setGenerated((prev) =>
      prev
        ? prev.map((c, idx) =>
            idx === i ? { ...c, selected: !c.selected } : c
          )
        : prev
    );
  }

  function handleImport() {
    if (!generated) return;
    const selected = generated
      .filter((c) => c.selected)
      .map(({ front, back }) => ({ front, back }));
    if (selected.length === 0) return;
    onImport(selected);
    onClose();
  }

  const selectedCount = generated?.filter((c) => c.selected).length ?? 0;

  const MODES: { value: InputMode; icon: React.ReactNode; label: string }[] = [
    { value: "text", icon: <Type size={16} />, label: "Texte" },
    { value: "file", icon: <FileText size={16} />, label: "Document" },
    { value: "vocal", icon: <Mic size={16} />, label: "Vocal" },
  ];

  const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
    { value: "beginner", label: "Débutant", hint: "Questions simples" },
    { value: "intermediate", label: "Inter.", hint: "Relier les concepts" },
    { value: "expert", label: "Expert", hint: "Compréhension profonde" },
  ];

  const FOCUSES: { value: Focus; label: string; hint: string }[] = [
    { value: "memorize", label: "Mémoriser", hint: "Faits & définitions" },
    { value: "understand", label: "Comprendre", hint: "Pourquoi & comment" },
    { value: "apply", label: "Appliquer", hint: "Cas pratiques" },
  ];

  const COUNTS: { value: CardCount; label: string }[] = [
    { value: "few", label: "Peu (5-8)" },
    { value: "normal", label: "Normal (8-15)" },
    { value: "many", label: "Beaucoup (15-25)" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[94vh] w-full max-w-md overflow-y-auto rounded-none bg-[var(--color-bg-elevated)] ghost-border"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
          >
            <div className="px-6 pt-4">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-surface-2)]" />

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Sparkles size={18} style={{ color: deckColor }} />
                    Générer avec l&apos;IA
                  </h2>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    Crée des flashcards automatiquement
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] ghost-border active:scale-95"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* === STEP 1: Input === */}
              {!generated && (
                <>
                  {/* Mode selector */}
                  <div className="mb-5 grid grid-cols-3 gap-2">
                    {MODES.map((m) => {
                      const active = mode === m.value;
                      return (
                        <button
                          type="button"
                          key={m.value}
                          onClick={() => setMode(m.value)}
                          className="flex flex-col items-center gap-1 rounded-none bg-[var(--color-surface)] py-3 text-xs font-semibold ghost-border transition active:scale-95"
                          style={
                            active
                              ? {
                                  background: `${deckColor}1a`,
                                  boxShadow: `inset 0 0 0 2px ${deckColor}`,
                                  color: deckColor,
                                }
                              : undefined
                          }
                        >
                          {m.icon}
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Options */}
                  <div className="mb-4 rounded-none bg-[var(--color-surface)] p-3 ghost-border">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                      Niveau
                    </p>
                    <div className="mb-3 grid grid-cols-3 gap-1.5">
                      {DIFFICULTIES.map((d) => (
                        <OptionChip
                          key={d.value}
                          active={difficulty === d.value}
                          label={d.label}
                          hint={d.hint}
                          color={deckColor}
                          onClick={() => setDifficulty(d.value)}
                        />
                      ))}
                    </div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                      Objectif
                    </p>
                    <div className="mb-3 grid grid-cols-3 gap-1.5">
                      {FOCUSES.map((f) => (
                        <OptionChip
                          key={f.value}
                          active={focus === f.value}
                          label={f.label}
                          hint={f.hint}
                          color={deckColor}
                          onClick={() => setFocus(f.value)}
                        />
                      ))}
                    </div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                      Quantité
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {COUNTS.map((c) => (
                        <OptionChip
                          key={c.value}
                          active={cardCount === c.value}
                          label={c.label}
                          color={deckColor}
                          onClick={() => setCardCount(c.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text input */}
                  {mode === "text" && (
                    <>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                        Colle tes notes / cours
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Colle ici le contenu de ton cours, tes notes, un article…"
                        rows={6}
                        className="mb-4 w-full resize-none rounded-none bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ghost-border placeholder:text-[var(--color-text-subtle)]"
                        style={{ caretColor: deckColor }}
                      />
                    </>
                  )}

                  {/* File input */}
                  {mode === "file" && (
                    <div className="mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.md,.doc,.docx"
                        onChange={handleFile}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-2 rounded-none border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-8 text-sm text-[var(--color-text-subtle)] transition active:scale-[0.99]"
                      >
                        <Upload size={24} />
                        {fileName ? (
                          <span className="font-semibold text-[var(--color-text)]">
                            {fileName}
                          </span>
                        ) : (
                          <>
                            <span>Sélectionne un fichier</span>
                            <span className="text-[10px]">
                              PDF, TXT, Markdown
                            </span>
                          </>
                        )}
                      </button>

                    </div>
                  )}

                  {/* Vocal input */}
                  {mode === "vocal" && (
                    <div className="mb-4 flex flex-col items-center gap-3">
                      {!speech.supported ? (
                        <p className="rounded-none bg-[var(--color-surface)] p-4 text-center text-sm text-[var(--color-text-muted)] ghost-border">
                          La dictée vocale n&apos;est pas supportée par ce
                          navigateur. Utilise Safari ou Chrome.
                        </p>
                      ) : (
                        <>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={
                              speech.listening ? speech.stop : speech.start
                            }
                            className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg"
                            style={{
                              background: speech.listening
                                ? "#6a0a0a"
                                : deckColor,
                              boxShadow: speech.listening
                                ? "0 0 0 6px rgba(106, 10, 10,0.25)"
                                : `0 0 0 6px ${deckColor}33`,
                            }}
                          >
                            {speech.listening ? (
                              <MicOff size={28} />
                            ) : (
                              <Mic size={28} />
                            )}
                          </motion.button>
                          <p className="text-xs text-[var(--color-text-subtle)]">
                            {speech.listening
                              ? "Écoute en cours… Tape pour arrêter."
                              : "Tape pour dicter ton cours"}
                          </p>
                          {speech.transcript && (
                            <div className="w-full rounded-none bg-[var(--color-surface)] px-4 py-3 text-sm ghost-border">
                              <p className="mb-1 text-[10px] font-semibold uppercase text-[var(--color-text-subtle)]">
                                Transcription
                              </p>
                              <p className="whitespace-pre-wrap text-[var(--color-text)]">
                                {speech.transcript}
                              </p>
                            </div>
                          )}
                          {speech.error && (
                            <p className="text-xs text-red-400">
                              {speech.error}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Context field — all modes */}
                  <div className="mb-4">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                      Instructions supplémentaires (optionnel)
                    </label>
                    <input
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Ex: Concentre-toi sur le chapitre 3, fais des questions en anglais…"
                      maxLength={200}
                      className="w-full rounded-none bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ghost-border placeholder:text-[var(--color-text-subtle)]"
                      style={{ caretColor: deckColor }}
                    />
                  </div>

                  {error && (
                    <p className="mb-3 rounded-none bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400">
                      {error}
                    </p>
                  )}

                  {loading && (
                    <div className="mb-3 rounded-none bg-[var(--color-surface)] px-4 py-3 ghost-border">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {mode === "file" && file
                          ? "Les gros documents sont découpés automatiquement. Cela peut prendre 1-2 min par section."
                          : "Analyse du contenu en cours…"}
                      </p>
                    </div>
                  )}

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    onClick={handleGenerate}
                    className="flex w-full items-center justify-center gap-2 rounded-none py-4 text-base font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: deckColor,
                      boxShadow: `0 14px 40px -14px ${deckColor}`,
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Génération en cours…
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Générer les flashcards
                      </>
                    )}
                  </motion.button>
                </>
              )}

              {/* === STEP 2: Preview & select === */}
              {generated && (
                <>
                  <p className="mb-1 text-sm font-semibold">
                    {generated.length} carte{generated.length > 1 ? "s" : ""}{" "}
                    générée{generated.length > 1 ? "s" : ""}
                  </p>
                  {chunksProcessed > 1 && (
                    <p className="mb-3 text-[11px] text-[var(--color-text-subtle)]">
                      Document traité en {chunksProcessed} parties
                    </p>
                  )}

                  <div className="mb-4 flex flex-col gap-2">
                    {generated.map((card, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggleCard(i)}
                        className="flex items-start gap-3 rounded-none bg-[var(--color-surface)] p-3 text-left ghost-border transition active:scale-[0.99]"
                        style={
                          card.selected
                            ? {
                                boxShadow: `inset 0 0 0 2px ${deckColor}`,
                              }
                            : { opacity: 0.5 }
                        }
                      >
                        <div
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none"
                          style={{
                            background: card.selected
                              ? deckColor
                              : "transparent",
                            border: card.selected
                              ? "none"
                              : "2px solid var(--color-border)",
                          }}
                        >
                          {card.selected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug">
                            {card.front}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {card.back}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGenerated(null)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-none bg-[var(--color-surface)] py-3.5 text-sm font-semibold ghost-border"
                    >
                      Recommencer
                    </button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      disabled={selectedCount === 0}
                      onClick={handleImport}
                      className="flex flex-1 items-center justify-center gap-2 rounded-none py-3.5 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        background: deckColor,
                        boxShadow: `0 12px 32px -14px ${deckColor}`,
                      }}
                    >
                      <Plus size={16} />
                      Ajouter {selectedCount}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OptionChip({
  active,
  label,
  hint,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  hint?: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 rounded-none px-2 py-2 text-center transition active:scale-95"
      style={
        active
          ? {
              background: `${color}1a`,
              boxShadow: `inset 0 0 0 1.5px ${color}`,
              color,
            }
          : {
              background: "var(--color-surface-2)",
            }
      }
    >
      <span className="text-[11px] font-semibold">{label}</span>
      {hint && (
        <span
          className="text-[9px]"
          style={{
            color: active ? color : "var(--color-text-subtle)",
            opacity: active ? 0.8 : 1,
          }}
        >
          {hint}
        </span>
      )}
    </button>
  );
}
