-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 07 of 11
-- 20260914000700_properties.sql
-- properties · property_translations · property_media
-- =============================================================================
-- TRIGGER EXECUTION ORDER (PostgreSQL fires BEFORE-row triggers in ALPHABETICAL
-- order by trigger name). The current names resolve to:
--
--   1. trg_properties_guard_privileged   strips/rejects admin-managed fields
--   2. trg_properties_set_price_usd      derives price_usd_cents from fx_rates
--   3. trg_properties_stamp_published    stamps published_at on first publish
--   4. trg_properties_updated_at         sets updated_at
--   5. trg_properties_validate_geo       asserts city belongs to country
--
-- This order is REQUIRED: the guard must sanitize before pricing and stamping
-- run. RENAMING ANY OF THESE TRIGGERS CAN SILENTLY REORDER THEM.
-- =============================================================================

create sequence public.property_ref_seq start 1000;

create table public.properties (
  id                 uuid primary key default gen_random_uuid(),
  -- No column DEFAULT: the guard trigger assigns this so the sequence is
  -- consumed exactly once and a client can never choose its own reference.
  reference_code     text not null unique,

  partner_id         uuid not null references public.partners(id)  on delete restrict,
  city_id            uuid not null references public.cities(id)    on delete restrict,
  country_id         uuid not null references public.countries(id) on delete restrict,

  property_type      public.property_type      not null,
  listing_status     public.listing_status     not null default 'available',
  publication_status public.publication_status not null default 'draft',

  -- Money is stored as INTEGER MINOR UNITS in the currency the partner listed
  -- in. price_usd_cents is a derived cross-currency sort key. Floats lose
  -- cents at scale; a single-currency column cannot express an AED listing.
  price_amount       bigint not null,
  price_currency     public.currency_code not null,
  price_usd_cents    bigint not null default 0,

  bedrooms           smallint not null default 0,
  bathrooms          smallint not null default 0,
  area_sqm           numeric(10,2),
  parking_spaces     smallint not null default 0,
  has_pool           boolean not null default false,
  has_security       boolean not null default false,
  has_garden         boolean not null default false,

  -- VIEW FEATURES. Listing analytics (view_count / property_views) are a
  -- SEPARATE concept and arrive in Phase 11. Do not conflate them.
  has_sea_view       boolean not null default false,
  has_city_view      boolean not null default false,

  year_built         smallint,
  latitude           numeric(9,6),
  longitude          numeric(9,6),
  location_precision public.location_precision not null default 'approximate',

  featured           boolean not null default false,   -- admin write only
  verified           boolean not null default false,   -- admin write only

  -- Platform investment analysis. Admin-managed in V1. A partner-claimed
  -- metrics workflow may be added later via metrics_source = 'partner_claimed'.
  roi_pct                numeric(5,2),
  rental_yield_pct       numeric(5,2),
  monthly_rent_usd_cents bigint,
  amortization_years     smallint,
  investment_score       smallint,
  growth_score           smallint,
  risk_level             public.risk_level,
  market_trend           public.market_trend,
  metrics_source         public.metrics_source not null default 'manual',
  metrics_updated_at     timestamptz,

  favorite_count     integer not null default 0,       -- trigger-maintained

  published_at       timestamptz,
  created_by         uuid references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz,

  constraint prop_price_positive   check (price_amount > 0),
  constraint prop_price_usd_nonneg check (price_usd_cents >= 0),
  constraint prop_bedrooms_range   check (bedrooms  between 0 and 50),
  constraint prop_bathrooms_range  check (bathrooms between 0 and 50),
  constraint prop_parking_range    check (parking_spaces between 0 and 999),
  constraint prop_area_range
    check (area_sqm is null or (area_sqm > 0 and area_sqm < 10000000)),
  constraint prop_year_range
    check (year_built is null or year_built between 1800 and 2100),
  constraint prop_lat_range
    check (latitude  is null or latitude  between -90 and 90),
  constraint prop_lng_range
    check (longitude is null or longitude between -180 and 180),
  constraint prop_coords_together
    check ((latitude is null) = (longitude is null)),
  constraint prop_roi_range
    check (roi_pct is null or roi_pct between 0 and 100),
  constraint prop_yield_range
    check (rental_yield_pct is null or rental_yield_pct between 0 and 100),
  constraint prop_rent_nonneg
    check (monthly_rent_usd_cents is null or monthly_rent_usd_cents >= 0),
  constraint prop_amort_range
    check (amortization_years is null or amortization_years between 0 and 100),
  constraint prop_inv_score_range
    check (investment_score is null or investment_score between 0 and 100),
  constraint prop_growth_score_range
    check (growth_score is null or growth_score between 0 and 100),
  constraint prop_fav_count_nonneg check (favorite_count >= 0),
  constraint prop_published_requires_timestamp
    check (publication_status <> 'published' or published_at is not null)
);

