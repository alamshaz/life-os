import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 max-w-5xl mx-auto w-full">
        <span className="font-display text-lg tracking-tight">Life OS</span>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/login" className="text-ink-soft hover:text-ink">
            Log in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-5xl mx-auto px-8 py-16 grid md:grid-cols-[1.1fr_0.9fr] gap-16 items-center w-full">
          <div>
            <p className="font-mono text-xs text-teal mb-4">A single ledger for your day</p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
              Everything you track about your life, kept in one quiet place.
            </h1>
            <p className="text-ink-soft text-lg leading-relaxed mb-8 max-w-md">
              Tasks, habits, notes, a journal, your spending, your goals, and your focus time —
              plus a running read on the patterns underneath all of it.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/register" className="btn-primary px-6 py-3">
                Create your Life OS
              </Link>
              <Link href="/login" className="btn-ghost px-6 py-3">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="panel p-6">
            <p className="font-mono text-xs text-ink-soft mb-4">Today's insight</p>
            <p className="stat-number text-4xl mb-2">80%</p>
            <p className="text-sm text-ink-soft leading-relaxed mb-6">
              of your tasks get finished before 2:00 PM. Your mornings are doing the heavy lifting —
              the app noticed so you don't have to.
            </p>
            <div className="h-px bg-line mb-6" />
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">Tasks completed this week</span>
                <span className="font-mono">23</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">Habit streak, longest</span>
                <span className="font-mono">12 days</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">Focus minutes today</span>
                <span className="font-mono">75</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="px-8 py-6 text-center text-xs text-ink-soft">
        Built with the MERN stack (MongoDB, Express-style API routes, React, Node) — deployed on Vercel.
      </footer>
    </main>
  );
}
