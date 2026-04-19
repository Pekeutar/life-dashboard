"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, StickyNote, X } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import NoteCard from "@/components/notes/NoteCard";
import NoteEditorSheet from "@/components/notes/NoteEditorSheet";
import { useNotes } from "@/lib/notes/store";

export default function NotesPage() {
  return (
    <Suspense fallback={null}>
      <NotesPageInner />
    </Suspense>
  );
}

function NotesPageInner() {
  const { notes, hydrated } = useNotes();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [target, setTarget] = useState<string | "new" | null>(null);

  // Auto-open the editor when arriving with ?new=1 (from QuickAdd)
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setTarget("new");
      router.replace("/notes");
    }
  }, [searchParams, router]);

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of notes) {
      for (const t of n.tags) {
        const key = t.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          out.push(t);
        }
      }
    }
    return out;
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (activeTag && !n.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())) {
        return false;
      }
      if (!q) return true;
      if (n.content.toLowerCase().includes(q)) return true;
      if (n.tags.some((t) => t.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [notes, query, activeTag]);

  return (
    <>
      <PageHeader
        title="Notes"
        subtitle="Capture rapide, mémoire durable"
        right={
          <button
            type="button"
            onClick={() => setTarget("new")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg shadow-orange-500/20 active:scale-95"
            aria-label="Nouvelle note"
          >
            <Plus size={18} />
          </button>
        }
      />

      <div className="px-5 pb-24">
        <div className="mb-3 flex items-center gap-2 rounded-none bg-[var(--color-surface)] px-3 py-2 ghost-border">
          <Search size={14} className="text-[var(--color-text-subtle)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[var(--color-text-subtle)]"
              aria-label="Effacer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {allTags.map((t) => {
              const on = activeTag?.toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTag(on ? null : t)}
                  className={
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition " +
                    (on
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-accent)]/15 text-[var(--color-accent)]")
                  }
                >
                  #{t}
                </button>
              );
            })}
          </div>
        )}

        {!hydrated ? (
          <div className="rounded-none bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-subtle)] ghost-border">
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <button
            type="button"
            onClick={() => setTarget("new")}
            className="flex w-full flex-col items-center gap-2 rounded-none border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-10 text-center text-sm text-[var(--color-text-subtle)] active:bg-[var(--color-surface)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[var(--color-surface-2)] text-[var(--color-gold-deep)] ghost-border">
              <StickyNote size={20} />
            </div>
            {notes.length === 0
              ? "Aucune note. Ajoute ta première."
              : "Aucun résultat."}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((n) => (
              <NoteCard key={n.id} note={n} onClick={() => setTarget(n.id)} />
            ))}
          </div>
        )}
      </div>

      <NoteEditorSheet target={target} onClose={() => setTarget(null)} />
    </>
  );
}
