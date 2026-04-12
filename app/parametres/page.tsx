"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Moon,
  Sun,
  Monitor,
  Dumbbell,
  BookOpen,
  Timer,
  UtensilsCrossed,
  X,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useSettings } from "@/lib/settings/store";
import {
  ACCENT_COLORS,
  type AccentColor,
  type ThemeMode,
  type DietType,
  type FoodGoal,
} from "@/lib/settings/types";
import { DIET_TYPES, FOOD_GOALS } from "@/lib/food/types";
import { cn } from "@/lib/utils";

const THEMES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Sombre", icon: <Moon size={16} /> },
  { value: "light", label: "Clair", icon: <Sun size={16} /> },
  { value: "auto", label: "Auto", icon: <Monitor size={16} /> },
];

const COMMON_ALLERGIES = [
  "Gluten",
  "Lactose",
  "Arachides",
  "Fruits à coque",
  "Oeufs",
  "Soja",
  "Crustacés",
  "Poisson",
];

export default function SettingsPage() {
  const { settings, update, updateGoals, updateFood, hydrated } = useSettings();
  const [saved, setSaved] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Paramètres" subtitle="Personnalise ton app" backHref="/" />
        <div className="px-5">
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
        </div>
      </>
    );
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function addAllergy(name: string) {
    const trimmed = name.trim();
    if (!trimmed || settings.food.allergies.includes(trimmed)) return;
    updateFood({ allergies: [...settings.food.allergies, trimmed] });
    setAllergyInput("");
    flash();
  }

  function removeAllergy(name: string) {
    updateFood({
      allergies: settings.food.allergies.filter((a) => a !== name),
    });
    flash();
  }

  return (
    <>
      <PageHeader title="Paramètres" subtitle="Personnalise ton app" backHref="/" />

      <div className="flex flex-col gap-5 px-5 pb-6">
        {/* ── Profil ── */}
        <Section title="Profil">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-subtle)]">
              Prénom
            </span>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => {
                update({ name: e.target.value });
                flash();
              }}
              placeholder="Comment tu t'appelles ?"
              className="w-full rounded-xl bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)] outline-none focus:ring-[var(--color-accent)]"
            />
          </label>
        </Section>

        {/* ── Apparence ── */}
        <Section title="Apparence">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-subtle)]">
              Thème
            </span>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[var(--color-surface-2)] p-1.5 ring-1 ring-[var(--color-border)]">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    update({ theme: t.value });
                    flash();
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition",
                    settings.theme === t.value
                      ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                      : "text-[var(--color-text-subtle)]"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-text-subtle)]">
              Le thème clair arrivera bientôt — seul le sombre est actif pour le moment.
            </p>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-subtle)]">
              Couleur d&apos;accent
            </span>
            <div className="flex gap-2.5">
              {(Object.entries(ACCENT_COLORS) as [AccentColor, { label: string; hex: string }][]).map(
                ([key, { label, hex }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      update({ accent: key });
                      flash();
                    }}
                    className="group flex flex-col items-center gap-1"
                    aria-label={label}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition",
                        settings.accent === key && "ring-2 ring-offset-2 ring-offset-[var(--color-bg)]"
                      )}
                      style={{
                        background: hex,
                        ...(settings.accent === key ? { ringColor: hex } : {}),
                      }}
                    >
                      {settings.accent === key && (
                        <Check size={16} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-[9px] text-[var(--color-text-subtle)]">
                      {label}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </Section>

        {/* ── Objectifs hebdo ── */}
        <Section title="Objectifs hebdomadaires">
          <GoalRow
            icon={<Dumbbell size={16} />}
            label="Séances sport"
            value={settings.weeklyGoals.sportSessions}
            unit="/ semaine"
            min={1}
            max={14}
            onChange={(v) => {
              updateGoals({ sportSessions: v });
              flash();
            }}
          />
          <GoalRow
            icon={<BookOpen size={16} />}
            label="Sessions étude"
            value={settings.weeklyGoals.studySessions}
            unit="/ semaine"
            min={1}
            max={14}
            onChange={(v) => {
              updateGoals({ studySessions: v });
              flash();
            }}
          />
          <GoalRow
            icon={<Timer size={16} />}
            label="Minutes étude"
            value={settings.weeklyGoals.studyMinutes}
            unit="min / semaine"
            min={30}
            max={1200}
            step={30}
            onChange={(v) => {
              updateGoals({ studyMinutes: v });
              flash();
            }}
          />
        </Section>

        {/* ── Food ── */}
        <Section title="Alimentation">
          {/* Diet */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-subtle)]">
              Régime alimentaire
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.entries(DIET_TYPES) as [DietType, { label: string; emoji: string }][]).map(
                ([key, { label, emoji }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      updateFood({ diet: key });
                      flash();
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition ring-1",
                      settings.food.diet === key
                        ? "bg-[var(--color-accent)]/15 text-[var(--color-text)] ring-[var(--color-accent)]"
                        : "bg-[var(--color-surface-2)] text-[var(--color-text-subtle)] ring-[var(--color-border)]"
                    )}
                  >
                    <span>{emoji}</span>
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Allergies */}
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-subtle)]">
              Allergies / intolérances
            </span>
            {settings.food.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {settings.food.allergies.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1 rounded-full bg-[var(--color-danger)]/15 px-2.5 py-1 text-[11px] font-medium text-[var(--color-danger)]"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => removeAllergy(a)}
                      className="ml-0.5 active:scale-90"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGIES.filter(
                (a) => !settings.food.allergies.includes(a)
              ).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => addAllergy(a)}
                  className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-[11px] text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)] active:scale-95"
                >
                  + {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAllergy(allergyInput);
                  }
                }}
                placeholder="Autre allergie..."
                className="flex-1 rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)] outline-none focus:ring-[var(--color-accent)]"
              />
              <button
                type="button"
                onClick={() => addAllergy(allergyInput)}
                className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-xs font-semibold text-[var(--color-text-subtle)] ring-1 ring-[var(--color-border)] active:scale-95"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Servings */}
          <div className="mt-3">
            <GoalRow
              icon={<UtensilsCrossed size={16} />}
              label="Portions par défaut"
              value={settings.food.defaultServings}
              unit="pers."
              min={1}
              max={10}
              onChange={(v) => {
                updateFood({ defaultServings: v });
                flash();
              }}
            />
          </div>

          {/* Goal */}
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-subtle)]">
              Objectif nutritionnel
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.entries(FOOD_GOALS) as [FoodGoal, { label: string; emoji: string }][]).map(
                ([key, { label, emoji }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      updateFood({ goal: key });
                      flash();
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center text-[10px] font-medium transition ring-1",
                      settings.food.goal === key
                        ? "bg-[var(--color-accent)]/15 text-[var(--color-text)] ring-[var(--color-accent)]"
                        : "bg-[var(--color-surface-2)] text-[var(--color-text-subtle)] ring-[var(--color-border)]"
                    )}
                  >
                    <span className="text-lg">{emoji}</span>
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </Section>

        {/* Save feedback */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-success)] px-4 py-2 text-xs font-semibold text-white shadow-lg"
          >
            Enregistré ✓
          </motion.div>
        )}
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[var(--color-surface)] p-5 ring-1 ring-[var(--color-border)]"
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </motion.section>
  );
}

function GoalRow({
  icon,
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-2)] text-[var(--color-text-subtle)]">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-surface-2)] text-sm font-bold text-[var(--color-text-subtle)] active:scale-95"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-sm font-bold">
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + step))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-surface-2)] text-sm font-bold text-[var(--color-text-subtle)] active:scale-95"
          >
            +
          </button>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
