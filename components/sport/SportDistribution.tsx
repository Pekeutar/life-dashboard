"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { sportDistribution } from "@/lib/sport/stats";
import { useSportMetas } from "@/lib/sport/meta";
import type { Workout } from "@/lib/sport/types";
import { formatDuration } from "@/lib/utils";

interface Props {
  workouts: Workout[];
}

export default function SportDistribution({ workouts }: Props) {
  const { resolve } = useSportMetas();
  const raw = sportDistribution(workouts);
  const total = raw.reduce((s, r) => s + r.minutes, 0);

  if (raw.length === 0) {
    return (
      <div className="rounded-none bg-[var(--color-surface)] p-4 ghost-border">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Répartition
        </p>
        <div className="flex h-24 items-center justify-center text-xs text-[var(--color-text-subtle)]">
          Aucune donnée
        </div>
      </div>
    );
  }

  const data = raw.map((r) => {
    const meta = resolve(r.type);
    return {
      name: meta.label,
      emoji: meta.emoji,
      value: r.minutes,
      color: meta.color,
      pct: Math.round((r.minutes / total) * 100),
    };
  });

  return (
    <div className="rounded-none bg-[var(--color-surface)] p-4 ghost-border">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        Répartition par sport
      </p>
      <div className="flex items-center gap-4">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-1.5 text-xs">
          {data.slice(0, 5).map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: d.color }}
                />
                <span>
                  <span className="ember-emoji">{d.emoji}</span> {d.name}
                </span>
              </span>
              <span className="text-[var(--color-text-subtle)]">
                {formatDuration(d.value)} · {d.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
