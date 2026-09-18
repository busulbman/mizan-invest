-- =============================================================================
-- MIZAN INVEST — PHASE 4B
-- Partner applications, controlled review workflow, private property media
-- =============================================================================
-- This migration intentionally keeps all privileged transitions inside
-- SECURITY DEFINER RPCs.  The Expo client has no service-role key and cannot
-- create memberships, grant roles, publish a property, or write an activity
-- record directly.

-- -----------------------------------------------------------------------------
-- Partner applications contain applicant PII, but never become public partner
-- data.  RLS limits them to the applicant and an administrator.
-- -----------------------------------------------------------------------------
create table public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  applicant_type text not null check (applicant_type in ('individual', 'company')),
  display_name text not null check (char_length(display_name) between 2 and 120),
  country_id uuid not null references public.countries(id) on delete restrict,
  city_id uuid references public.cities(id) on delete restrict,
  languages public.app_language[] not null check (cardinality(languages) between 1 and 4),
  phone text,
  email extensions.citext,
  about text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 2000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  partner_id uuid references public.partners(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_application_contact_required check (phone is not null or email is not null),
  constraint partner_application_phone_len check (phone is null or char_length(phone) between 5 and 40),
  constraint partner_application_about_len check (about is null or char_length(about) <= 4000),
  constraint partner_application_message_len check (message is null or char_length(message) <= 4000)
);

create unique index uq_partner_application_one_pending_per_user
  on public.partner_applications (user_id) where status = 'pending';
create index idx_partner_applications_review_queue
  on public.partner_applications (status, created_at) where status = 'pending';

create trigger trg_partner_applications_updated_at
  before update on public.partner_applications
  for each row execute function public.tg_set_updated_at();

alter table public.partner_applications enable row level security;
revoke all on public.partner_applications from anon, authenticated;
grant select on public.partner_applications to authenticated;

create policy partner_applications_read_own on public.partner_applications
  for select to authenticated using (user_id = auth.uid());
create policy partner_applications_read_admin on public.partner_applications
  for select to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Review audit trail.  No client INSERT/UPDATE/DELETE grants: RPCs write it.
-- -----------------------------------------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in (
    'partner_application_submitted', 'partner_application_approved',
    'partner_application_rejected', 'property_submitted',
    'property_approved', 'property_rejected', 'property_archived',
    'property_admin_updated'
  )),
  entity_type text not null check (entity_type in ('partner_application', 'partner', 'property')),
  entity_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_activity_log_created_at on public.activity_log (created_at desc);
create index idx_activity_log_entity on public.activity_log (entity_type, entity_id, created_at desc);

alter table public.activity_log enable row level security;
revoke all on public.activity_log from anon, authenticated;
grant select on public.activity_log to authenticated;
create policy activity_log_read_admin on public.activity_log
  for select to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Property review fields. Existing `unpublished` is deliberately reused as
-- the rejected state, avoiding a risky enum rewrite; a non-null rejection
-- reason distinguishes a rejected listing from an administrative unpublish.
-- -----------------------------------------------------------------------------
alter table public.properties
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists rejection_reason text;

alter table public.properties
  add constraint prop_rejection_reason_len
  check (rejection_reason is null or char_length(rejection_reason) <= 2000) not valid;
alter table public.properties validate constraint prop_rejection_reason_len;

create index idx_properties_review_queue
  on public.properties (publication_status, submitted_at asc)
  where deleted_at is null and publication_status = 'pending_review';

