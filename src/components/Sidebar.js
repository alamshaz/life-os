"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/habits", label: "Habits" },
  { href: "/dashboard/focus", label: "Focus" },
  { href: "/dashboard/journal", label: "Journal" },
  { href: "/dashboard/notes", label: "Notes" },
  { href: "/dashboard/goals", label: "Goals" },
  { href: "/dashboard/expenses", label: "Expenses" }
];

export default function Sidebar({ userName }) {
  const pathname = usePathname();

  return (
    <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-line">
      <div className="md:sticky md:top-0 md:h-screen flex md:flex-col">
        <div className="px-6 py-6 hidden md:block">
          <Link href="/dashboard" className="font-display text-lg">
            Life OS
          </Link>
          <p className="text-xs text-ink-soft mt-1 truncate">{userName}</p>
        </div>

        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible px-2 md:px-3 md:flex-1 gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                  active ? "bg-teal-soft text-teal font-medium" : "text-ink-soft hover:text-ink hover:bg-fog"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 hidden md:block">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-ink-soft hover:text-ink px-4 py-2 w-full text-left"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
