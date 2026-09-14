-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 10 of 11
-- 20260914001000_rls.sql
-- Grants and Row Level Security
-- =============================================================================
-- THREAT MODEL: the Expo publishable key is PUBLIC. Table names, endpoints and
-- IDs are all discoverable. Nothing here depends on hiding any of them.
--
-- ENABLE, NOT FORCE.
--   FORCE removes the TABLE OWNER's exemption from RLS. In Supabase the owner
--   is `postgres`, which is exactly the identity a SECURITY DEFINER function
--   runs as - so FORCE breaks every helper and the create_lead RPC. It also
--   buys nothing: anon / authenticated / service_role are never the owner, so
--   plain ENABLE already governs 100% of client traffic.
--
-- EXPLICIT PER-TABLE GRANTS.
--   No "ALL TABLES IN SCHEMA public" statements: future unrelated tables must
--   not be silently affected by this migration.
--
-- FUNCTION EXECUTE PRIVILEGES are set in each defining migration, immediately
-- after the function is created, so there is never a window of exposure. The
-- resulting matrix is:
--
--   anon          create_lead
--                 (nothing else - a guest needs exactly one entry point)
--
--   authenticated create_lead
--                 merge_guest_favorites
--                 is_admin, is_super_admin, my_partner_ids   (required by RLS)
--                 contains_contact_info, array_contains_contact_info,
--                 lead_source_requires_contact               (required by CHECK)
--
--   nobody        has_role, is_member_of_partner, client_fingerprint,
--                 and all 12 tg_* trigger functions
--
-- Rule for any function added later: REVOKE from public, anon AND authenticated
-- explicitly, then GRANT back only what is provably required. REVOKE FROM PUBLIC
-- alone does NOT undo Supabase's default anon/authenticated grants.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Reset default privileges on the tables this migration set created
-- -----------------------------------------------------------------------------
revoke all on public.profiles              from anon, authenticated;
revoke all on public.user_roles            from anon, authenticated;
revoke all on public.countries             from anon, authenticated;
revoke all on public.cities                from anon, authenticated;
revoke all on public.country_translations  from anon, authenticated;
revoke all on public.city_translations     from anon, authenticated;
revoke all on public.partners              from anon, authenticated;
revoke all on public.partner_translations  from anon, authenticated;
revoke all on public.partner_members       from anon, authenticated;
revoke all on public.properties            from anon, authenticated;
revoke all on public.property_translations from anon, authenticated;
revoke all on public.property_media        from anon, authenticated;
revoke all on public.favorites             from anon, authenticated;
revoke all on public.leads                 from anon, authenticated;
revoke all on public.fx_rates              from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------
alter table public.profiles              enable row level security;
alter table public.countries             enable row level security;
alter table public.cities                enable row level security;
alter table public.country_translations  enable row level security;
alter table public.city_translations     enable row level security;
alter table public.partners              enable row level security;
alter table public.partner_translations  enable row level security;
alter table public.properties            enable row level security;
alter table public.property_translations enable row level security;
alter table public.property_media        enable row level security;
alter table public.favorites             enable row level security;
alter table public.leads                 enable row level security;
alter table public.fx_rates              enable row level security;

-- These two are read by SECURITY DEFINER helpers whose results their own
-- policies depend on. ENABLE only - FORCE would recurse infinitely.
alter table public.user_roles            enable row level security;
alter table public.partner_members       enable row level security;

-- private.partner_private had RLS enabled in step 05 and has ZERO policies and
-- ZERO grants. It is intentionally absent from this file.

-- =============================================================================
-- profiles
-- =============================================================================
grant select, insert, update on public.profiles to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() and deleted_at is null);

create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() and deleted_at is null)
  with check (id = auth.uid());

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- user_roles
-- =============================================================================
-- SELECT only for clients. Roles are assigned by service_role or the SQL
-- console; there is no client write path at all, by design.
grant select on public.user_roles to authenticated;

create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

create policy user_roles_select_admin on public.user_roles
  for select to authenticated
  using (public.is_admin());

create policy user_roles_write_super_admin on public.user_roles
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- =============================================================================
-- Reference data — readable by guests
-- =============================================================================
grant select on public.countries            to anon, authenticated;
grant select on public.cities               to anon, authenticated;
grant select on public.country_translations to anon, authenticated;
grant select on public.city_translations    to anon, authenticated;
grant select on public.fx_rates             to anon, authenticated;

create policy countries_read on public.countries
  for select to anon, authenticated using (is_active);
create policy countries_write_admin on public.countries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy cities_read on public.cities
  for select to anon, authenticated using (is_active);
create policy cities_write_admin on public.cities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy country_tr_read on public.country_translations
  for select to anon, authenticated using (true);
create policy country_tr_write_admin on public.country_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy city_tr_read on public.city_translations
  for select to anon, authenticated using (true);
create policy city_tr_write_admin on public.city_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy fx_read on public.fx_rates
  for select to anon, authenticated using (true);
create policy fx_write_admin on public.fx_rates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- partners
-- =============================================================================
grant select on public.partners to anon, authenticated;
grant update on public.partners to authenticated;

