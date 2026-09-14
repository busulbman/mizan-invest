-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 06 of 11
-- 20260914000600_fx.sql
-- fx_rates
-- =============================================================================
-- MUST run before step 07: the property price trigger reads this table and will
-- raise if no rate exists for a listing's currency.
-- =============================================================================

create table public.fx_rates (
  base       public.currency_code not null,
  quote      public.currency_code not null,
  rate       numeric(18,8) not null,
  as_of      date not null default current_date,
  source     text,
  created_at timestamptz not null default now(),

  constraint fx_rate_positive  check (rate > 0),
  constraint fx_base_not_quote check (base <> quote),

  primary key (base, quote, as_of)
);

comment on column public.fx_rates.rate is
  'Units of `quote` per 1 unit of `base`. USD->SAR = 3.75 means 1 USD buys '
  '3.75 SAR.';

comment on table public.fx_rates is
  'KNOWN PHASE 1 LIMITATION: conversion assumes every currency uses 2 minor-'
  'unit decimals. True for USD/SAR/AED/TRY/RUB/EUR/GBP. Adding KWD (3 decimals) '
  'or JPY (0) later requires a minor_unit_exponent column.';

create index idx_fx_latest on public.fx_rates (base, quote, as_of desc);
