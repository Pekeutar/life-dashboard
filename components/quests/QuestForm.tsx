"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  Check,
  Dumbbell,
  Hand,
  Infinity as InfinityIcon,
  Plus,
  Route,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { useQuests } from "@/lib/quests/store";
import { useSportMetas } from "@/lib/sport/meta";
import { useStudyMetas } from "@/lib/study/meta";
import type {
  NewQuestInput,
  QuestLink,
  QuestScope,
  QuestTracker,
} from "@/lib/quests/types";
import { cn, startOfWeek } from "@/lib/utils";

const QUEST_EMOJI_SUGGESTIONS = [
  "🎯", "🏆", "⚡", "🔥", "💪", "🏃",
  "🧠", "📚", "🌟", "👑", "🚀", "💎",
  "🥇", "🗡️", "🛡️", "🌈", "🎖️", "🔓",
];

const QUEST_COLORS = [
  "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#8b5cf6", "#a855f7", "#ec4899", "#ef4444",
];

type ScopeKind = "ongoing" | "week" | "deadline";
type TrackerKind = "manual" | "count" | "duration" | "distance";
type LinkKind = "free" | "sport" | "study";

interface Props {
  parentId?: string;
  /** Hérité d'une quête parente pour garder cohérence visuelle + rattachement. */
  presetFromParent?: {
    emoji: string;
    color: string;
    link: QuestLink;
  };
  onDone?: () => void;
}

