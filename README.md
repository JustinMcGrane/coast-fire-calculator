# Coast — Coast FIRE Calculator

An SEO-first Coast FIRE calculator. Free, unlimited, no-login calculator as the acquisition
engine; a Stripe-powered Premium tier (multi-scenario comparison, net worth tracking, Monte Carlo
simulation) as the monetization layer.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (layout/utilities) + a ported hand-written design system (`src/app/globals.css`)
- Supabase (Postgres + Auth: email magic link + Google OAuth)
- Stripe (Checkout + Customer Portal, subscriptions)
- Resend (quarterly net-worth check-in reminder emails)
- Deploy target: Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (or via `supabase db push` if you use
   the CLI) — creates `scenarios`, `net_worth_checkins`, `subscription_status`, RLS policies, and a
   trigger that gives every new user a `free` subscription row.
3. Auth → Providers: enable **Email** (magic link is used, no password) and **Google**.
4. Auth → URL Configuration: add `http://localhost:3000/auth/callback` and your production
   `https://yourdomain.com/auth/callback` as redirect URLs.
5. Copy Project URL / anon key / service role key into `.env.local`.

### 2. Stripe

1. Create two recurring Prices under one Product: $9/mo and $79/yr.
2. Put their IDs in `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` / `_YEARLY`.
3. Add a webhook endpoint pointing at `https://yourdomain.com/api/stripe/webhook`, listening for
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Enable the Customer Portal (Stripe Dashboard → Settings → Billing → Customer portal).
5. For local testing, use `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 3. Resend

1. Create an API key at [resend.com](https://resend.com) and verify a sending domain.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

### 4. Cron (quarterly reminder emails)

`vercel.json` schedules `/api/cron/net-worth-reminder` to run monthly; the route itself decides
who's actually due (last check-in > 90 days ago, or never checked in). Set `CRON_SECRET` to any
random string — Vercel sends it automatically as a bearer token to cron routes; the route rejects
any other caller.

## Architecture notes

- **The calculator is never gated.** `/`, `/coast-fire-number`, and
  `/coast-fire-calculator-retirement` all render the full interactive calculator
  (`src/components/CoastCalculator.tsx`) with no account required. Only *saving* a scenario asks
  for sign-in.
- **Math and chart rendering are ported line-for-line** from the approved HTML/JS prototype into
  `src/lib/coastfire.ts` (the `project()` projection) and `src/lib/chart.ts` (the canvas
  `drawChart()`), so the numbers and chart behavior match exactly.
- **Premium gating is server-side.** `src/lib/subscription.ts` re-reads `subscription_status` from
  Postgres on every request; the API routes under `src/app/api/scenarios`, `src/app/api/checkins`,
  enforce the free-tier 1-scenario limit and the Premium-only net-worth-checkin write — never just
  a hidden client button.
- **`/coast-fire-calc` redirects (301) to `/`** — same query cluster, avoids a thin duplicate page.
- Chart rendering is plain `<canvas>` with no charting library, to keep the client bundle small.

## Project structure

```
src/
  app/            routes: landing + long-tail SEO pages, /pricing, /dashboard, /login, API routes
  components/     CoastCalculator, Hero, Faq, premium dashboard widgets
  lib/            coastfire.ts (math), chart.ts / chartExtra.ts (canvas rendering),
                  montecarlo.ts, supabase/*, stripe.ts, resend.ts, subscription.ts
supabase/migrations/0001_init.sql
```
