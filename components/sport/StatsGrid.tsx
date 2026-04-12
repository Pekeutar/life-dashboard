"use client";

import type { PeriodStats } from "@/lib/sport/stats";
import { formatDuration } from "@/lib/utils";

interface Props {
  label: string;
  stats: PeriodStats;
}

export default function StatsGrid({ label, stats }: Props) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <StatCell value={String(stats.count)} label={stats.count <= 1 ? "séance" : "séances"} />
        <StatCell value={formatDuration(stats.totalMin)} label="temps" />
        <StatCell
          value={stats.totalKm > 0 ? `${stats.totalKm.toFixed(stats.totalKm < 10 ? 1 : 0)}` : "—"}
          label={stats.totalKm > 0 ? "km" : "aucun km"}
        />
      </div>
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-[var(--color-surface-2)] py-3">
      <span className="text-xl font-bold text-[var(--color-text)]">{value}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </span>
    </div>
  );
}
