"use client";

import { useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/lib/storage";
import type { NewNoteInput, Note } from "./types";

const STORAGE_KEY = "life-dashboard.notes.v1";

/**
 * Extracts `#tag` tokens from free text. Case-preserved, deduped, max 10.
 */
export function extractInlineTags(content: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /#([\p{L}\p{N}_-]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const t = m[1];
    const key = t.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
      if (out.length >= 10) break;
    }
  }
  return out;
}

export function useNotes() {
  const [notes, setNotes, hydrated] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  const add = useCallback(
    (input: NewNoteInput): Note => {
      const now = new Date().toISOString();
      const merged = mergeTags(input.tags, extractInlineTags(input.content));
      const n: Note = {
        ...input,
        tags: merged,
        id: nanoid(10),
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [n, ...prev]);
      return n;
    },
    [setNotes]
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<Note, "id" | "createdAt">>) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const nextContent = patch.content ?? n.content;
          const nextTags = patch.tags
            ? mergeTags(patch.tags, extractInlineTags(nextContent))
            : mergeTags(n.tags, extractInlineTags(nextContent));
          return {
            ...n,
            ...patch,
            tags: nextTags,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [setNotes]
  );

  const remove = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotes]
  );

  const sorted = useMemo(
    () =>
      [...notes].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [notes]
  );

  return { notes: sorted, add, update, remove, hydrated };
}

function mergeTags(explicit: string[], inline: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...explicit, ...inline]) {
    const clean = t.trim().replace(/^#/, "");
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}
