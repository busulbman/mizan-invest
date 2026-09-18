-- =============================================================================
-- MIZAN INVEST — PRE-TESTFLIGHT
-- 20260919090000_avatars_logos_account_deletion.sql
-- User avatars, partner logos, and self-service account deletion
-- =============================================================================
-- NON-DESTRUCTIVE
--   No table is dropped, altered or rewritten. No column is added: the schema
--   already carries profiles.avatar_path and partners.logo_path from Phase 1,
--   and both are already writable under existing RLS
--   (profiles_update_own, partners_update_member). This migration only adds:
--     1. two private storage buckets and their policies
--     2. one read helper used by a storage policy
--     3. one account-deletion RPC
--
-- NO NEW CASCADES
--   Account deletion deliberately adds NO foreign key and changes NO existing
--   ON DELETE rule. The Phase 1 relationships are already correct for this:
--     leads.user_id            -> SET NULL   (leads survive, snapshots intact)
--     leads.assigned_admin     -> SET NULL
--     properties.created_by    -> SET NULL   (listings survive)
--     property_media.uploaded_by -> SET NULL
--     activity_log.actor_id    -> SET NULL   (audit trail survives)
--     profiles / user_roles / partner_members / favorites
--     / partner_applications   -> CASCADE    (personal data only)
--   Deleting an auth user therefore removes that person's own rows and
--   anonymises their attribution, without destroying a single lead, listing,
--   media row or audit entry.
-- =============================================================================


-- =============================================================================
-- 1. BUCKETS
-- =============================================================================
-- Both are PRIVATE. Nothing is served by a guessable public URL; every read
-- goes through a signed URL, which means the policies below are actually the
-- access boundary rather than decoration.
--
-- 5 MB and an image-only MIME allowlist: an avatar or a logo is a small image,
-- and a narrow allowlist is the cheapest way to keep video and arbitrary
-- payloads out of a bucket that is writable by every signed-in user.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('partner-logos', 'partner-logos', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;


-- =============================================================================
-- 2. READ HELPER FOR THE PUBLIC LOGO POLICY
-- =============================================================================
-- A partner logo is public identity, so anon must be able to read it — but only
-- for a partner that is actually live. This is a SECURITY DEFINER helper rather
-- than an inline EXISTS on public.partners so the storage policy does not
-- depend on the caller's own SELECT grants on partners.
--
-- It leaks nothing: it answers one boolean about a partner id the caller
-- already possesses (it is the folder name they are asking to read).
create or replace function public.is_public_partner(p_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.partners p
    where p.id = p_partner_id
      and p.is_active
      and p.deleted_at is null
  );
$$;

-- Supabase's default grants are not a substitute for an explicit matrix:
-- REVOKE from PUBLIC alone does not remove the anon/authenticated defaults.
revoke execute on function public.is_public_partner(uuid) from public, anon, authenticated;

-- A policy expression is evaluated as the CALLER, so both roles that the
-- storage SELECT policy names must hold EXECUTE or the read fails.
grant execute on function public.is_public_partner(uuid) to anon, authenticated;


-- =============================================================================
-- 3. AVATAR POLICIES — strictly self-service
-- =============================================================================
-- Every policy keys off the FIRST PATH SEGMENT being the caller's own uid:
--     avatars/<user_id>/<file>
-- storage.foldername(name)[1] is therefore load-bearing. The client helper
-- builds exactly this shape; a client that tries any other prefix is rejected
-- here rather than trusted.

drop policy if exists avatars_select_own on storage.objects;
create policy avatars_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Admins can see avatars for moderation. Read only: an admin has no policy
-- below that lets them overwrite someone's avatar.
drop policy if exists avatars_select_admin on storage.objects;
create policy avatars_select_admin on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- USING and WITH CHECK are both constrained: without WITH CHECK a caller could
-- rename their own object into another user's folder.
drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- =============================================================================
-- 4. PARTNER LOGO POLICIES
-- =============================================================================
-- Path shape:  partner-logos/<partner_id>/<file>
--
-- READ is public (anon included) but only for a live partner, because the logo
-- appears next to listings that anon can already browse.
-- WRITE is restricted to an ACTIVE MEMBER of that exact partner, which is the
-- same boundary the partners_update_member table policy applies to
-- partners.logo_path — the two cannot drift apart.

drop policy if exists partner_logos_select_public on storage.objects;
create policy partner_logos_select_public on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'partner-logos'
    and public.is_public_partner(((storage.foldername(name))[1])::uuid)
  );

-- A member must still be able to see the logo of a partner that is not yet
-- activated, otherwise a new partner cannot preview what they just uploaded.
drop policy if exists partner_logos_select_member on storage.objects;
create policy partner_logos_select_member on storage.objects
  for select to authenticated
  using (
    bucket_id = 'partner-logos'
    and ((storage.foldername(name))[1])::uuid in (select public.my_partner_ids())
  );

drop policy if exists partner_logos_insert_member on storage.objects;
create policy partner_logos_insert_member on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'partner-logos'
    and ((storage.foldername(name))[1])::uuid in (select public.my_partner_ids())
  );

drop policy if exists partner_logos_update_member on storage.objects;
create policy partner_logos_update_member on storage.objects
  for update to authenticated
  using (
    bucket_id = 'partner-logos'
    and ((storage.foldername(name))[1])::uuid in (select public.my_partner_ids())
  )
  with check (
    bucket_id = 'partner-logos'
    and ((storage.foldername(name))[1])::uuid in (select public.my_partner_ids())
  );

drop policy if exists partner_logos_delete_member on storage.objects;
create policy partner_logos_delete_member on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'partner-logos'
    and ((storage.foldername(name))[1])::uuid in (select public.my_partner_ids())
  );

