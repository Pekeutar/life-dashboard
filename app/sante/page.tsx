"use client";

import Link from "next/link";
import { ChevronRight, UtensilsCrossed } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useRecipes } from "@/lib/food/store";

export default function SantePage() {
  const { favorites } = useRecipes();

  return (
    <>
      <PageHeader title="Santé" subtitle="Ton pilier bien-être" backHref="/" />

      <div className="flex flex-col gap-4 px-5 pb-6">
        <Link
          href="/sante/food"
          className="flex items-center justify-between gap-3 rounded-2xl p-4 ring-1 ring-[var(--color-border)] active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.08) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-[#ef4444]"
              style={{ background: "rgba(239,68,68,0.18)" }}
            >
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold">Food</h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {favorites.length > 0
                  ? `${favorites.length} recette${favorites.length > 1 ? "s" : ""} en favoris`
                  : "Recettes healthy générées par IA"}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[var(--color-text-subtle)]" />
        </Link>

        {/* Future health modules */}
        <div className="rounded-2xl bg-[var(--color-surface)]/60 p-5 ring-1 ring-[var(--color-border)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Prochainement
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: "😴", label: "Sommeil" },
              { emoji: "💧", label: "Hydratation" },
              { emoji: "🧘", label: "Mental" },
            ].map((p) => (
              <div
                key={p.label}
                className="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-2)]/50 py-3 opacity-50"
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
