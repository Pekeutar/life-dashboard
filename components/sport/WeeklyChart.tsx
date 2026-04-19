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
    <div className="rounded-none bg-[var(--color-surface)] p-4 ghost-border">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        Volume 4 dernières semaines
      </p>
      <div className="h-36">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="label"
                stroke="#6d6055"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6d6055"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(93,60,40,0.25)" }}
                contentStyle={{
                  background: "#181513",
                  border: "1px solid rgba(197,163,100,0.35)",
                  borderRadius: 0,
                  fontSize: 12,
                  color: "#d9cfc4",
                }}
                labelStyle={{ color: "#c5a364" }}
                formatter={(value) => [`${value} min`, "Volume"]}
              />
              <Bar dataKey="minutes" fill="#5a0f1f" radius={[0, 0, 0, 0]} />
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