-- A partner can only edit drafts. Submitted/published listings are locked.
-- A rejected (`unpublished`) listing may only be moved back to draft before it
-- can be changed and resubmitted. The submission timestamp can only be set by
-- submit_property_for_review(), which sets the transaction-local flag below.
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

  if tg_op = 'INSERT' and (new.reference_code is null
                           or (auth.uid() is not null and not public.is_admin())) then
    new.reference_code := 'MZ-' || nextval('public.property_ref_seq');
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verified := false;
    new.featured := false;
    new.favorite_count := 0;
    new.published_at := null;
    new.created_by := auth.uid();
    new.submitted_at := null;
    new.reviewed_at := null;
    new.reviewed_by := null;
    new.rejection_reason := null;
    if new.publication_status <> 'draft' then
      raise exception 'a new partner listing must start as draft' using errcode = '42501';
    end if;
    new.roi_pct := null;
    new.rental_yield_pct := null;
    new.monthly_rent_usd_cents := null;
    new.amortization_years := null;
    new.investment_score := null;
    new.growth_score := null;
    new.risk_level := null;
    new.market_trend := null;
    new.metrics_source := 'manual';
    new.metrics_updated_at := null;
    return new;
  end if;

  if new.verified is distinct from old.verified
    or new.featured is distinct from old.featured
    or new.partner_id is distinct from old.partner_id
    or new.favorite_count is distinct from old.favorite_count
    or new.reference_code is distinct from old.reference_code
    or new.published_at is distinct from old.published_at
    or new.created_by is distinct from old.created_by
    or new.price_usd_cents is distinct from old.price_usd_cents
    or new.roi_pct is distinct from old.roi_pct
    or new.rental_yield_pct is distinct from old.rental_yield_pct
    or new.monthly_rent_usd_cents is distinct from old.monthly_rent_usd_cents
    or new.amortization_years is distinct from old.amortization_years
    or new.investment_score is distinct from old.investment_score
    or new.growth_score is distinct from old.growth_score
    or new.risk_level is distinct from old.risk_level
    or new.market_trend is distinct from old.market_trend
    or new.metrics_source is distinct from old.metrics_source
    or new.metrics_updated_at is distinct from old.metrics_updated_at
    or new.reviewed_at is distinct from old.reviewed_at
    or new.reviewed_by is distinct from old.reviewed_by
    or new.rejection_reason is distinct from old.rejection_reason
  then
    raise exception 'this listing field is administered by Mizan Invest' using errcode = '42501';
  end if;

  if old.publication_status = 'draft' and new.publication_status = 'draft' then
    if new.submitted_at is distinct from old.submitted_at then
      raise exception 'only the submission workflow may set submitted_at' using errcode = '42501';
    end if;
    return new;
  end if;

  if old.publication_status in ('draft', 'unpublished')
     and new.publication_status = 'pending_review'
     and coalesce(current_setting('mizan.partner_submit', true), 'off') = 'on' then
    new.submitted_at := now();
    return new;
  end if;

  if old.publication_status = 'unpublished' and new.publication_status = 'draft' then
    if new.submitted_at is distinct from old.submitted_at then
      new.submitted_at := null;
    end if;
    return new;
  end if;

  raise exception 'submitted, published and archived listings are controlled by Mizan Invest'
    using errcode = '42501';
end;
$$;

-- Submitted/public records cannot have their titles or media changed by a
-- partner. Admin access remains available through the explicit admin policy.
drop policy if exists prop_tr_write_member on public.property_translations;
create policy prop_tr_write_member on public.property_translations
  for all to authenticated
  using (exists (select 1 from public.properties p
                 where p.id = property_id
                   and p.partner_id in (select public.my_partner_ids())
                   and p.publication_status in ('draft', 'unpublished')))
  with check (exists (select 1 from public.properties p
                      where p.id = property_id
                        and p.partner_id in (select public.my_partner_ids())
                        and p.publication_status in ('draft', 'unpublished')));

drop policy if exists prop_media_write_member on public.property_media;
create policy prop_media_write_member on public.property_media
  for all to authenticated
  using (exists (select 1 from public.properties p
                 where p.id = property_id
                   and p.partner_id in (select public.my_partner_ids())
                   and p.publication_status in ('draft', 'unpublished')))
  with check (exists (select 1 from public.properties p
                      where p.id = property_id
                        and p.partner_id in (select public.my_partner_ids())
                        and p.publication_status in ('draft', 'unpublished')));

