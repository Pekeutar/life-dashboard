"use client";

import Link from "next/link";
import { Brain, ChevronRight, Droplet, Moon, UtensilsCrossed } from "lucide-react";
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
          className="flex items-center justify-between gap-3 rounded-none p-4 ghost-border active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(135deg, rgba(106, 10, 10,0.22) 0%, rgba(106, 10, 10,0.08) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-none text-[var(--color-gold)]"
              style={{
                background: "rgba(106, 10, 10,0.18)",
                border: "1px solid var(--color-gold-faint)",
              }}
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
        <div className="rounded-none bg-[var(--color-surface)]/60 p-5 ghost-border">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            Prochainement
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Moon size={18} />, label: "Sommeil" },
              { icon: <Droplet size={18} />, label: "Hydratation" },
              { icon: <Brain size={18} />, label: "Mental" },
            ].map((p) => (
              <div
                key={p.label}
                className="ghost-border flex flex-col items-center gap-1 rounded-none bg-[var(--color-surface-2)]/50 py-3 opacity-60"
              >
                <span className="text-[var(--color-gold-deep)]">{p.icon}</span>
                <span className="font-headline text-[10px] uppercase tracking-widest text-[var(--color-text-subtle)]">
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
