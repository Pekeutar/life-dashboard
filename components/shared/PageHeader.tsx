"use client";

import Link from "next/link";
import { ChevronLeft, Settings } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: React.ReactNode;
  /** If set, shows a gear icon linking to settings. */
  settingsHref?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  right,
  settingsHref,
}: PageHeaderProps) {
  return (
    <header
      className="pt-safe px-5 pb-3 flex items-start justify-between gap-3 border-b border-[var(--color-border)]"
      style={{
        background:
          "linear-gradient(180deg, rgba(139,26,58,0.06) 0%, transparent 100%)",
      }}
    >
      <div className="flex items-start gap-2">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 -ml-2 flex h-9 w-9 items-center justify-center text-[var(--color-gold)] active:scale-95 active:bg-[var(--color-surface)]"
            aria-label="Retour"
          >
            <ChevronLeft size={22} />
          </Link>
        )}
        <div>
          {subtitle && (
            <p className="font-headline text-[10px] uppercase tracking-gravure text-[var(--color-blood-glow)]">
              {subtitle}
            </p>
          )}
          <h1 className="mt-0.5 font-headline text-2xl font-extrabold uppercase tracking-tight text-[var(--color-gold)] drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
            {title}
          </h1>
        </div>
      </div>
      {settingsHref && (
        <Link
          href={settingsHref}
          className="mt-1 flex h-9 w-9 items-center justify-center border border-[var(--color-gold-faint)] text-[var(--color-gold)] active:scale-95 active:bg-[var(--color-surface)]"
          aria-label="Paramètres"
        >
          <Settings size={18} />
        </Link>
      )}
      {right && <div className="mt-1">{right}</div>}
    </header>
  );
}
