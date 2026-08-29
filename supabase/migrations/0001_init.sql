-- Coast FIRE Calculator: core schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Belt-and-suspenders: Supabase grants this by default, but keep the migration
-- self-contained regardless of the "Automatically expose new tables" project
-- setting (which only auto-grants table privileges, not schema usage).
grant usage on schema public to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- subscription_status: one row per user, synced from Stripe webhooks.
-- ---------------------------------------------------------------------------
create table if not exists public.subscription_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'free' check (status in ('free', 'active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscription_status enable row level security;

create policy "users can read their own subscription status"
  on public.subscription_status for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies for regular users: subscription_status is
-- only ever written by the Stripe webhook handler using the service role key.

-- Explicit grants (required with "Automatically expose new tables" disabled):
-- authenticated can only ever read this table; the webhook (service_role,
-- bypasses RLS) is the only writer.
grant select on public.subscription_status to authenticated;
grant select, insert, update, delete on public.subscription_status to service_role;

-- ---------------------------------------------------------------------------
-- scenarios: saved calculator inputs + the computed coast number.
-- ---------------------------------------------------------------------------
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  inputs jsonb not null,
  coast_number_today numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists scenarios_user_id_idx on public.scenarios(user_id);

alter table public.scenarios enable row level security;

create policy "users can read their own scenarios"
  on public.scenarios for select
  using (auth.uid() = user_id);

create policy "users can insert their own scenarios"
  on public.scenarios for insert
  with check (auth.uid() = user_id);

create policy "users can delete their own scenarios"
  on public.scenarios for delete
  using (auth.uid() = user_id);

create policy "users can update their own scenarios"
  on public.scenarios for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Explicit grants: authenticated does full CRUD (via the API routes, which
-- enforce ownership + the free-tier limit); service_role only reads, for the
-- reminder cron job.
grant select, insert, update, delete on public.scenarios to authenticated;
grant select on public.scenarios to service_role;

-- ---------------------------------------------------------------------------
-- net_worth_checkins: manual periodic balance entries tied to a scenario,
-- used to plot actual-vs-projected (premium feature).
-- ---------------------------------------------------------------------------
create table if not exists public.net_worth_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  checkin_date date not null default current_date,
  balance numeric not null check (balance >= 0),
  created_at timestamptz not null default now()
);

create index if not exists net_worth_checkins_user_id_idx on public.net_worth_checkins(user_id);
create index if not exists net_worth_checkins_scenario_id_idx on public.net_worth_checkins(scenario_id);

alter table public.net_worth_checkins enable row level security;

create policy "users can read their own checkins"
  on public.net_worth_checkins for select
  using (auth.uid() = user_id);

create policy "users can insert their own checkins"
  on public.net_worth_checkins for insert
  with check (auth.uid() = user_id);

create policy "users can delete their own checkins"
  on public.net_worth_checkins for delete
  using (auth.uid() = user_id);

-- Explicit grants: authenticated can add/read/remove their own check-ins
-- (no update policy exists — check-ins are immutable entries); service_role
-- only reads, for the reminder cron job.
grant select, insert, delete on public.net_worth_checkins to authenticated;
grant select on public.net_worth_checkins to service_role;

-- ---------------------------------------------------------------------------
-- Keep a subscription_status row present for every new user (defaults to 'free').
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.subscription_status (user_id, status)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
