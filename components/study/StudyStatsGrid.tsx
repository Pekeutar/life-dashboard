"use client";

import type { StudyPeriodStats } from "@/lib/study/stats";
import { formatDuration } from "@/lib/utils";

interface Props {
  label: string;
  stats: StudyPeriodStats;
}

export default function StudyStatsGrid({ label, stats }: Props) {
  return (
    <div className="rounded-none bg-[var(--color-surface)] p-4 ghost-border">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <StatCell
          value={String(stats.count)}
          label={stats.count <= 1 ? "session" : "sessions"}
        />
        <StatCell value={formatDuration(stats.totalMin)} label="temps" />
        <StatCell value={`+${stats.totalXp}`} label="xp" />
      </div>
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-none bg-[var(--color-surface-2)] py-3">
      <span className="text-xl font-bold text-[var(--color-text)]">{value}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </span>
    </div>
  );
}
