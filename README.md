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

1. Create a project at [supabase.com](https://supabase.com). On the creation screen, under
   **Security**, you can safely uncheck **"Automatically expose new tables"** — the migrations below
   grant exactly the privileges each role needs explicitly, so it doesn't depend on that default.
2. Run the migrations in `supabase/migrations/` in order, in the SQL editor (or via
   `supabase db push` if you use the CLI):
   - `0001_init.sql` — creates `scenarios`, `net_worth_checkins`, `subscription_status`, their RLS
     policies and explicit grants, and a trigger that gives every new user a `free` subscription row.
   - `0002_scenario_types.sql` — adds `calculator_type` to `scenarios` (so saves from the FIRE,
     longevity, and Barista calculators share the same table as Coast FIRE) and generalizes
     `coast_number_today` to a nullable `headline_value`.
3. Auth → Providers: enable **Email** (magic link is used, no password) and **Google**.
4. Auth → URL Configuration: add `http://localhost:3000/auth/callback` and your production
   `https://yourdomain.com/auth/callback` as redirect URLs.
5. Copy Project URL / anon key / service role key into `.env.local`.

### 2. Stripe

1. Create two recurring Prices under one Product: $8/mo and $69/yr.
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

- **No calculator is ever gated.** All 6 calculator pages — `/` (Coast FIRE),
  `/coast-fire-number`, `/coast-fire-calculator-retirement`, `/fire-calculator`,
  `/how-long-will-my-money-last` (savings longevity), and `/barista-fire-calculator` — render their
  full interactive calculator with no account required. Only *saving* a scenario asks for sign-in.
- **Math and chart rendering are ported line-for-line** from the approved HTML/JS prototype into
  `src/lib/coastfire.ts` (`project()`, `projectFI()`, `projectLongevity()`, `projectBarista()`) and
  `src/lib/chart.ts` (the matching `draw*Chart()` canvas functions), so the numbers and chart
  behavior match exactly.
- **Scenario saving is shared across all 4 calculator types.** `src/lib/useScenarioSave.ts` and
  `src/components/ScenarioSaveBlock.tsx` hold the save/load/delete logic and UI once; each
  calculator wires in its own inputs and headline number, tagged with a `calculator_type`
  (`coast` / `fire` / `longevity` / `barista`) in the shared `scenarios` table. The premium
  dashboard tools (comparison, net worth tracking, Monte Carlo, PDF export) are Coast FIRE-specific
  for now and are scoped to `calculator_type === "coast"` — scenarios from the other 3 calculators
  show in a simpler list on the dashboard instead.
- **Premium gating is server-side.** `src/lib/subscription.ts` re-reads `subscription_status` from
  Postgres on every request; the API routes under `src/app/api/scenarios`, `src/app/api/checkins`,
  enforce the free-tier 1-scenario limit and the Premium-only net-worth-checkin write — never just
  a hidden client button.
- **`/coast-fire-calc` redirects (301) to `/`** — same query cluster, avoids a thin duplicate page.
- Chart rendering is plain `<canvas>` with no charting library, to keep the client bundle small.

## Project structure

```
src/
  app/            routes: landing + long-tail SEO pages for all 6 calculators, /pricing,
                  /dashboard, /login, API routes
  components/     Coast/Fire/Longevity/Barista calculators, Hero, Faq, ScenarioSaveBlock,
                  premium dashboard widgets
  lib/            coastfire.ts (math for all 4 calculator types), chart.ts / chartExtra.ts
                  (canvas rendering), montecarlo.ts, useScenarioSave.ts, scenarioDisplay.ts,
                  supabase/*, stripe.ts, resend.ts, subscription.ts
supabase/migrations/
  0001_init.sql            scenarios, net_worth_checkins, subscription_status
  0002_scenario_types.sql  adds calculator_type, generalizes the headline-number column
```
