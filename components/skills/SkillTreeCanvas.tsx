"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Skill, SkillStatus, XpByPillar } from "@/lib/skills/types";
import { skillProgress } from "@/lib/skills/stats";

const CELL_W = 104;
const CELL_H = 116;
const PAD = 44;
const NODE_SIZE = 62;

interface Props {
  skills: Skill[];
  statuses: Map<string, SkillStatus>;
  xp: XpByPillar;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function SkillTreeCanvas({
  skills,
  statuses,
  xp,
  selectedId,
  onSelect,
}: Props) {
  const { width, height } = useMemo(() => {
    const maxCol = skills.reduce((m, s) => Math.max(m, s.col), 4);
    const maxRow = skills.reduce((m, s) => Math.max(m, s.row), 3);
    return {
      width: (maxCol + 1) * CELL_W + PAD * 2,
      height: (maxRow + 1) * CELL_H + PAD * 2,
    };
  }, [skills]);

  function center(col: number, row: number) {
    return {
      x: PAD + col * CELL_W + CELL_W / 2,
      y: PAD + row * CELL_H + CELL_H / 2,
    };
  }

  const links = useMemo(() => {
    const out: {
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
      active: boolean;
      full: boolean;
    }[] = [];
    for (const s of skills) {
      const childStatus = statuses.get(s.id);
      for (const pid of s.parents) {
        const parent = skills.find((p) => p.id === pid);
        if (!parent) continue;
        const from = center(parent.col, parent.row);
        const to = center(s.col, s.row);
        const parentStatus = statuses.get(parent.id);
        const active = parentStatus === "unlocked";
        const full = active && childStatus === "unlocked";
        out.push({
          key: `${parent.id}-${s.id}`,
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          color: s.color,
          active,
          full,
        });
      }
    }
    return out;
  }, [skills, statuses]);

  return (
    <div
      className="relative overflow-auto rounded-none bg-[var(--color-surface)] ghost-border"
      style={{
        maxHeight: "62vh",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
        backgroundSize: "16px 16px",
      }}
    >
      <div className="relative" style={{ width, height }}>
        {/* Links */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={width}
          height={height}
        >
          <defs>
            {links.map((l) => (
              <linearGradient
                key={`grad-${l.key}`}
                id={`grad-${l.key}`}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={l.color} stopOpacity={l.full ? 0.9 : 0.5} />
                <stop offset="100%" stopColor={l.color} stopOpacity={l.full ? 0.9 : 0.3} />
              </linearGradient>
            ))}
          </defs>
          {links.map((l) => (
            <line
              key={l.key}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={
                l.full
                  ? `url(#grad-${l.key})`
                  : l.active
                    ? `url(#grad-${l.key})`
                    : "rgba(255,255,255,0.08)"
              }
              strokeWidth={l.full ? 4 : 2.5}
              strokeLinecap="round"
              strokeDasharray={l.active ? undefined : "5 6"}
            />
          ))}
        </svg>

        {/* Nodes */}
        {skills.map((s) => {
          const c = center(s.col, s.row);
          const status = statuses.get(s.id) ?? "locked";
          const progress = skillProgress(s, status, xp);
          const isSelected = s.id === selectedId;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              whileTap={{ scale: 0.9 }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: c.x, top: c.y }}
            >
              {/* Ring progress (available only) */}
              {status === "available" && progress > 0 && (
                <svg
                  className="absolute -top-[3px] -left-[3px] pointer-events-none"
                  width={NODE_SIZE + 6}
                  height={NODE_SIZE + 6}
                  style={{
                    transform: "translate(-50%, -50%)",
                    left: "50%",
                    top: "50%",
                  }}
                >
                  <circle
                    cx={(NODE_SIZE + 6) / 2}
                    cy={(NODE_SIZE + 6) / 2}
                    r={NODE_SIZE / 2 + 1}
                    fill="none"
                    stroke={s.color}
                    strokeOpacity={0.9}
                    strokeWidth={2}
                    strokeDasharray={`${progress * Math.PI * (NODE_SIZE + 2)} ${Math.PI * (NODE_SIZE + 2)}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${(NODE_SIZE + 6) / 2} ${(NODE_SIZE + 6) / 2})`}
                  />
                </svg>
              )}

              <div
                className="relative flex items-center justify-center rounded-none text-2xl transition"
                style={{
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  background:
                    status === "unlocked"
                      ? `linear-gradient(135deg, ${s.color}55 0%, ${s.color}22 100%)`
                      : status === "available"
                        ? "var(--color-surface-2)"
                        : "rgba(255,255,255,0.03)",
                  boxShadow:
                    status === "unlocked"
                      ? `0 0 28px -4px ${s.color}cc, inset 0 0 0 2px ${s.color}`
                      : status === "available"
                        ? "inset 0 0 0 1px rgba(255,255,255,0.12)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  filter: status === "locked" ? "grayscale(0.8)" : undefined,
                  opacity: status === "locked" ? 0.42 : 1,
                  outline: isSelected
                    ? `2px solid ${s.color}`
                    : "2px solid transparent",
                  outlineOffset: 3,
                }}
              >
                {status === "locked" ? (
                  <Lock size={20} className="text-[var(--color-text-subtle)]" />
                ) : (
                  s.emoji
                )}
              </div>

              <span
                className="max-w-[88px] truncate text-[10px] font-semibold"
                style={{
                  color:
                    status === "unlocked"
                      ? s.color
                      : status === "available"
                        ? "var(--color-text)"
                        : "var(--color-text-subtle)",
                }}
              >
                {s.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
