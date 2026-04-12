"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { weeklyVolume } from "@/lib/sport/stats";
import type { Workout } from "@/lib/sport/types";

interface Props {
  workouts: Workout[];
}

export default function WeeklyChart({ workouts }: Props) {
  const raw = weeklyVolume(workouts, 4);
  const data = raw.map((w, i) => ({
    label: i === raw.length - 1 ? "Cette sem." : `S-${raw.length - 1 - i}`,
    minutes: w.minutes,
    count: w.count,
  }));

  const hasData = data.some((d) => d.minutes > 0);

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        Volume 4 dernières semaines
      </p>
      <div className="h-36">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="label"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#26262d" }}
                contentStyle={{
                  background: "#1c1c21",
                  border: "1px solid #2e2e37",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(value) => [`${value} min`, "Volume"]}
              />
              <Bar dataKey="minutes" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-subtle)]">
            Aucune donnée. Lance-toi !
          </div>
        )}
      </div>
    </div>
  );
}