-- Admins administer partner identity.
drop policy if exists partner_logos_all_admin on storage.objects;
create policy partner_logos_all_admin on storage.objects
  for all to authenticated
  using (bucket_id = 'partner-logos' and public.is_admin())
  with check (bucket_id = 'partner-logos' and public.is_admin());


-- =============================================================================
-- 5. ACCOUNT DELETION
-- =============================================================================
-- WHY AN RPC AND NOT A CLIENT DELETE
--   The client holds only the publishable key. It has no grant on auth.users
--   and must never have one. Deleting an auth user is a privileged action, so
--   it runs inside a SECURITY DEFINER function that the caller may execute but
--   cannot parameterise.
--
-- WHY THERE IS NO user_id ARGUMENT
--   This is the security property that matters: the function takes NO
--   arguments and always acts on auth.uid(). There is no input to tamper with,
--   so "delete an arbitrary user id" is not a request this API can express —
--   that is stronger than validating an argument.
--
-- WHY IT CAN REFUSE
--   Two states would damage the business if the row simply vanished, and both
--   are refused with a clear message instead of being forced through with a
--   CASCADE:
--     1. the caller is the ONLY active owner of a partner that still has live
--        listings — deleting them would leave listings nobody can manage
--     2. the caller is the LAST active super_admin — deleting them would lock
--        the organisation out of its own admin surface
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_blocking_partner text;
begin
  if v_uid is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  -- 1. Sole active owner of a partner that still has listings worth managing.
  --    'archived' is excluded: an archived listing needs no active owner.
  select p.display_name
    into v_blocking_partner
  from public.partner_members me
  join public.partners p on p.id = me.partner_id
  where me.user_id = v_uid
    and me.is_active
    and me.member_role = 'owner'
    and not exists (
      select 1
      from public.partner_members other
      where other.partner_id = me.partner_id
        and other.user_id <> v_uid
        and other.is_active
        and other.member_role = 'owner'
    )
    and exists (
      select 1
      from public.properties pr
      where pr.partner_id = me.partner_id
        and pr.publication_status <> 'archived'
        and pr.deleted_at is null
    )
  limit 1;

  if v_blocking_partner is not null then
    raise exception
      'You are the only owner of % and it still has active listings. Transfer ownership or contact Mizan Invest before deleting this account.',
      v_blocking_partner
      using errcode = 'P0001';
  end if;

  -- 2. Last remaining super_admin.
  if exists (
    select 1 from public.user_roles r
    where r.user_id = v_uid and r.role = 'super_admin' and r.revoked_at is null
  ) and not exists (
    select 1 from public.user_roles r
    where r.role = 'super_admin' and r.revoked_at is null and r.user_id <> v_uid
  ) then
    raise exception
      'This is the last super admin account and cannot be deleted.'
      using errcode = 'P0001';
  end if;

  -- 3. Delete the identity. Everything else follows the FK rules documented at
  --    the top of this file: personal rows cascade, attribution is set null.
  --    Leads, listings, media and the audit trail all survive.
  --
  --    STORAGE IS NOT TOUCHED HERE, DELIBERATELY.
  --    Supabase installs a trigger that rejects direct DML on storage.objects
  --    ("Direct deletion from storage tables is not allowed. Use the Storage
  --    API instead."), and it is right to: a raw row delete would drop the
  --    bookkeeping row while leaving the actual file bytes behind in the
  --    storage backend. The client therefore removes the avatar through the
  --    Storage API BEFORE calling this function, which deletes both.
  --    If that best-effort cleanup fails the object is still unreachable:
  --    every avatar policy requires foldername[1] = auth.uid(), and this uid
  --    will never be issued again.
  --
  --    mizan.internal IS REQUIRED HERE, and this is not incidental.
  --    Deleting the auth row makes PostgreSQL run the ON DELETE SET NULL
  --    rules, and "SET NULL" is an UPDATE. That UPDATE on public.properties
  --    and public.property_media fires tg_properties_guard_privileged(),
  --    which sees a non-admin auth.uid() and refuses with "this listing field
  --    is administered by Mizan Invest" — so the whole deletion fails for any
  --    partner who ever created a listing. Raising the existing
  --    transaction-local internal flag is the mechanism this schema already
  --    uses for legitimate system writes, and it is set with SET LOCAL so it
  --    dies with the transaction and can never leak into a later statement.
  set local mizan.internal = 'on';

  delete from auth.users where id = v_uid;
end;
$$;

comment on function public.delete_my_account() is
  'Self-service account deletion. Takes no arguments and always acts on '
  'auth.uid(), so it cannot be pointed at another user. Refuses when the '
  'caller is the sole owner of a partner with live listings, or the last '
  'super admin. Preserves leads, listings, media and activity_log.';

revoke execute on function public.delete_my_account() from public, anon, authenticated;
grant execute on function public.delete_my_account() to authenticated;


-- =============================================================================
-- Verification (run manually; not part of the migration)
-- =============================================================================
--   select id, public, file_size_limit from storage.buckets
--   where id in ('avatars', 'partner-logos');
--
--   select policyname, cmd, roles from pg_policies
--   where schemaname = 'storage' and tablename = 'objects'
--   order by policyname;
--
--   select proname, proacl from pg_proc
--   where proname in ('delete_my_account', 'is_public_partner');
--
-- Rollback
-- ---------------------------------------------------------------------------
--   drop function if exists public.delete_my_account();
--   drop function if exists public.is_public_partner(uuid);
--   drop policy if exists avatars_select_own on storage.objects;   -- etc.
--   delete from storage.buckets where id in ('avatars','partner-logos');
--   -- Buckets must be empty first; this migration adds no data of its own.
