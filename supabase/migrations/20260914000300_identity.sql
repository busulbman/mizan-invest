-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 03 of 11
-- 20260914000300_identity.sql
-- profiles, user_roles, and the role helper functions
-- =============================================================================
-- Role helpers are defined HERE, not in step 02, because they are LANGUAGE sql
-- and are validated against public.user_roles at CREATE time.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- id is BOTH the primary key AND the foreign key to auth.users: one-to-one,
-- no surrogate key, no way to desync.
--
-- Email, phone, password and provider state live in auth.users and are NEVER
-- duplicated here.
create table public.profiles (
  id                      uuid primary key
                          references auth.users(id) on delete cascade,
  full_name               text,
  avatar_path             text,
  preferred_language      public.app_language  not null default 'en',
  preferred_currency      public.currency_code not null default 'USD',
  onboarding_completed_at timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz,

  constraint profiles_full_name_len
    check (full_name is null or char_length(full_name) between 1 and 120),
  constraint profiles_avatar_path_len
    check (avatar_path is null or char_length(avatar_path) <= 400)
);

comment on table public.profiles is
  'Display data and preferences only. Identity lives in auth.users. '
  'onboarding_completed_at moves onboarding state off the device so it '
  'follows the person across reinstalls and platforms.';

create index idx_profiles_active on public.profiles (id) where deleted_at is null;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- -----------------------------------------------------------------------------
-- user_roles — the authorization root
-- -----------------------------------------------------------------------------
create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,

  constraint user_roles_revoked_after_granted
    check (revoked_at is null or revoked_at >= granted_at)
);

comment on table public.user_roles is
  'AUTHORITATIVE role assignment. NEVER read authorization from '
  'auth.users.raw_user_meta_data - users can update their own metadata, which '
  'would be privilege escalation. '
  'DO NOT ENABLE "FORCE ROW LEVEL SECURITY" ON THIS TABLE: the SECURITY '
  'DEFINER helpers below read it, and its own policies call those helpers. '
  'Owner-bypass is what breaks the cycle. FORCE would cause infinite recursion.';

-- One live grant per (user, role). Revoked rows may repeat.
create unique index uq_user_roles_active
  on public.user_roles (user_id, role)
  where revoked_at is null;

create index idx_user_roles_lookup
  on public.user_roles (user_id)
  where revoked_at is null;

-- -----------------------------------------------------------------------------
-- Role helper functions
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER so they read user_roles regardless of that table's own
-- policies. SET search_path = '' is mandatory: without it a malicious
-- search_path can hijack execution of a definer function.
--
-- STABLE means PostgreSQL evaluates these once per statement rather than once
-- per row, so the cost inside an RLS policy is negligible given the index above.
--
-- Deliberately a table lookup rather than a JWT claim: a claim is stale until
-- the token refreshes (up to an hour), and revoking a compromised admin must
-- take effect immediately.
create or replace function public.has_role(p_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = p_role
      and ur.revoked_at is null
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'super_admin')
      and ur.revoked_at is null
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'super_admin'
      and ur.revoked_at is null
  );
$$;

-- REVOKE ... FROM PUBLIC alone does NOT remove Supabase's default
-- anon/authenticated grants. See the helpers migration header.
revoke execute on function public.has_role(public.app_role) from public, anon, authenticated;
revoke execute on function public.is_admin()                from public, anon, authenticated;
revoke execute on function public.is_super_admin()          from public, anon, authenticated;

-- is_admin() is referenced by 18 RLS policies, is_super_admin() by the
-- user_roles write policy - all of them TO authenticated. A policy expression
-- requires the CALLER to hold EXECUTE, so without these grants every
-- authenticated SELECT on a guarded table fails with "permission denied".
-- No anon policy references either function, so anon is NOT granted.
grant execute on function public.is_admin()       to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- has_role() is referenced by no policy and no client code path. It stays
-- defined for future use but is exposed to nobody.

-- -----------------------------------------------------------------------------
-- auth.users -> profiles
-- -----------------------------------------------------------------------------
-- The ONLY object in Phase 1 that touches the auth schema.
--
-- SECURITY: reads DISPLAY DATA ONLY from signup metadata.
--   NEVER role. NEVER partner_id. NEVER admin state. NEVER any authorization
--   signal. Those come exclusively from public.user_roles and
--   public.partner_members, which no client role may write.
--
-- full_name is additionally sanitized so signup metadata cannot be used to
-- smuggle a phone number or email into a stored field.
create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');

  if v_name is not null and char_length(v_name) > 120 then
    v_name := left(v_name, 120);
  end if;

  if public.contains_contact_info(v_name) then
    v_name := null;
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, v_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger function: never called directly, exposed to nobody.
revoke execute on function public.tg_handle_new_user() from public, anon, authenticated;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();
