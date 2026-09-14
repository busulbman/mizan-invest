-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 04 of 11
-- 20260914000400_geo.sql
-- countries, cities and their translations
-- =============================================================================
-- GENERIC BY DESIGN. V1 seeds Saudi Arabia and UAE only (see step 11), but
-- adding Turkey or any other market later is an INSERT - never a migration,
-- never DDL.
-- =============================================================================

create table public.countries (
  id         uuid primary key default gen_random_uuid(),
  iso2       char(2) not null unique,
  iso3       char(3) not null unique,
  flag_emoji text,
  phone_code text,
  is_active  boolean  not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint countries_iso2_lower check (iso2 = lower(iso2)),
  constraint countries_iso3_lower check (iso3 = lower(iso3)),
  constraint countries_phone_code_fmt
    check (phone_code is null or phone_code ~ '^\+[0-9]{1,4}$')
);

create index idx_countries_active
  on public.countries (sort_order, iso2)
  where is_active;

create trigger trg_countries_updated_at
  before update on public.countries
  for each row execute function public.tg_set_updated_at();


create table public.cities (
  id              uuid primary key default gen_random_uuid(),
  country_id      uuid not null references public.countries(id) on delete restrict,
  slug            text not null,
  latitude        numeric(9,6),
  longitude       numeric(9,6),
  hero_media_path text,
  is_active       boolean  not null default true,
  sort_order      smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint cities_slug_fmt  check (slug ~ '^[a-z0-9-]{2,60}$'),
  constraint cities_lat_range check (latitude  is null or latitude  between -90 and 90),
  constraint cities_lng_range check (longitude is null or longitude between -180 and 180),
  constraint cities_coords_together
    check ((latitude is null) = (longitude is null)),

  constraint uq_cities_country_slug unique (country_id, slug)
);

-- ON DELETE RESTRICT: a country with cities cannot be deleted. Deactivate
-- with is_active = false instead.
comment on constraint uq_cities_country_slug on public.cities is
  'Slug is unique per country, not globally: two countries may each have a '
  '"tripoli".';

create index idx_cities_country
  on public.cities (country_id, sort_order)
  where is_active;

create trigger trg_cities_updated_at
  before update on public.cities
  for each row execute function public.tg_set_updated_at();


create table public.country_translations (
  id         uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  language   public.app_language not null,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint country_tr_name_len check (char_length(name) between 1 and 120),
  constraint uq_country_tr unique (country_id, language)
);

create table public.city_translations (
  id         uuid primary key default gen_random_uuid(),
  city_id    uuid not null references public.cities(id) on delete cascade,
  language   public.app_language not null,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint city_tr_name_len check (char_length(name) between 1 and 120),
  constraint uq_city_tr unique (city_id, language)
);

create trigger trg_country_tr_updated_at
  before update on public.country_translations
  for each row execute function public.tg_set_updated_at();

create trigger trg_city_tr_updated_at
  before update on public.city_translations
  for each row execute function public.tg_set_updated_at();
