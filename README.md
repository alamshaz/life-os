# Life OS

A personal command center that unifies tasks, habits, notes, a daily journal,
expenses, goals, and focus sessions into one dashboard — with a small
recommendation engine that mines your own activity history for patterns,
like *"you complete 80% of your tasks before 2 PM."*

**[Live demo →](#)** *(add your Vercel URL here after deploying)*
**Sign up with any email — it's a sandboxed personal project, not a real service.**

---

## Why I built it

I wanted a single project that touched the full stack end to end: schema
design, auth, REST-style API design, serverless deployment constraints, data
visualization, and — the part I found most interesting — turning raw
behavioral data into something resembling an actual insight rather than just
a dashboard of numbers.

## What it demonstrates

- **Full CRUD across 7 resources** (tasks, habits, notes, journal entries,
  expenses, goals, focus sessions), each properly scoped so users can only
  ever read or modify their own data.
- **A real recommendation engine, not a gimmick.** `src/lib/insights.js` runs
  independent pattern detectors — peak productivity window, best weekday,
  habit consistency, focus-session trend, week-over-week spending shift —
  using MongoDB aggregation queries against each user's own history. Every
  detector has a minimum-data threshold, so a new account gets "not enough
  history yet" instead of a claim invented from noise.
- **Serverless-aware backend design.** MongoDB connections are cached across
  invocations (`src/lib/db.js`) instead of reconnecting on every request,
  which matters once you're running on Vercel's function model instead of a
  long-lived Express process.
- **A scheduled job, not just request/response.** A Vercel Cron trigger hits
  `/api/cron/daily-insights` nightly and regenerates insights for every user,
  authenticated with a shared secret so the endpoint can't be triggered
  externally.
- **Auth done properly.** Credentials hashed with bcrypt, JWT sessions via
  NextAuth, every API route re-verifies the session server-side rather than
  trusting the client.
- **Deliberate, non-templated UI.** Custom design system instead of default
  component-library styling.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Database | MongoDB Atlas + Mongoose | Flexible schema for varied personal-data types; Atlas free tier is sufficient |
| Backend | Next.js Route Handlers (Node runtime) | Serverless functions that deploy natively on Vercel — no separate Express server or hosting to manage |
| Auth | NextAuth (Credentials provider + JWT) | Battle-tested session handling rather than hand-rolled auth |
| Frontend | React 18, Tailwind CSS, Recharts | Fast iteration, utility-first styling, lightweight charting |
| Hosting | Vercel | Zero-config deploys, built-in Cron Jobs, generous free tier |

This is the MERN stack adapted for how it's actually best deployed on Vercel
today: Next.js's API routes replace a standalone Express server (each route
file becomes its own serverless function), while MongoDB/Mongoose, React,
and Node are unchanged. If you're evaluating this against a "classic" MERN
project with a literal Express server, the reasoning for the swap — and how
the code would need to change to go back to one — is in
[*Architecture notes*](#architecture-notes) below.

## The recommendation engine, in more detail

Five independent detectors, each backed by a MongoDB aggregation or query,
each gated by a minimum sample size so it doesn't hallucinate a pattern from
three data points:

| Detector | What it looks for |
|---|---|
| Peak completion window | Share of completed tasks before vs. after a cutoff hour (default 2 PM) |
| Best weekday | Which day of the week has the highest share of completions |
| Habit consistency | Most consistent and most-slipping habit over a rolling 30-day window |
| Focus session trend | Whether average Pomodoro length is trending up or down |
| Spending shift | The expense category with the largest week-over-week % change |

Insights are computed two ways: on-demand (`GET /api/insights`, recomputed
live whenever the dashboard loads) and nightly for every user in the
database via the Cron-triggered batch job, which persists a snapshot so
there's a running history over time.

## Screenshots

*(Add 2–3 screenshots here — the Overview dashboard with the insights panel
is the strongest one to lead with, followed by the habit streak grid and the
expenses breakdown.)*

## Getting it running locally

### Prerequisites
- Node.js 18.17+
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier, or a local instance

### Setup

```bash
git clone https://github.com/yourusername/life-os.git
cd life-os
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lifeos
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
CRON_SECRET=<any random string>
```

Then:

```bash
npm run dev
```

Visit `http://localhost:3000`, create an account, and start using it. The
insights panel needs a bit of history (roughly 8+ completed tasks) before it
has enough data to say anything.

## Deploying your own copy

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same four environment variables from `.env.local` in the Vercel
   project's Settings → Environment Variables (set `NEXTAUTH_URL` to your
   production URL).
4. Deploy. `vercel.json` already declares the nightly Cron job — Vercel picks
   it up automatically.

## Architecture notes

**Why Next.js instead of a standalone Express server:** the task was "MERN,
deployable on Vercel." Vercel's model is serverless functions, not a
long-running process — so a traditional `app.listen()` Express server
doesn't map cleanly onto it. Next.js Route Handlers give you the same
Express-shaped mental model (a file per route, functions per HTTP verb) while
compiling naturally to Vercel's function runtime. If you wanted a literal
separate Express server (for portability to non-Vercel hosting, for
instance), the Mongoose models and business logic in `src/lib/insights.js`
would port over directly — only the route files would need rewriting as
Express routers instead of `route.js` exports.

**Why a generic CRUD factory (`src/lib/crud.js`):** four of the seven
resources (notes, journal, expenses, goals) are structurally identical —
list/create/update/delete, scoped to the owning user. Rather than repeating
that logic four times, a factory builds the handlers from the Mongoose model
alone. Tasks and habits get bespoke handlers because they have real business
logic (stamping `completedAt` on task completion; the habit-toggle endpoint
and streak calculation).

**Why habit logs are a separate collection from habits:** `HabitLog` stores
one row per `(habit, date)` rather than an array field on the `Habit`
document. This keeps documents small and bounded regardless of how long a
habit has existed, and makes the insight engine's aggregation queries
straightforward instead of requiring array unwinding.

## Project structure

```
src/
  app/
    page.js                 landing page
    login/, register/       auth pages
    dashboard/               the app itself
      page.js                overview: stats, chart, insights panel
      tasks/ habits/ focus/ journal/ notes/ goals/ expenses/
    api/                     backend — one folder per resource
      auth/                  NextAuth + registration
      insights/              on-demand recommendation engine endpoint
      cron/daily-insights/   nightly batch job for all users
  components/                Sidebar, InsightsPanel, PageHeader, EmptyState…
  lib/
    db.js                    cached Mongoose connection (serverless-safe)
    auth.js                  NextAuth config
    crud.js                  generic ownership-scoped CRUD handler factory
    insights.js              the recommendation engine
  models/                    Mongoose schemas
```

## What I'd build next

- Push/email notifications when a new high-confidence insight is generated
  (schema and cron infrastructure are already in place — just needs a
  delivery channel, e.g. Resend for email)
- A settings page wired to the `User` model's already-present `timezone` and
  `focusCutoffHour` fields, so the insight engine's cutoff hour is
  user-configurable instead of hardcoded
- Recurring tasks and habit reminders
- Tests — currently none; would prioritize the insight engine's detectors
  first since they're the most logic-dense part of the codebase

## License

MIT — feel free to fork and adapt.