comment on table public.properties is
  'ON DELETE RESTRICT on partner_id/city_id/country_id is deliberate: deleting '
  'a partner must never silently vanish their listings. Combined with the '
  'RESTRICT on private.partner_private, an active partner is effectively '
  'undeletable - deactivate with is_active = false. DO NOT "fix" these to '
  'CASCADE.';

-- -----------------------------------------------------------------------------
-- Geo integrity: country_id is denormalized for filtering, so keep it honest
-- -----------------------------------------------------------------------------
create or replace function public.tg_properties_validate_geo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_country uuid;
begin
  select c.country_id into v_country
  from public.cities c
  where c.id = new.city_id;

  if v_country is null then
    raise exception 'city % does not exist', new.city_id using errcode = '23503';
  end if;

  if v_country <> new.country_id then
    raise exception 'city % does not belong to country %',
      new.city_id, new.country_id using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trg_properties_validate_geo
  before insert or update of city_id, country_id on public.properties
  for each row execute function public.tg_properties_validate_geo();

-- -----------------------------------------------------------------------------
-- price_usd_cents is ALWAYS derived, never client-supplied
-- -----------------------------------------------------------------------------
create or replace function public.tg_properties_set_price_usd()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rate numeric;
begin
  if new.price_currency = 'USD' then
    new.price_usd_cents := new.price_amount;
    return new;
  end if;

  select f.rate into v_rate
  from public.fx_rates f
  where f.base = 'USD' and f.quote = new.price_currency
  order by f.as_of desc
  limit 1;

  if v_rate is null or v_rate <= 0 then
    raise exception 'No FX rate for USD->%; seed public.fx_rates first',
      new.price_currency using errcode = '23514';
  end if;

  new.price_usd_cents := round(new.price_amount / v_rate);
  return new;
end;
$$;

create trigger trg_properties_set_price_usd
  before insert or update of price_amount, price_currency on public.properties
  for each row execute function public.tg_properties_set_price_usd();

-- -----------------------------------------------------------------------------
-- Stamp published_at on first publish
-- -----------------------------------------------------------------------------
create or replace function public.tg_properties_stamp_published()
returns trigger
language plpgsql
as $$
begin
  if new.publication_status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger trg_properties_stamp_published
  before insert or update of publication_status on public.properties
  for each row execute function public.tg_properties_stamp_published();

create trigger trg_properties_updated_at
  before update on public.properties
  for each row execute function public.tg_set_updated_at();

