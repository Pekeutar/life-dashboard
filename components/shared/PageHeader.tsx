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
    <header className="pt-safe px-5 pb-3 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 -ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] active:scale-95 active:bg-[var(--color-surface)]"
            aria-label="Retour"
          >
            <ChevronLeft size={22} />
          </Link>
        )}
        <div>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-subtle)]">{subtitle}</p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            {title}
          </h1>
        </div>
      </div>
      {settingsHref && (
        <Link
          href={settingsHref}
          className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] active:scale-95 active:bg-[var(--color-surface)]"
          aria-label="Paramètres"
        >
          <Settings size={20} />
        </Link>
      )}
      {right && <div className="mt-1">{right}</div>}
    </header>
  );
}
