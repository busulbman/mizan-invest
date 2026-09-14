-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 05 of 11
-- 20260914000500_partners.sql
-- partners (PUBLIC) · partner_translations · partner_members
-- private.partner_private (FIREWALLED)
-- =============================================================================
-- THE BROKER MODEL
--   Customers browse a partner's listings but never see the partner's phone,
--   WhatsApp or email. Every enquiry goes to Mizan Invest, which connects the
--   customer to the partner manually. Contact data therefore lives in a
--   SEPARATE SCHEMA that PostgREST does not serve.
-- =============================================================================

create table public.partners (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  display_name   text not null,
  logo_path      text,
  country_id     uuid not null references public.countries(id) on delete restrict,
  rating         numeric(2,1),
  listings_count integer not null default 0,
  verified       boolean not null default false,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,

  constraint partners_slug_fmt
    check (slug ~ '^[a-z0-9-]{3,60}$'),
  constraint partners_name_len
    check (char_length(display_name) between 2 and 120),
  constraint partners_rating_range
    check (rating is null or rating between 0 and 5),
  constraint partners_listings_count_nonneg
    check (listings_count >= 0),

  -- Contact details may not hide inside the public brand name.
  constraint partners_no_contact_in_name
    check (not public.contains_contact_info(display_name))
);

comment on table public.partners is
  'PUBLIC partner surface. Contains NO contact data of any kind - that lives '
  'in private.partner_private, which the mobile client cannot reach.';

create index idx_partners_active
  on public.partners (country_id)
  where is_active and deleted_at is null;

create trigger trg_partners_updated_at
  before update on public.partners
  for each row execute function public.tg_set_updated_at();


create table public.partner_translations (
  id         uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  language   public.app_language not null,
  about      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint partner_tr_about_len
    check (about is null or char_length(about) <= 4000),
  constraint partner_tr_no_contact
    check (not public.contains_contact_info(about)),
  constraint uq_partner_tr unique (partner_id, language)
);

create trigger trg_partner_tr_updated_at
  before update on public.partner_translations
  for each row execute function public.tg_set_updated_at();


create table public.partner_members (
  id          uuid primary key default gen_random_uuid(),
  partner_id  uuid not null references public.partners(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  member_role public.partner_member_role not null default 'agent',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint uq_partner_member unique (partner_id, user_id)
);

comment on table public.partner_members is
  'Links an auth user to a partner organisation. '
  'DO NOT ENABLE "FORCE ROW LEVEL SECURITY" ON THIS TABLE: my_partner_ids() '
  'reads it and its own policies call my_partner_ids(). Owner-bypass is what '
  'breaks the cycle.';

create index idx_partner_members_user
  on public.partner_members (user_id)
  where is_active;

create index idx_partner_members_partner
  on public.partner_members (partner_id)
  where is_active;

create trigger trg_partner_members_updated_at
  before update on public.partner_members
  for each row execute function public.tg_set_updated_at();

-- -----------------------------------------------------------------------------
-- Partner-membership helper
-- -----------------------------------------------------------------------------
-- Defined here (not step 02) because it is LANGUAGE sql and is validated against
-- public.partner_members at CREATE time.
create or replace function public.my_partner_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pm.partner_id
  from public.partner_members pm
  where pm.user_id = auth.uid()
    and pm.is_active;
$$;

create or replace function public.is_member_of_partner(p_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.partner_members pm
    where pm.user_id = auth.uid()
      and pm.partner_id = p_partner_id
      and pm.is_active
  );
$$;

revoke execute on function public.my_partner_ids()           from public, anon, authenticated;
revoke execute on function public.is_member_of_partner(uuid) from public, anon, authenticated;

-- my_partner_ids() is referenced by 9 RLS policies, all TO authenticated. A
-- policy expression requires the CALLER to hold EXECUTE, so a partner cannot
-- read or write their own rows without it. No anon policy references it.
grant execute on function public.my_partner_ids() to authenticated;

-- is_member_of_partner() is referenced by no policy and no client code path.
-- Defined for future use, exposed to nobody.

-- -----------------------------------------------------------------------------
-- Privileged-column guard for partners
-- -----------------------------------------------------------------------------
-- Column-level GRANTs cannot express this: admins and partners are BOTH the
-- `authenticated` PostgreSQL role, so the distinction must be made at runtime.
--
-- Two bypasses, both deliberate:
--   1. auth.uid() IS NULL  -> no JWT: this is a migration, the SQL editor, or
--      service_role. Safe because `anon` holds no UPDATE grant on this table
--      and therefore can never reach this trigger.
--   2. mizan.internal = on -> an internal counter-sync trigger is running.
--      Without this, a partner creating a listing would trip the
--      listings_count check and the insert would fail.
create or replace function public.tg_partners_guard_privileged()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('mizan.internal', true), 'off') = 'on' then
    return new;
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.verified       is distinct from old.verified
  or new.rating         is distinct from old.rating
  or new.listings_count is distinct from old.listings_count
  or new.slug           is distinct from old.slug
  or new.is_active      is distinct from old.is_active
  or new.deleted_at     is distinct from old.deleted_at
  or new.country_id     is distinct from old.country_id
  then
    raise exception
      'verified, rating, listings_count, slug, is_active, deleted_at and '
      'country_id are administered by Mizan Invest'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- Trigger function: never called directly, exposed to nobody.
revoke execute on function public.tg_partners_guard_privileged() from public, anon, authenticated;

create trigger trg_partners_guard_privileged
  before update on public.partners
  for each row execute function public.tg_partners_guard_privileged();

-- =============================================================================
-- THE FIREWALL — private.partner_private
-- =============================================================================
-- PostgREST serves the `public` schema (and graphql_public). A table in
-- `private` has NO API ROUTE AT ALL. That is a stronger guarantee than RLS:
-- there is no endpoint to attack, not merely a policy that denies.
--
-- Phase 1 posture: COMPLETELY CLOSED.
--   No anon access. No authenticated access. No partner access.
--   No admin RPC. Not even the owning partner may read their own row.
--
-- Phase 12 will expose this through an admin backend / Edge Function that
-- validates the admin role AND writes an audit-log entry before reading.
-- =============================================================================

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create table private.partner_private (
  partner_id      uuid primary key
                  references public.partners(id) on delete restrict,
  contact_name    text,
  phone           text,
  whatsapp        text,
  email           extensions.citext,
  commission_rate numeric(5,2),
  contract_ref    text,
  internal_notes  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint pp_phone_e164
    check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint pp_whatsapp_e164
    check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  constraint pp_email_fmt
    check (email is null or email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$'),
  constraint pp_commission_range
    check (commission_rate is null or commission_rate between 0 and 100)
);

comment on table private.partner_private is
  'NEVER reachable from the mobile client. ON DELETE RESTRICT protects '
  'commission history: a partner cannot be deleted while contract terms exist.';

revoke all on private.partner_private from public;
revoke all on private.partner_private from anon;
revoke all on private.partner_private from authenticated;

-- Defence in depth: even if a schema grant is ever added by mistake, RLS with
-- zero policies yields zero rows.
alter table private.partner_private enable row level security;

create trigger trg_partner_private_updated_at
  before update on private.partner_private
  for each row execute function public.tg_set_updated_at();