-- -----------------------------------------------------------------------------
-- Privileged-column guard — INSERT *and* UPDATE
-- -----------------------------------------------------------------------------
-- Runs on INSERT as well as UPDATE. An UPDATE-only guard would let a partner
-- CREATE a listing that is already verified, featured, or carrying a fabricated
-- investment_score.
--
-- Bypasses:
--   1. mizan.internal = on -> an internal counter-sync trigger is running
--      (favorite_count / listings_count). Without this, favoriting a property
--      would fail.
--   2. auth.uid() IS NULL  -> migration, SQL editor or service_role. Safe:
--      `anon` has no INSERT/UPDATE grant on this table (see step 10), so it can
--      never reach this trigger.
create or replace function public.tg_properties_guard_privileged()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('mizan.internal', true), 'off') = 'on' then
    return new;
  end if;

  -- Reference code is always server-assigned for non-admin inserts.
  if tg_op = 'INSERT' and (new.reference_code is null
                           or (auth.uid() is not null and not public.is_admin())) then
    new.reference_code := 'MZ-' || nextval('public.property_ref_seq');
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  -- ---------------- INSERT: strip every admin-managed field ----------------
  if tg_op = 'INSERT' then
    new.verified        := false;
    new.featured        := false;
    new.favorite_count  := 0;
    new.published_at    := null;
    new.created_by      := auth.uid();

    if new.publication_status not in ('draft', 'pending_review') then
      raise exception 'a new listing starts as draft or pending_review'
        using errcode = '42501';
    end if;

    new.roi_pct                := null;
    new.rental_yield_pct       := null;
    new.monthly_rent_usd_cents := null;
    new.amortization_years     := null;
    new.investment_score       := null;
    new.growth_score           := null;
    new.risk_level             := null;
    new.market_trend           := null;
    new.metrics_source         := 'manual';
    new.metrics_updated_at     := null;

    return new;
  end if;

  -- ---------------- UPDATE: reject changes to protected columns ------------
  if new.verified        is distinct from old.verified
  or new.featured        is distinct from old.featured
  or new.partner_id      is distinct from old.partner_id
  or new.favorite_count  is distinct from old.favorite_count
  or new.reference_code  is distinct from old.reference_code
  or new.published_at    is distinct from old.published_at
  or new.created_by      is distinct from old.created_by
  -- price_usd_cents is derived. Without this check a partner could update it
  -- alone (the price trigger only fires on price_amount/price_currency) and
  -- make an expensive listing sort as cheap.
  or new.price_usd_cents is distinct from old.price_usd_cents
  then
    raise exception
      'verified, featured, partner_id, reference_code, derived price and '
      'counters are administered by Mizan Invest'
      using errcode = '42501';
  end if;

  if new.roi_pct                is distinct from old.roi_pct
  or new.rental_yield_pct       is distinct from old.rental_yield_pct
  or new.monthly_rent_usd_cents is distinct from old.monthly_rent_usd_cents
  or new.amortization_years     is distinct from old.amortization_years
  or new.investment_score       is distinct from old.investment_score
  or new.growth_score           is distinct from old.growth_score
  or new.risk_level             is distinct from old.risk_level
  or new.market_trend           is distinct from old.market_trend
  or new.metrics_source         is distinct from old.metrics_source
  or new.metrics_updated_at     is distinct from old.metrics_updated_at
  then
    raise exception
      'investment metrics are calculated by Mizan Invest and cannot be '
      'edited by a partner'
      using errcode = '42501';
  end if;

  if new.publication_status is distinct from old.publication_status
     and not (new.publication_status in ('draft', 'pending_review')
              and old.publication_status in ('draft', 'pending_review'))
  then
    raise exception 'only an admin may publish, unpublish or archive'
      using errcode = '42501';
  end if;

  if new.deleted_at is distinct from old.deleted_at then
    raise exception 'only an admin may delete a listing' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger trg_properties_guard_privileged
  before insert or update on public.properties
  for each row execute function public.tg_properties_guard_privileged();

-- -----------------------------------------------------------------------------
-- Keep partners.listings_count honest (published, non-deleted only)
-- -----------------------------------------------------------------------------
-- Sets mizan.internal so the partners guard permits the counter write.
-- set_config(..., true) scopes the setting to the current TRANSACTION.
create or replace function public.tg_properties_sync_listing_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('mizan.internal', 'on', true);

  if tg_op in ('INSERT', 'UPDATE') then
    update public.partners p
       set listings_count = (
         select count(*) from public.properties x
         where x.partner_id = p.id
           and x.publication_status = 'published'
           and x.deleted_at is null)
     where p.id = new.partner_id;
  end if;

  if tg_op = 'UPDATE' and old.partner_id is distinct from new.partner_id then
    update public.partners p
       set listings_count = (
         select count(*) from public.properties x
         where x.partner_id = p.id
           and x.publication_status = 'published'
           and x.deleted_at is null)
     where p.id = old.partner_id;
  end if;

  perform set_config('mizan.internal', 'off', true);
  return null;
end;
$$;

create trigger trg_properties_sync_listing_count
  after insert or update of partner_id, publication_status, deleted_at
  on public.properties
  for each row execute function public.tg_properties_sync_listing_count();

-- =============================================================================
-- property_translations
-- =============================================================================
-- Sidecar table, not jsonb and not title_en/title_ru columns: gives per-
-- language full-text indexing, natural partial translations, and a new
-- language costs zero DDL.
create table public.property_translations (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  language    public.app_language not null,
  title       text not null,
  description text,
  highlights  text[],
  is_machine_translated boolean not null default false,

  -- 'simple', NOT 'english': PostgreSQL ships no Arabic stemmer, and running
  -- the English configuration over Arabic produces garbage tokens. pg_trgm
  -- covers fuzzy matching.
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint prop_tr_title_len
    check (char_length(title) between 3 and 200),
  constraint prop_tr_desc_len
    check (description is null or char_length(description) <= 8000),
  constraint prop_tr_highlights_len
    check (highlights is null or array_length(highlights, 1) <= 10),

  constraint prop_tr_no_contact_title
    check (not public.contains_contact_info(title)),
  constraint prop_tr_no_contact_desc
    check (not public.contains_contact_info(description)),
  constraint prop_tr_no_contact_highlights
    check (not public.array_contains_contact_info(highlights)),

  constraint uq_prop_tr unique (property_id, language)
);

