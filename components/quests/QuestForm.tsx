"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  Dumbbell,
  Infinity as InfinityIcon,
  MapPin,
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
  QuestPillar,
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

interface Props {
  parentId?: string;
  /** Pre-fill the form from a parent quest (inherits emoji/color/pillar). */
  presetFromParent?: {
    emoji: string;
    color: string;
    pillar: QuestPillar;
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

  const [trackerKind, setTrackerKind] = useState<TrackerKind>("count");
  const [pillar, setPillar] = useState<QuestPillar>(
    presetFromParent?.pillar ?? "sport"
  );
  const [targetCount, setTargetCount] = useState(3);
  const [targetMin, setTargetMin] = useState(60);
  const [targetKm, setTargetKm] = useState(10);
  const [sportFilter, setSportFilter] = useState<string>("");
  const [studyFilter, setStudyFilter] = useState<string>("");
  const [xpReward, setXpReward] = useState(150);

  const weekStartIso = useMemo(
    () => startOfWeek(new Date()).toISOString(),
    []
  );

  function buildScope(): QuestScope {
    if (scopeKind === "week") return { kind: "week", weekStart: weekStartIso };
    if (scopeKind === "deadline")
      return { kind: "deadline", until: new Date(deadline).toISOString() };
    return { kind: "ongoing" };
  }

  function buildTracker(): QuestTracker {
    if (trackerKind === "manual") return { kind: "manual", done: false };
    if (trackerKind === "count") {
      return {
        kind: "count",
        pillar,
        target: targetCount,
        filter:
          pillar === "sport" && sportFilter
            ? { sportType: sportFilter }
            : pillar === "study" && studyFilter
              ? { studyTopic: studyFilter }
              : undefined,
      };
    }
    if (trackerKind === "duration") {
      return {
        kind: "duration",
        pillar,
        targetMin,
        filter:
          pillar === "sport" && sportFilter
            ? { sportType: sportFilter }
            : pillar === "study" && studyFilter
              ? { studyTopic: studyFilter }
              : undefined,
      };
    }
    // distance (sport only)
    return {
      kind: "distance",
      targetKm,
      filter: sportFilter ? { sportType: sportFilter } : undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const effectivePillar: QuestPillar =
      trackerKind === "distance" ? "sport" : pillar;
    const input: NewQuestInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      emoji,
      color,
      pillar: effectivePillar,
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
          <p className="text-[11px]" style={{ color }}>
            +{xpReward} XP à la clé
          </p>
        </div>
      </div>

      {/* Title */}
      <section>
        <Label>Titre</Label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={parentId ? "Ex: Courir lundi 10 km" : "Ex: Courir 3× cette semaine"}
          maxLength={64}
          className="w-full rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-base outline-none ring-1 ring-[var(--color-border)] placeholder:text-[var(--color-text-subtle)]"
          style={{ caretColor: accent }}
        />
      </section>

      {/* Description */}
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

      {/* Scope */}
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

      {/* Tracker kind */}
      <section>
        <Label>Comment la valider ?</Label>
        <div className="grid grid-cols-2 gap-2">
          <TrackerPill
            active={trackerKind === "count"}
            onClick={() => setTrackerKind("count")}
            icon={<Sparkles size={16} />}
            label="Nb de séances"
            hint="ex: 3 runs"
            accent={accent}
          />
          <TrackerPill
            active={trackerKind === "duration"}
            onClick={() => setTrackerKind("duration")}
            icon={<Timer size={16} />}
            label="Durée"
            hint="ex: 2h de sport"
            accent={accent}
          />
          <TrackerPill
            active={trackerKind === "distance"}
            onClick={() => setTrackerKind("distance")}
            icon={<Route size={16} />}
            label="Distance"
            hint="ex: 20 km"
            accent={accent}
          />
          <TrackerPill
            active={trackerKind === "manual"}
            onClick={() => setTrackerKind("manual")}
            icon={<MapPin size={16} />}
            label="Manuel"
            hint="Je coche à la main"
            accent={accent}
          />
        </div>
      </section>

      {/* Pillar (hidden for manual/distance) */}
      {(trackerKind === "count" || trackerKind === "duration") && (
        <section>
          <Label>Pilier concerné</Label>
          <div className="grid grid-cols-3 gap-2">
            <PillarPill
              active={pillar === "sport"}
              onClick={() => setPillar("sport")}
              icon={<Dumbbell size={14} />}
              label="Sport"
              accent={accent}
            />
            <PillarPill
              active={pillar === "study"}
              onClick={() => setPillar("study")}
              icon={<BookOpen size={14} />}
              label="Étude"
              accent={accent}
            />
            <PillarPill
              active={pillar === "any"}
              onClick={() => setPillar("any")}
              icon={<Sparkles size={14} />}
              label="Les 2"
              accent={accent}
            />
          </div>
        </section>
      )}

      {/* Filter (sport) */}
      {(trackerKind === "distance" ||
        ((trackerKind === "count" || trackerKind === "duration") &&
          pillar === "sport")) && (
        <section>
          <Label>Sport spécifique (optionnel)</Label>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={sportFilter === ""}
              onClick={() => setSportFilter("")}
              label="Tous"
              accent={accent}
            />
            {sportMetas.map((s) => (
              <FilterChip
                key={s.id}
                active={sportFilter === s.id}
                onClick={() => setSportFilter(s.id)}
                label={`${s.emoji} ${s.label}`}
                accent={s.color}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filter (study) */}
      {(trackerKind === "count" || trackerKind === "duration") &&
        pillar === "study" && (
          <section>
            <Label>Matière spécifique (optionnel)</Label>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                active={studyFilter === ""}
                onClick={() => setStudyFilter("")}
                label="Toutes"
                accent={accent}
              />
              {studyMetas.map((s) => (
                <FilterChip
                  key={s.id}
                  active={studyFilter === s.id}
                  onClick={() => setStudyFilter(s.id)}
                  label={`${s.emoji} ${s.label}`}
                  accent={s.color}
                />
              ))}
            </div>
          </section>
        )}

      {/* Target value */}
      {trackerKind !== "manual" && (
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

      {/* Color */}
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

      {/* XP Reward */}
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
        disabled={!title.trim()}
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

function TrackerPill({ active, onClick, icon, label, hint, accent }: PillProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
        active
          ? "bg-[var(--color-surface-2)]"
          : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]"
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

function PillarPill({ active, onClick, icon, label, accent }: PillProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-semibold transition",
        active
          ? "bg-[var(--color-surface-2)]"
          : "bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]"
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
