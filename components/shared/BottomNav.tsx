"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  Plus,
  StickyNote,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QuickAddSheet from "./QuickAddSheet";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  match: (path: string) => boolean;
  activeColor: string;
}

const LEFT_TABS: NavItem[] = [
  {
    href: "/",
    icon: <Home size={18} />,
    label: "Bonfire",
    match: (p) => p === "/",
    activeColor: "var(--color-gold)",
  },
  {
    href: "/quetes",
    icon: <Target size={18} />,
    label: "Pacts",
    match: (p) => p.startsWith("/quetes") && p !== "/quetes/new",
    activeColor: "var(--color-gold)",
  },
];

const RIGHT_TABS: NavItem[] = [
  {
    href: "/agenda",
    icon: <CalendarDays size={18} />,
    label: "Fate",
    match: (p) => p.startsWith("/agenda") && p !== "/agenda/new",
    activeColor: "var(--color-gold)",
  },
  {
    href: "/notes",
    icon: <StickyNote size={18} />,
    label: "Grimoire",
    match: (p) => p.startsWith("/notes"),
    activeColor: "var(--color-gold)",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border-strong)] bg-[#050403]/95 backdrop-blur-xl"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.85), inset 0 1px 0 var(--color-gold-faint)",
        }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 pt-2 pb-2">
          {LEFT_TABS.map((item) => (
            <NavTab key={item.href} item={item} active={item.match(pathname)} />
          ))}

          {/* Center FAB — sceau de braise */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="relative -mt-6 flex h-14 w-14 items-center justify-center border-2 bg-[var(--color-surface)] text-[var(--color-gold)] blood-glow transition-all duration-400 active:scale-95"
              style={{ borderColor: "var(--color-blood)" }}
              aria-label="Ajouter"
            >
              <span
                className="pointer-events-none absolute inset-1 border"
                style={{ borderColor: "var(--color-gold-faint)" }}
              />
              <Plus size={24} className="relative" />
            </button>
          </div>

          {RIGHT_TABS.map((item) => (
            <NavTab key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </div>
      </nav>

      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}

function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2 transition-all duration-400 active:scale-90",
        active
          ? "text-[var(--color-gold)]"
          : "text-[var(--color-text-subtle)] hover:text-[var(--color-blood-glow)]"
      )}
      style={
        active
          ? { textShadow: "0 0 8px rgba(139,26,58,0.4)" }
          : undefined
      }
      aria-label={item.label}
    >
      {item.icon}
      <span className="font-headline text-[9px] font-medium uppercase tracking-widest mt-0.5">
        {item.label}
      </span>
    </Link>
  );
}