create trigger trg_prop_tr_updated_at
  before update on public.property_translations
  for each row execute function public.tg_set_updated_at();

-- =============================================================================
-- property_media
-- =============================================================================
-- Stores PATHS, never URLs. A URL hardcodes bucket, CDN domain and transform
-- parameters; a path survives a CDN migration.
create table public.property_media (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid not null references public.properties(id) on delete cascade,
  media_type       public.media_type not null,
  storage_bucket   text not null,
  storage_path     text not null,
  sort_order       smallint not null default 0,
  is_cover         boolean not null default false,
  width            integer,
  height           integer,
  duration_seconds numeric(7,2),
  byte_size        bigint,
  blurhash         text,
  alt_text         text,
  uploaded_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  deleted_at       timestamptz,

  constraint media_sort_nonneg check (sort_order >= 0),
  constraint media_width_pos   check (width  is null or width  > 0),
  constraint media_height_pos  check (height is null or height > 0),
  constraint media_duration_pos
    check (duration_seconds is null or duration_seconds > 0),
  constraint media_size_range
    check (byte_size is null or (byte_size > 0 and byte_size < 524288000)),
  constraint media_cover_is_image
    check (not is_cover or media_type = 'image'),
  -- alt_text is publicly readable: block contact details here too.
  constraint media_no_contact_alt
    check (not public.contains_contact_info(alt_text)),

  constraint uq_media_object unique (storage_bucket, storage_path)
);

comment on table public.property_media is
  'CASCADE deletes ROWS, not storage FILES. Hard-deleting a property orphans '
  'its bytes. Mitigated because partners cannot set deleted_at and hold no '
  'DELETE grant, so only an admin can hard-delete. A reconciliation job is '
  'Phase 4/11 work.';

-- Exactly one cover image per property: a database guarantee, not a convention.
create unique index uq_media_one_cover
  on public.property_media (property_id)
  where is_cover and deleted_at is null;

-- DEFERRABLE so drag-to-reorder can rewrite every row inside one transaction
-- without tripping over itself mid-update.
alter table public.property_media
  add constraint uq_media_order unique (property_id, sort_order)
  deferrable initially deferred;

-- =============================================================================
-- EXECUTE privileges
-- =============================================================================
-- All five are trigger functions. PostgreSQL refuses a direct call
-- ("trigger functions can only be called as triggers") and firing a trigger
-- does NOT require the invoking user to hold EXECUTE, so none is granted.
-- They are revoked explicitly because Supabase's default privileges grant
-- EXECUTE to anon/authenticated at creation time.
revoke execute on function public.tg_properties_validate_geo()       from public, anon, authenticated;
revoke execute on function public.tg_properties_set_price_usd()      from public, anon, authenticated;
revoke execute on function public.tg_properties_stamp_published()    from public, anon, authenticated;
revoke execute on function public.tg_properties_guard_privileged()   from public, anon, authenticated;
revoke execute on function public.tg_properties_sync_listing_count() from public, anon, authenticated;

-- =============================================================================
-- Indexes
-- =============================================================================
create index idx_prop_browse on public.properties (publication_status, published_at desc)
  where deleted_at is null;
create index idx_prop_city on public.properties (city_id, published_at desc)
  where deleted_at is null and publication_status = 'published';
create index idx_prop_country on public.properties (country_id, published_at desc)
  where deleted_at is null and publication_status = 'published';
create index idx_prop_type on public.properties (property_type, price_usd_cents)
  where deleted_at is null and publication_status = 'published';
create index idx_prop_price on public.properties (price_usd_cents)
  where deleted_at is null and publication_status = 'published';
create index idx_prop_roi on public.properties (roi_pct desc nulls last)
  where deleted_at is null and publication_status = 'published';
create index idx_prop_featured on public.properties (published_at desc)
  where featured and deleted_at is null and publication_status = 'published';
create index idx_prop_partner on public.properties (partner_id, publication_status);

create index idx_prop_tr_fts on public.property_translations using gin (search_vector);
create index idx_prop_tr_trgm on public.property_translations
  using gin (title extensions.gin_trgm_ops);
create index idx_prop_tr_lookup on public.property_translations (property_id, language);

create index idx_media_prop on public.property_media (property_id, sort_order)
  where deleted_at is null;
