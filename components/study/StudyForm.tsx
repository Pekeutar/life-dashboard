"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";
import StudyTopicPicker from "./StudyTopicPicker";
import { FOCUS_EMOJIS, FOCUS_LABELS } from "@/lib/study/constants";
import { useStudySessions } from "@/lib/study/store";
import { computeStudyXp } from "@/lib/study/xp";
import type { Focus, StudyTopic } from "@/lib/study/types";
import { useSpeechRecognition } from "@/lib/speech";
import { useQuests } from "@/lib/quests/store";
import { questsImpactedBy } from "@/lib/quests/tracker-info";
import { writeLastImpact } from "@/lib/quests/last-impact";
import { cn, formatDuration } from "@/lib/utils";

export default function StudyForm() {
  const router = useRouter();
  const { add } = useStudySessions();
  const { quests } = useQuests();

  const [topic, setTopic] = useState<StudyTopic>("programming");
  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [focus, setFocus] = useState<Focus>(3);
  const [notes, setNotes] = useState("");

  const speech = useSpeechRecognition({ lang: "fr-FR", continuous: true });

  // Merge speech transcript into notes field as user dictates.
  useEffect(() => {
    if (speech.listening && speech.transcript) {
      setNotes(speech.transcript);
    }
  }, [speech.transcript, speech.listening]);

  const xpPreview = computeStudyXp(durationMin, focus);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (speech.listening) speech.stop();
    add({
      date: new Date().toISOString(),
      topic,
      title: title.trim() || "Session",
      durationMin,
      focus,
      notes: notes.trim() || undefined,
    });
    const impacted = questsImpactedBy(quests, { pillar: "study", type: topic });
    writeLastImpact({
      pillar: "study",
      questTitles: impacted.map((q) => q.title),
    });
    router.push("/etude");
  }

  function toggleMic() {
    if (speech.listening) {
      speech.stop();
    } else {
      // Preserve manually-typed notes as the base transcript.
      if (notes && !speech.transcript) {
        speech.reset();
        // start with empty and append
      }
      speech.start();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-5 pb-8">
      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Sujet
        </label>
        <StudyTopicPicker value={topic} onChange={setTopic} />
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Titre de la session
        </label>
        <div className="flex items-center gap-2 rounded-none bg-[var(--color-surface)] px-4 py-3 ghost-border">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Python async, React 19, Stoïcisme…"
            className="w-full bg-transparent text-base outline-none placeholder:text-[var(--color-text-subtle)]"
          />
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Durée
          </label>
          <span className="text-lg font-semibold text-[var(--color-text)]">
            {formatDuration(durationMin)}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={240}
          step={5}
          value={durationMin}
          onChange={(e) => setDurationMin(parseInt(e.target.value, 10))}
          className="lv-slider lv-slider--level"
        />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--color-text-subtle)]">
          <span>5 min</span>
          <span>4 h</span>
        </div>
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Concentration · {FOCUS_LABELS[focus - 1]}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {FOCUS_EMOJIS.map((emoji, i) => {
            const n = (i + 1) as Focus;
            return (
              <motion.button
                type="button"
                key={emoji}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFocus(n)}
                className={cn(
                  "rounded-none py-3 text-2xl transition-colors",
                  focus === n
                    ? "bg-[var(--color-surface-2)] ring-2 ring-[var(--color-level)]"
                    : "bg-[var(--color-surface)] ghost-border opacity-60"
                )}
              >
                {emoji}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Notes · synthèse
          </label>
          {speech.supported && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={toggleMic}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                speech.listening
                  ? "bg-[var(--color-level)] text-white"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] ghost-border"
              )}
            >
              {speech.listening ? (
                <>
                  <Square size={12} fill="currentColor" />
                  Stop
                </>
              ) : (
                <>
                  <Mic size={12} />
                  Dicter
                </>
              )}
            </motion.button>
          )}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder={
            speech.supported
              ? "Tape ou appuie sur Dicter pour la voix…"
              : "Ce que tu retiens, tes idées clés…"
          }
          className="w-full resize-none rounded-none bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ghost-border placeholder:text-[var(--color-text-subtle)] focus:ring-[var(--color-level)]"
        />
        {speech.error && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
            <MicOff size={12} /> {speech.error}
          </p>
        )}
        {!speech.supported && (
          <p className="mt-1 text-[11px] text-[var(--color-text-subtle)]">
            Dictée vocale indisponible sur ce navigateur.
          </p>
        )}
      </section>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        className="mt-2 flex items-center justify-center gap-2 rounded-none bg-[var(--color-level)] py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20"
      >
        Enregistrer · +{xpPreview} XP
      </motion.button>
    </form>
  );
}