export default function QuestForm({
  parentId,
  presetFromParent,
  onDone,
}: Props) {
  const router = useRouter();
  const { add } = useQuests();
  const { all: sportMetas } = useSportMetas();
  const { all: studyMetas } = useStudyMetas();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState(presetFromParent?.emoji ?? "🎯");
  const [color, setColor] = useState(presetFromParent?.color ?? "#a855f7");

  const [scopeKind, setScopeKind] = useState<ScopeKind>(
    parentId ? "week" : "ongoing"
  );
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  const [linkKind, setLinkKind] = useState<LinkKind>(
    presetFromParent?.link.kind ?? "sport"
  );
  const [sportMatiere, setSportMatiere] = useState<string>(
    presetFromParent?.link.kind === "sport"
      ? (presetFromParent.link.sportType ?? "")
      : ""
  );
  const [studyMatiere, setStudyMatiere] = useState<string>(
    presetFromParent?.link.kind === "study"
      ? (presetFromParent.link.studyTopic ?? "")
      : ""
  );

  const [trackerKind, setTrackerKind] = useState<TrackerKind>("count");
  const [targetCount, setTargetCount] = useState(3);
  const [targetMin, setTargetMin] = useState(60);
  const [targetKm, setTargetKm] = useState(10);
  const [xpReward, setXpReward] = useState(150);

  const weekStartIso = useMemo(
    () => startOfWeek(new Date()).toISOString(),
    []
  );

  // Distance n'a de sens qu'avec un rattachement sport.
  const effectiveLinkKind: LinkKind =
    trackerKind === "distance" ? "sport" : linkKind;
  const isFree = effectiveLinkKind === "free";
  const isAuto = trackerKind !== "manual";
  // Matière requise sur les auto-trackers rattachés à un pilier.
  const needsMatiere = isAuto && !isFree;
  const matiereMissing =
    needsMatiere &&
    ((effectiveLinkKind === "sport" && !sportMatiere) ||
      (effectiveLinkKind === "study" && !studyMatiere));
  // Free impose manuel.
  const trackerLocked = isFree && trackerKind !== "manual";

  function buildScope(): QuestScope {
    if (scopeKind === "week") return { kind: "week", weekStart: weekStartIso };
    if (scopeKind === "deadline")
      return { kind: "deadline", until: new Date(deadline).toISOString() };
    return { kind: "ongoing" };
  }

  function buildLink(): QuestLink {
    if (effectiveLinkKind === "free") return { kind: "free" };
    if (effectiveLinkKind === "sport") {
      return {
        kind: "sport",
        sportType: sportMatiere || undefined,
      };
    }
    return {
      kind: "study",
      studyTopic: studyMatiere || undefined,
    };
  }

  function buildTracker(): QuestTracker {
    const kind: TrackerKind = trackerLocked ? "manual" : trackerKind;
    if (kind === "manual") return { kind: "manual", done: false };
    if (kind === "count") return { kind: "count", target: targetCount };
    if (kind === "duration") return { kind: "duration", targetMin };
    return { kind: "distance", targetKm };
  }

  const canSubmit = title.trim().length > 0 && !matiereMissing;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const input: NewQuestInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      emoji,
      color,
      link: buildLink(),
      scope: buildScope(),
      tracker: buildTracker(),
      xpReward,
      parentId,
    };
    add(input);
    if (onDone) onDone();
    else router.push("/quetes");
  }

  const accent = color;
  const linkSummary = summarizeLink(
    effectiveLinkKind,
    sportMatiere,
    studyMatiere,
    sportMetas,
    studyMetas
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-5 pb-8">
      {/* Preview */}
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${color}22` }}
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-text)]">
            {title || (parentId ? "Nouvelle étape" : "Nouvelle quête")}
          </p>
          <p className="truncate text-[11px]" style={{ color }}>
            {linkSummary} · +{xpReward} XP
          </p>
        </div>
      </div>

      {/* Titre */}
      <section>
        <Label>Titre</Label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={parentId ? "Ex: Courir 10 km lundi" : "Ex: Courir 3× cette semaine"}
          maxLength={64}
          className="w-full rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-base outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
          style={{ caretColor: accent }}
        />
      </section>

      {/* Motivation */}
      <section>
        <Label>Motivation (optionnel)</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pourquoi cette quête te tient à cœur ?"
          rows={2}
          className="w-full resize-none rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
          style={{ caretColor: accent }}
        />
      </section>

      {/* Rattachement */}
      <section>
        <Label>Rattachement</Label>
        <p className="-mt-1 mb-2 text-[11px] text-[var(--color-text-subtle)]">
          Une quête auto n&apos;avance que pour la matière choisie.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <LinkPill
            active={effectiveLinkKind === "sport"}
            onClick={() => setLinkKind("sport")}
            icon={<Dumbbell size={16} />}
            label="Sport"
            accent={accent}
          />
          <LinkPill
            active={effectiveLinkKind === "study"}
            onClick={() => {
              if (trackerKind === "distance") setTrackerKind("count");
              setLinkKind("study");
            }}
            icon={<BookOpen size={16} />}
            label="Étude"
            accent={accent}
          />
          <LinkPill
            active={effectiveLinkKind === "free"}
            disabled={trackerKind === "distance"}
            onClick={() => {
              if (trackerKind === "distance") return;
              setLinkKind("free");
            }}
            icon={<Sparkles size={16} />}
            label="Libre"
            accent={accent}
          />
        </div>

        {effectiveLinkKind === "sport" && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              Matière {needsMatiere ? "(requise pour l'auto-tracking)" : "(optionnel en manuel)"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {!needsMatiere && (
                <FilterChip
                  active={sportMatiere === ""}
                  onClick={() => setSportMatiere("")}
                  label="Aucune"
                  accent={accent}
                />
              )}
              {sportMetas.map((s) => (
                <FilterChip
                  key={s.id}
                  active={sportMatiere === s.id}
                  onClick={() => setSportMatiere(s.id)}
                  label={`${s.emoji} ${s.label}`}
                  accent={s.color}
                />
              ))}
            </div>
          </div>
        )}

        {effectiveLinkKind === "study" && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              Matière {needsMatiere ? "(requise pour l'auto-tracking)" : "(optionnel en manuel)"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {!needsMatiere && (
                <FilterChip
                  active={studyMatiere === ""}
                  onClick={() => setStudyMatiere("")}
                  label="Aucune"
                  accent={accent}
                />
              )}
              {studyMetas.map((s) => (
                <FilterChip
                  key={s.id}
                  active={studyMatiere === s.id}
                  onClick={() => setStudyMatiere(s.id)}
                  label={`${s.emoji} ${s.label}`}
                  accent={s.color}
                />
              ))}
            </div>
          </div>
        )}

        {effectiveLinkKind === "free" && (
          <p className="mt-2 rounded-xl bg-[var(--color-surface)]/60 px-3 py-2 text-[11px] text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)]">
            Quête transverse : validation uniquement manuelle.
          </p>
        )}
      </section>

      {/* Validation */}
      <section>
        <Label>Comment la valider ?</Label>
        <div className="grid grid-cols-2 gap-2">
          <TrackerPill
            active={trackerKind === "manual"}
            onClick={() => setTrackerKind("manual")}
            icon={<Hand size={16} />}
            label="Manuel"
            hint="Je coche à la main"
            accent={accent}
          />
          <TrackerPill
            active={trackerKind === "count" && !trackerLocked}
            disabled={isFree}
            onClick={() => !isFree && setTrackerKind("count")}
            icon={<Check size={16} />}
            label="Nb de séances"
            hint={isFree ? "Rattache la quête" : "ex: 3 sessions"}
            accent={accent}
          />
          <TrackerPill
            active={trackerKind === "duration" && !trackerLocked}
            disabled={isFree}
            onClick={() => !isFree && setTrackerKind("duration")}
            icon={<Timer size={16} />}
            label="Durée"
            hint={isFree ? "Rattache la quête" : "ex: 2 h cumulées"}
            accent={accent}
          />
          <TrackerPill
            active={trackerKind === "distance" && !trackerLocked}
            disabled={effectiveLinkKind !== "sport" && !isFree}
            onClick={() => {
              setLinkKind("sport");
              setTrackerKind("distance");
            }}
            icon={<Route size={16} />}
            label="Distance"
            hint="Sport uniquement"
            accent={accent}
          />
        </div>

        {matiereMissing && (
          <p className="mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/30">
            Choisis une matière pour activer l&apos;auto-tracking.
          </p>
        )}
      </section>

      {/* Durée (scope) */}
      <section>
        <Label>Durée de la quête</Label>
        <div className="grid grid-cols-3 gap-2">
          <ScopePill
            active={scopeKind === "ongoing"}
            onClick={() => setScopeKind("ongoing")}
            icon={<InfinityIcon size={16} />}
            label="Long terme"
            accent={accent}
          />
          <ScopePill
            active={scopeKind === "week"}
            onClick={() => setScopeKind("week")}
            icon={<CalendarCheck size={16} />}
            label="Cette semaine"
            accent={accent}
          />
          <ScopePill
            active={scopeKind === "deadline"}
            onClick={() => setScopeKind("deadline")}
            icon={<Target size={16} />}
            label="Deadline"
            accent={accent}
          />
        </div>
        {scopeKind === "deadline" && (
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-sm outline-none ring-1 ring-[var(--color-border)]"
            style={{ colorScheme: "dark", caretColor: accent }}
          />
        )}
      </section>

      {/* Objectif */}
      {!trackerLocked && trackerKind !== "manual" && (
        <section>
          <Label>Objectif</Label>
          {trackerKind === "count" && (
            <NumberRow
              value={targetCount}
              onChange={setTargetCount}
              min={1}
              max={50}
              step={1}
              unit="fois"
              accent={accent}
            />
          )}
          {trackerKind === "duration" && (
            <NumberRow
              value={targetMin}
              onChange={setTargetMin}
              min={10}
              max={600}
              step={10}
              unit="min"
              accent={accent}
            />
          )}
          {trackerKind === "distance" && (
            <NumberRow
              value={targetKm}
              onChange={setTargetKm}
              min={1}
              max={200}
              step={1}
              unit="km"
              accent={accent}
            />
          )}
        </section>
      )}

      {/* Emoji */}
      <section>
        <Label>Emoji</Label>
        <div className="flex flex-wrap gap-1.5">
          {QUEST_EMOJI_SUGGESTIONS.map((e) => {
            const active = emoji === e;
            return (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface)] text-xl ring-1 ring-[var(--color-border)] transition active:scale-95"
                style={
                  active
                    ? {
                        background: `${accent}22`,
                        boxShadow: `inset 0 0 0 2px ${accent}`,
                      }
                    : undefined
                }
              >
                {e}
              </button>
            );
          })}
        </div>
      </section>

      {/* Couleur */}
      <section>
        <Label>Couleur</Label>
        <div className="flex flex-wrap gap-2">
          {QUEST_COLORS.map((c) => {
            const active = color === c;
            return (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="h-9 w-9 rounded-full transition active:scale-95"
                style={{
                  background: c,
                  boxShadow: active
                    ? `0 0 0 2px var(--color-bg), 0 0 0 4px ${c}`
                    : "none",
                }}
                aria-label={c}
              />
            );
          })}
        </div>
      </section>

      {/* XP */}
      <section>
        <Label>Récompense XP</Label>
        <NumberRow
          value={xpReward}
          onChange={setXpReward}
          min={25}
          max={2000}
          step={25}
          unit="XP"
          accent={accent}
        />
      </section>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={!canSubmit}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        style={{
          background: accent,
          boxShadow: `0 14px 40px -14px ${accent}`,
        }}
      >
        <Plus size={18} /> {parentId ? "Ajouter l'étape" : "Créer la quête"}
      </motion.button>
    </form>
  );
}

function summarizeLink(
  kind: LinkKind,
  sportMatiere: string,
  studyMatiere: string,
  sportMetas: ReadonlyArray<{ id: string; label: string; emoji: string }>,
  studyMetas: ReadonlyArray<{ id: string; label: string; emoji: string }>
): string {
  if (kind === "free") return "Libre";
  if (kind === "sport") {
    if (!sportMatiere) return "Sport · matière à choisir";
    const m = sportMetas.find((x) => x.id === sportMatiere);
    return m ? `Sport · ${m.label}` : "Sport";
  }
  if (!studyMatiere) return "Étude · matière à choisir";
  const m = studyMetas.find((x) => x.id === studyMatiere);
  return m ? `Étude · ${m.label}` : "Étude";
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
      {children}
    </label>
  );
}

interface PillProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  accent: string;
  disabled?: boolean;
}

function ScopePill({ active, onClick, icon, label, accent }: PillProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl px-2 py-3 transition",
        active
          ? "bg-[var(--color-surface-2)]"
          : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]"
      )}
      style={active ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
    >
      <span style={{ color: active ? accent : "var(--color-text-muted)" }}>
        {icon}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
    </motion.button>
  );
}

function TrackerPill({
  active,
  onClick,
  icon,
  label,
  hint,
  accent,
  disabled,
}: PillProps) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
        active
          ? "bg-[var(--color-surface-2)]"
          : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]",
        disabled && "opacity-40"
      )}
      style={active ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: active ? `${accent}22` : "var(--color-surface-2)",
          color: active ? accent : "var(--color-text-muted)",
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold text-[var(--color-text)]">
          {label}
        </p>
        {hint && (
          <p className="truncate text-[10px] text-[var(--color-text-subtle)]">
            {hint}
          </p>
        )}
      </div>
    </motion.button>
  );
}

function LinkPill({
  active,
  onClick,
  icon,
  label,
  accent,
  disabled,
}: PillProps) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-semibold transition",
        active
          ? "bg-[var(--color-surface-2)]"
          : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]",
        disabled && "opacity-40"
      )}
      style={active ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
    >
      <span style={{ color: active ? accent : "var(--color-text-muted)" }}>
        {icon}
      </span>
      <span className="text-[var(--color-text-muted)]">{label}</span>
    </motion.button>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition active:scale-95",
        active
          ? "text-white"
          : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-[var(--color-border)]"
      )}
      style={
        active
          ? { background: accent, boxShadow: `0 0 0 1px ${accent}` }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function NumberRow({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  accent,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-4 py-3 ring-1 ring-[var(--color-border)]">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-lg text-[var(--color-text-muted)] active:scale-90"
      >
        −
      </button>
      <div className="flex-1 text-center">
        <span className="text-2xl font-bold" style={{ color: accent }}>
          {value}
        </span>
        <span className="ml-1 text-sm text-[var(--color-text-muted)]">
          {unit}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-lg text-[var(--color-text-muted)] active:scale-90"
      >
        +
      </button>
    </div>
  );
}