-- -----------------------------------------------------------------------------
-- Secure workflows. Each RPC validates its caller before bypassing RLS.
-- -----------------------------------------------------------------------------
create or replace function public.submit_partner_application(
  p_applicant_type text,
  p_display_name text,
  p_country_id uuid,
  p_city_id uuid,
  p_languages public.app_language[],
  p_phone text default null,
  p_email text default null,
  p_about text default null,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_applicant_type not in ('individual', 'company') then raise exception 'invalid applicant type' using errcode = '22023'; end if;
  if nullif(btrim(coalesce(p_display_name, '')), '') is null then raise exception 'display name is required' using errcode = '22023'; end if;
  if p_languages is null or cardinality(p_languages) = 0 then raise exception 'at least one language is required' using errcode = '22023'; end if;
  if nullif(btrim(coalesce(p_phone, '')), '') is null and nullif(btrim(coalesce(p_email, '')), '') is null then
    raise exception 'phone or email is required' using errcode = '22023';
  end if;
  if exists (select 1 from public.partner_members pm where pm.user_id = auth.uid() and pm.is_active) then
    raise exception 'already an active partner member' using errcode = '23505';
  end if;

  insert into public.partner_applications (
    user_id, applicant_type, display_name, country_id, city_id, languages,
    phone, email, about, message
  ) values (
    auth.uid(), p_applicant_type, btrim(p_display_name), p_country_id, p_city_id,
    p_languages, nullif(btrim(p_phone), ''), nullif(btrim(p_email), ''),
    nullif(btrim(p_about), ''), nullif(btrim(p_message), '')
  ) returning id into v_id;

  insert into public.activity_log (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'partner_application_submitted', 'partner_application', v_id);
  return v_id;
exception when unique_violation then
  raise exception 'a partner application is already pending' using errcode = '23505';
end;
$$;

create or replace function public.review_partner_application(
  p_application_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.partner_applications%rowtype;
  v_partner_id uuid;
  v_slug text;
begin
  if not public.is_admin() then raise exception 'admin role required' using errcode = '42501'; end if;
  if p_decision not in ('approved', 'rejected') then raise exception 'invalid decision' using errcode = '22023'; end if;
  select * into v_application from public.partner_applications where id = p_application_id for update;
  if not found then raise exception 'application not found' using errcode = 'P0002'; end if;
  if v_application.status <> 'pending' then raise exception 'application has already been reviewed' using errcode = '23505'; end if;

  if p_decision = 'rejected' then
    if nullif(btrim(coalesce(p_rejection_reason, '')), '') is null then
      raise exception 'a rejection reason is required' using errcode = '22023';
    end if;
    update public.partner_applications
      set status = 'rejected', rejection_reason = btrim(p_rejection_reason), reviewed_by = auth.uid(), reviewed_at = now()
      where id = v_application.id;
    insert into public.activity_log (actor_id, action, entity_type, entity_id)
      values (auth.uid(), 'partner_application_rejected', 'partner_application', v_application.id);
    return null;
  end if;

  v_slug := left(regexp_replace(lower(v_application.display_name), '[^a-z0-9]+', '-', 'g'), 46);
  v_slug := trim(both '-' from v_slug);
  if char_length(v_slug) < 3 then v_slug := 'partner'; end if;
  v_slug := v_slug || '-' || left(replace(v_application.id::text, '-', ''), 10);

  insert into public.partners (slug, display_name, country_id, is_active)
  values (v_slug, v_application.display_name, v_application.country_id, true)
  returning id into v_partner_id;
  insert into public.partner_members (partner_id, user_id, member_role, is_active)
  values (v_partner_id, v_application.user_id, 'owner', true);
  insert into public.user_roles (user_id, role, granted_by)
  select v_application.user_id, 'partner', auth.uid()
  where not exists (select 1 from public.user_roles ur
                    where ur.user_id = v_application.user_id and ur.role = 'partner' and ur.revoked_at is null);
  insert into public.partner_translations (partner_id, language, about)
  select v_partner_id, 'en', v_application.about
  where v_application.about is not null;

  update public.partner_applications
    set status = 'approved', partner_id = v_partner_id, reviewed_by = auth.uid(), reviewed_at = now()
    where id = v_application.id;
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'partner_application_approved', 'partner_application', v_application.id,
            jsonb_build_object('partner_id', v_partner_id));
  return v_partner_id;
end;
$$;

create or replace function public.submit_property_for_review(p_property_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_partner_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select partner_id into v_partner_id from public.properties where id = p_property_id for update;
  if not found or not public.is_member_of_partner(v_partner_id) then raise exception 'property not found' using errcode = 'P0002'; end if;
  perform set_config('mizan.partner_submit', 'on', true);
  update public.properties
    set publication_status = 'pending_review'
    where id = p_property_id and publication_status in ('draft', 'unpublished');
  if not found then raise exception 'only a draft or rejected property can be submitted' using errcode = '42501'; end if;
  insert into public.activity_log (actor_id, action, entity_type, entity_id)
    values (auth.uid(), 'property_submitted', 'property', p_property_id);
end;
$$;

create or replace function public.review_property(
  p_property_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_action text;
begin
  if not public.is_admin() then raise exception 'admin role required' using errcode = '42501'; end if;
  if p_decision not in ('approved', 'rejected', 'archived') then raise exception 'invalid decision' using errcode = '22023'; end if;
  if p_decision = 'rejected' and nullif(btrim(coalesce(p_rejection_reason, '')), '') is null then
    raise exception 'a rejection reason is required' using errcode = '22023';
  end if;
  if p_decision = 'approved' then
    update public.properties set publication_status = 'published', reviewed_at = now(), reviewed_by = auth.uid(), rejection_reason = null
      where id = p_property_id and publication_status = 'pending_review';
    v_action := 'property_approved';
  elsif p_decision = 'rejected' then
    update public.properties set publication_status = 'unpublished', reviewed_at = now(), reviewed_by = auth.uid(), rejection_reason = btrim(p_rejection_reason)
      where id = p_property_id and publication_status = 'pending_review';
    v_action := 'property_rejected';
  else
    update public.properties set publication_status = 'archived', reviewed_at = now(), reviewed_by = auth.uid()
      where id = p_property_id and publication_status in ('draft', 'pending_review', 'published', 'unpublished');
    v_action := 'property_archived';
  end if;
  if not found then raise exception 'property is not in a reviewable state' using errcode = '42501'; end if;
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), v_action, 'property', p_property_id,
            case when p_decision = 'rejected' then jsonb_build_object('rejection_reason', btrim(p_rejection_reason)) else '{}'::jsonb end);
end;
$$;

revoke all on function public.submit_partner_application(text, text, uuid, uuid, public.app_language[], text, text, text, text) from public, anon, authenticated;
revoke all on function public.review_partner_application(uuid, text, text) from public, anon, authenticated;
revoke all on function public.submit_property_for_review(uuid) from public, anon, authenticated;
revoke all on function public.review_property(uuid, text, text) from public, anon, authenticated;
grant execute on function public.submit_partner_application(text, text, uuid, uuid, public.app_language[], text, text, text, text) to authenticated;
grant execute on function public.review_partner_application(uuid, text, text) to authenticated;
grant execute on function public.submit_property_for_review(uuid) to authenticated;
grant execute on function public.review_property(uuid, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Private Storage: public listing viewers receive signed URLs only after the
-- object SELECT policy confirms the media row belongs to a published property.
-- A public bucket would bypass this published-listing boundary.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-media', 'property-media', false, 104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy property_media_objects_select on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'property-media' and (
      exists (select 1 from public.property_media pm join public.properties p on p.id = pm.property_id
              where pm.storage_bucket = storage.objects.bucket_id and pm.storage_path = storage.objects.name
                and pm.deleted_at is null and p.publication_status = 'published' and p.deleted_at is null)
      or exists (select 1 from public.properties p
                 where p.id::text = (storage.foldername(storage.objects.name))[1]
                   and p.partner_id in (select public.my_partner_ids()))
      or public.is_admin()
    )
  );
create policy property_media_objects_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-media' and exists (
    select 1 from public.properties p
    where p.id::text = (storage.foldername(storage.objects.name))[1]
      and p.partner_id in (select public.my_partner_ids())
      and p.publication_status in ('draft', 'unpublished')
  ));
create policy property_media_objects_update on storage.objects
  for update to authenticated
  using (bucket_id = 'property-media' and exists (
    select 1 from public.properties p where p.id::text = (storage.foldername(storage.objects.name))[1]
      and p.partner_id in (select public.my_partner_ids()) and p.publication_status in ('draft', 'unpublished')
  ))
  with check (bucket_id = 'property-media' and exists (
    select 1 from public.properties p where p.id::text = (storage.foldername(storage.objects.name))[1]
      and p.partner_id in (select public.my_partner_ids()) and p.publication_status in ('draft', 'unpublished')
  ));
create policy property_media_objects_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-media' and exists (
    select 1 from public.properties p where p.id::text = (storage.foldername(storage.objects.name))[1]
      and p.partner_id in (select public.my_partner_ids()) and p.publication_status in ('draft', 'unpublished')
  ));
