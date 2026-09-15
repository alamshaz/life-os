# Life OS

A personal command center: tasks, habits, notes, journal, expenses, goals, and
focus sessions in one dashboard — plus a small recommendation engine that
looks at your own history and surfaces things like "you complete 80% of your
tasks before 2 PM."

## Why this isn't a separate Express server

You asked for MERN, deployable on Vercel. The most efficient way to do that
today is **Next.js App Router**: the `src/app/api/**/route.js` files *are*
your Express-equivalent backend (each one is a serverless function), React is
the frontend, and Node is the runtime — all as one Vercel project with no
separate server to manage, scale, or pay for. Mongo/Mongoose is unchanged.
If you'd rather have a literal standalone Express server behind a separate
`/api` folder for Vercel serverless functions, the models, Mongoose logic, and
business logic in `src/lib` and `src/models` port over directly — only the
route files would need to move from `route.js` handlers to Express routers.

## Stack

- **Database:** MongoDB (Atlas) via Mongoose
- **Backend:** Next.js Route Handlers (Node runtime), NextAuth (credentials + JWT)
- **Frontend:** React 18, Tailwind CSS, Recharts
- **Deployment:** Vercel, including Vercel Cron for nightly insight generation

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — a MongoDB Atlas connection string (free tier is fine:
     https://www.mongodb.com/cloud/atlas). Create a database user, allow
     network access from anywhere (or Vercel's IPs), and grab the connection
     string.
   - `NEXTAUTH_SECRET` — any long random string (`openssl rand -base64 32`).
   - `NEXTAUTH_URL` — `http://localhost:3000` locally.
   - `CRON_SECRET` — any random string; protects the nightly cron endpoint.
3. Run it:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000`, create an account, and start using it.

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, "Add New Project" → import the repo.
3. Add the same environment variables from `.env.local` in the Vercel project
   settings (Settings → Environment Variables). Set `NEXTAUTH_URL` to your
   production URL (e.g. `https://your-app.vercel.app`).
4. Deploy. `vercel.json` already declares a daily cron job that hits
   `/api/cron/daily-insights` at 05:00 UTC — Vercel picks this up
   automatically on Pro/Hobby plans that support Cron Jobs.
5. That's it — no separate server, no Dockerfile, no process manager.

## How the recommendation engine works

`src/lib/insights.js` runs a handful of independent pattern detectors against
each user's own data using MongoDB aggregation/queries:

- **Peak completion window** — what share of your completed tasks land before
  vs. after a cutoff hour (default 2 PM). This is the "you complete 80% of
  your tasks before 2 PM" insight.
- **Best weekday** — which day of the week you finish the most tasks on.
- **Habit consistency** — your most consistent and most-slipping habits over
  the last ~30 days.
- **Focus session trend** — whether your Pomodoro sessions are trending
  longer or shorter.
- **Spending shift** — the expense category with the biggest week-over-week
  change.

Each detector requires a minimum amount of data before it says anything (e.g.
at least 8 completed tasks), so a brand-new account won't get insights
invented from noise — it'll just say there isn't enough history yet.

Insights are computed two ways:
- **On demand:** `GET /api/insights` recomputes live whenever the dashboard
  loads, and the "Refresh" button on the Overview page calls
  `POST /api/insights` to save a snapshot.
- **Nightly, for every user:** `GET /api/cron/daily-insights`, triggered by
  Vercel Cron, loops over all users and stores a snapshot in the `Insight`
  collection — so you have a running history of insights over time even if
  no one opens the dashboard that day.

## Project structure

```
src/
  app/
    page.js                 landing page
    login/, register/       auth pages
    dashboard/               the app itself (layout + sidebar)
      page.js                overview: stats, chart, insights panel
      tasks/ habits/ focus/ journal/ notes/ goals/ expenses/
    api/                     all backend routes (Route Handlers)
      auth/                  NextAuth + registration
      tasks/ habits/ notes/ journal/ expenses/ goals/ focus/
      insights/              on-demand recommendation engine endpoint
      cron/daily-insights/   nightly batch job for all users
  components/                shared UI: Sidebar, InsightsPanel, PageHeader…
  lib/
    db.js                    cached Mongoose connection (serverless-safe)
    auth.js                  NextAuth config
    crud.js                  generic ownership-scoped CRUD handler factory
    insights.js              the recommendation engine
    api.js                   tiny client-side fetch helpers
  models/                    Mongoose schemas
```

## Notes on scope

This is a real, working foundation, not a mockup — auth, all CRUD, the charts,
and the insight engine are fully implemented and build cleanly. A few things
you'll likely want to add as you extend it:

- Push/email notifications (the schema and cron infrastructure are already
  there — you'd add a notification channel, e.g. Resend for email or a
  service worker for push, and call it from the cron job or from `insights.js`
  when a new high-confidence insight is generated).
- Recurring tasks/habits reminders.
- A settings page (the `User` model already has `timezone` and
  `focusCutoffHour` fields ready to be wired to a form and used by the
  insight engine instead of the current hardcoded 2 PM cutoff).

## A note on dependencies

`npm audit` will show one remaining high-severity advisory nested inside
Next.js's own bundled build-time PostCSS dependency. It only affects the
build toolchain (not anything exposed by the deployed app) and is only fully
resolved by moving to Next.js 16, which is a larger breaking upgrade. Keep an
eye on `npm outdated` and upgrade when you're ready.
