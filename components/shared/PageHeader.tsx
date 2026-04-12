"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  right,
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
      {right && <div className="mt-1">{right}</div>}
    </header>
  );
}
