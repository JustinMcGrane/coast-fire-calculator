-- Extend scenarios to support saving from all four calculators, not just Coast FIRE.
-- Run via `supabase db push` or paste into the Supabase SQL editor.

alter table public.scenarios
  add column if not exists calculator_type text not null default 'coast'
  check (calculator_type in ('coast', 'fire', 'longevity', 'barista'));

-- coast_number_today only ever meant "the headline number for this saved
-- scenario" — now that other calculator types save here too (FI age, age
-- money runs out, projected balance), rename it to reflect that. Some of
-- those headline numbers have no determinate value (e.g. "beyond 60-year
-- horizon", "lasts indefinitely"), so the column also becomes nullable.
alter table public.scenarios rename column coast_number_today to headline_value;
alter table public.scenarios alter column headline_value drop not null;