grant select on public.partner_translations to anon, authenticated;
grant insert, update, delete on public.partner_translations to authenticated;

grant select on public.partner_members to authenticated;
-- No INSERT/UPDATE/DELETE grant on partner_members for any client role: a
-- partner must never be able to add themselves to another organisation.

create policy partners_read_public on public.partners
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy partners_read_own on public.partners
  for select to authenticated
  using (id in (select public.my_partner_ids()));

create policy partners_read_admin on public.partners
  for select to authenticated
  using (public.is_admin());

-- Editable fields reduce to display_name and logo_path: everything else is
-- rejected by trg_partners_guard_privileged (step 05).
create policy partners_update_member on public.partners
  for update to authenticated
  using (id in (select public.my_partner_ids()) and deleted_at is null)
  with check (id in (select public.my_partner_ids()));

create policy partners_all_admin on public.partners
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- The EXISTS subquery is evaluated under the CALLER's RLS, so translations of
-- a deactivated partner are automatically invisible. It is deliberately NOT a
-- SECURITY DEFINER helper: a definer function would bypass RLS and leak.
create policy partner_tr_read on public.partner_translations
  for select to anon, authenticated
  using (exists (select 1 from public.partners p where p.id = partner_id));

create policy partner_tr_write_member on public.partner_translations
  for all to authenticated
  using (partner_id in (select public.my_partner_ids()))
  with check (partner_id in (select public.my_partner_ids()));

create policy partner_tr_all_admin on public.partner_translations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy partner_members_read_own on public.partner_members
  for select to authenticated
  using (user_id = auth.uid());

create policy partner_members_read_roster on public.partner_members
  for select to authenticated
  using (partner_id in (select public.my_partner_ids()));

create policy partner_members_all_admin on public.partner_members
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- properties
-- =============================================================================
grant select on public.properties to anon, authenticated;
grant insert, update on public.properties to authenticated;
-- No DELETE grant for any client role. Retiring a listing sets deleted_at,
-- and only an admin may do that (step 07 guard).

create policy properties_read_published on public.properties
  for select to anon, authenticated
  using (publication_status = 'published' and deleted_at is null);

create policy properties_read_own on public.properties
  for select to authenticated
  using (partner_id in (select public.my_partner_ids()));

create policy properties_read_admin on public.properties
  for select to authenticated
  using (public.is_admin());

create policy properties_insert_member on public.properties
  for insert to authenticated
  with check (
    partner_id in (select public.my_partner_ids())
    and publication_status in ('draft', 'pending_review')
    and verified = false
    and featured = false
  );

create policy properties_update_member on public.properties
  for update to authenticated
  using (partner_id in (select public.my_partner_ids()) and deleted_at is null)
  with check (partner_id in (select public.my_partner_ids()));

create policy properties_all_admin on public.properties
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- property_translations / property_media
-- =============================================================================
grant select on public.property_translations to anon, authenticated;
grant insert, update, delete on public.property_translations to authenticated;

grant select on public.property_media to anon, authenticated;
grant insert, update, delete on public.property_media to authenticated;

create policy prop_tr_read on public.property_translations
  for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id));

create policy prop_tr_write_member on public.property_translations
  for all to authenticated
  using (exists (select 1 from public.properties p
                 where p.id = property_id
                   and p.partner_id in (select public.my_partner_ids())))
  with check (exists (select 1 from public.properties p
                 where p.id = property_id
                   and p.partner_id in (select public.my_partner_ids())));

create policy prop_tr_all_admin on public.property_translations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy prop_media_read on public.property_media
  for select to anon, authenticated
  using (deleted_at is null
         and exists (select 1 from public.properties p where p.id = property_id));

create policy prop_media_write_member on public.property_media
  for all to authenticated
  using (exists (select 1 from public.properties p
                 where p.id = property_id
                   and p.partner_id in (select public.my_partner_ids())))
  with check (exists (select 1 from public.properties p
                 where p.id = property_id
                   and p.partner_id in (select public.my_partner_ids())));

create policy prop_media_all_admin on public.property_media
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- favorites
-- =============================================================================
grant select, insert, delete on public.favorites to authenticated;

create policy favorites_all_own on public.favorites
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =============================================================================
-- leads
-- =============================================================================
-- NO INSERT grant: public.create_lead() is the only path in, for guests and
--   signed-in users alike.
-- NO DELETE grant: plus the BEFORE DELETE trigger in step 09.
-- NO partner SELECT: LOCKED DECISION. Partners have no direct read access to
--   leads in Phase 1. The workflow is customer -> Mizan Invest -> partner,
--   connected manually. A masked partner inbox will be designed separately.
grant select, update on public.leads to authenticated;

create policy leads_select_own on public.leads
  for select to authenticated
  using (user_id is not null and user_id = auth.uid());

create policy leads_select_admin on public.leads
  for select to authenticated
  using (public.is_admin());

create policy leads_update_admin on public.leads
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- Sequence
-- =============================================================================
grant usage on sequence public.property_ref_seq to authenticated;
