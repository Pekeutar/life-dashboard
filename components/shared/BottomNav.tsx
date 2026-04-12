"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Dumbbell, Home, Plus, Target } from "lucide-react";
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
    label: "Accueil",
    match: (p) => p === "/",
    activeColor: "var(--color-text)",
  },
  {
    href: "/sport",
    icon: <Dumbbell size={18} />,
    label: "Sport",
    match: (p) => p.startsWith("/sport") && p !== "/sport/new",
    activeColor: "var(--color-accent)",
  },
  {
    href: "/etude",
    icon: <BookOpen size={18} />,
    label: "Étude",
    match: (p) => p.startsWith("/etude") && p !== "/etude/new",
    activeColor: "var(--color-level)",
  },
];

const RIGHT_TABS: NavItem[] = [
  {
    href: "/quetes",
    icon: <Target size={18} />,
    label: "Quêtes",
    match: (p) => p.startsWith("/quetes") && p !== "/quetes/new",
    activeColor: "#ec4899",
  },
  {
    href: "/agenda",
    icon: <CalendarDays size={18} />,
    label: "Agenda",
    match: (p) => p.startsWith("/agenda") && p !== "/agenda/new",
    activeColor: "var(--color-accent)",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-6 items-center px-2 pt-2 pb-2">
          {LEFT_TABS.map((item) => (
            <NavTab key={item.href} item={item} active={item.match(pathname)} />
          ))}

          {/* Center FAB */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg shadow-orange-500/30 transition active:scale-95"
              aria-label="Ajouter"
            >
              <Plus size={26} />
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
        "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition active:scale-95",
        !active && "text-[var(--color-text-subtle)]"
      )}
      style={active ? { color: item.activeColor } : undefined}
      aria-label={item.label}
    >
      {item.icon}
      <span className="text-[9px] font-medium uppercase tracking-wide">
        {item.label}
      </span>
    </Link>
  );
}
