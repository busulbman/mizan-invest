-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 09 of 11
-- 20260914000900_leads.sql
-- leads + create_lead() RPC
-- =============================================================================
-- BUSINESS CRITICAL. This is the commission ledger.
--
-- ATTRIBUTION IS SNAPSHOTTED, NOT JOINED. If a property is reassigned from one
-- partner to another six months from now, a JOIN would silently credit the new
-- partner for the old partner's lead. The *_snapshot columns are what you pay
-- commission on; the live foreign keys exist only for navigation.
--
-- LEADS ARE NEVER HARD DELETED. Three independent guards: no DELETE grant, no
-- DELETE policy, and a BEFORE DELETE trigger that stops even service_role.
--
-- INSERTION IS RPC-ONLY. No client role holds INSERT on this table. This makes
-- the snapshot columns physically unreachable from the mobile app and lets a
-- guest receive their reference_code without any SELECT privilege.
-- =============================================================================

create table public.leads (
  id             uuid primary key default gen_random_uuid(),
  reference_code text not null unique,

  -- Live FKs: SET NULL so a lead outlives its property, partner and user.
  user_id     uuid references auth.users(id)        on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  partner_id  uuid references public.partners(id)   on delete set null,

  -- ---- ATTRIBUTION SNAPSHOT: written by create_lead(), immutable after ----
  partner_id_snapshot      uuid not null,
  partner_name_snapshot    text not null,
  property_ref_snapshot    text not null,
  property_title_snapshot  text not null,
  price_usd_cents_snapshot bigint,

  source        public.lead_source not null,
  lead_kind     public.lead_kind   not null,
  source_detail jsonb              not null default '{}'::jsonb,
  status        public.lead_status not null default 'new',

  contact_name       text,
  contact_phone      text,
  contact_email      extensions.citext,
  message            text,
  preferred_language public.app_language,

  assigned_admin uuid references auth.users(id) on delete set null,
  app_version    text,
  platform       text,

  -- md5(ip | current_date). NOT an IP address. Abuse control only; cannot be
  -- reversed and cannot track a person across days.
  client_fingerprint text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at  timestamptz,
  -- NO deleted_at. 'spam' is the disposal route.

  constraint leads_phone_e164
    check (contact_phone is null or contact_phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint leads_email_fmt
    check (contact_email is null
           or contact_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$'),
  constraint leads_message_len
    check (message is null or char_length(message) <= 2000),
  constraint leads_platform_valid
    check (platform is null or platform in ('ios', 'android', 'web')),
  constraint leads_source_detail_is_object
    check (jsonb_typeof(source_detail) = 'object'),

  -- A guest may tap WhatsApp before we know anything about them: an
  -- attribution record needs no contact details. A full inquiry from someone
  -- who is not signed in must leave a way to reply.
  constraint leads_contact_required_for_inquiry check (
    not public.lead_source_requires_contact(source)
    or user_id is not null
    or contact_phone is not null
    or contact_email is not null
  ),

  -- lead_kind must agree with source even for a direct service_role insert.
  constraint leads_kind_matches_source check (
    lead_kind = case
      when public.lead_source_requires_contact(source)
      then 'inquiry'::public.lead_kind
      else 'attribution'::public.lead_kind
    end
  )
);

create index idx_leads_status   on public.leads (status, created_at desc);
create index idx_leads_kind     on public.leads (lead_kind, created_at desc);
create index idx_leads_partner  on public.leads (partner_id_snapshot, created_at desc);
create index idx_leads_user     on public.leads (user_id, created_at desc)
  where user_id is not null;
create index idx_leads_property on public.leads (property_id, created_at desc);
create index idx_leads_fp       on public.leads (client_fingerprint, created_at desc)
  where client_fingerprint is not null;

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.tg_set_updated_at();

-- -----------------------------------------------------------------------------
-- Attribution is immutable
-- -----------------------------------------------------------------------------
create or replace function public.tg_leads_protect_snapshot()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.reference_code           is distinct from old.reference_code
  or new.partner_id_snapshot      is distinct from old.partner_id_snapshot
  or new.partner_name_snapshot    is distinct from old.partner_name_snapshot
  or new.property_ref_snapshot    is distinct from old.property_ref_snapshot
  or new.property_title_snapshot  is distinct from old.property_title_snapshot
  or new.price_usd_cents_snapshot is distinct from old.price_usd_cents_snapshot
  or new.source                   is distinct from old.source
  or new.lead_kind                is distinct from old.lead_kind
  or new.created_at               is distinct from old.created_at
  then
    raise exception 'lead attribution is immutable' using errcode = '42501';
  end if;

  if new.status in ('closed_won', 'closed_lost') and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;

create trigger trg_leads_protect_snapshot
  before update on public.leads
  for each row execute function public.tg_leads_protect_snapshot();

-- -----------------------------------------------------------------------------
-- No hard deletion, for anyone
-- -----------------------------------------------------------------------------
-- Stops service_role and the SQL editor too. It does NOT stop DROP TABLE -
-- see the rollback notes in supabase/README.md.
create or replace function public.tg_leads_block_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'leads are never deleted - set status = ''spam'' instead'
    using errcode = '42501';
end;
$$;

create trigger trg_leads_block_delete
  before delete on public.leads
  for each row execute function public.tg_leads_block_delete();

-- =============================================================================
-- create_lead() — the ONLY insertion path
-- =============================================================================
-- Returns just {lead_id, reference_code}. Nothing else about the lead is
-- readable by the caller.
--
-- The WhatsApp attribution flow:
--   1. client calls create_lead(property, 'whatsapp')  -> "MZ-L-7F3K"
--   2. client opens wa.me/<COMPANY>?text=... Ref: MZ-L-7F3K
--   3. staff see the ref in the chat and open the lead, property and partner
-- The lead exists whether or not the message is ever sent: the tap-through is
-- itself the attribution event.
create or replace function public.create_lead(
  p_property_id        uuid,
  p_source             public.lead_source,
  p_contact_name       text                default null,
  p_contact_phone      text                default null,
  p_contact_email      text                default null,
  p_message            text                default null,
  p_preferred_language public.app_language default null,
  p_source_detail      jsonb               default '{}'::jsonb,
  p_app_version        text                default null,
  p_platform           text                default null
)
returns table (lead_id uuid, reference_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  v_fp       text := public.client_fingerprint();
  v_kind     public.lead_kind;
  v_prop     record;
  v_partner  record;
  v_title    text;
  v_recent   integer;
  v_existing record;
  v_code     text;
  v_try      integer := 0;
  v_new_id   uuid;
  v_new_code text;
begin
  v_kind := case
              when public.lead_source_requires_contact(p_source)
              then 'inquiry'::public.lead_kind
              else 'attribution'::public.lead_kind
            end;

  -- 1. Contact requirement --------------------------------------------------
  if v_kind = 'inquiry'
     and v_uid is null
     and nullif(trim(coalesce(p_contact_phone, '')), '') is null
     and nullif(trim(coalesce(p_contact_email, '')), '') is null
  then
    raise exception 'a phone number or email is required so we can reply'
      using errcode = '23514';
  end if;

  -- 2. Only published listings may generate a lead. This also prevents the
  --    snapshot fields being used to probe draft listings.
  select p.id, p.partner_id, p.reference_code, p.price_usd_cents
    into v_prop
  from public.properties p
  where p.id = p_property_id
    and p.deleted_at is null
    and p.publication_status = 'published';

  if not found then
    raise exception 'property is not available for enquiry'
      using errcode = '42501';
  end if;

  -- 3. Abuse control. Attribution taps are cheap and frequent; inquiries are
  --    rare and costly, so they are throttled far harder.
  if v_uid is not null or v_fp is not null then
    select count(*) into v_recent
    from public.leads l
    where l.created_at > now() - interval '1 hour'
      and l.lead_kind = v_kind
      and ( (v_uid is not null and l.user_id = v_uid)
         or (v_uid is null and v_fp is not null and l.client_fingerprint = v_fp) );

    if v_kind = 'inquiry' and v_recent >= 5 then
      raise exception 'too many enquiries in the last hour' using errcode = '54000';
    elsif v_kind = 'attribution' and v_recent >= 40 then
      raise exception 'too many requests' using errcode = '54000';
    end if;
  end if;

  -- 4. De-duplicate repeat taps so attribution data stays clean: the same
  --    person, property and source within an hour returns the SAME reference
  --    instead of creating a second lead.
  if v_kind = 'attribution' then
    select l.id, l.reference_code into v_existing
    from public.leads l
    where l.property_id = p_property_id
      and l.source = p_source
      and l.created_at > now() - interval '1 hour'
      and ( (v_uid is not null and l.user_id = v_uid)
         or (v_uid is null and v_fp is not null and l.client_fingerprint = v_fp) )
    order by l.created_at desc
    limit 1;

    if found then
      lead_id        := v_existing.id;
      reference_code := v_existing.reference_code;
      return next;
      return;
    end if;
  end if;

  -- 5. Snapshot -------------------------------------------------------------
  select pa.id, pa.display_name into v_partner
  from public.partners pa
  where pa.id = v_prop.partner_id;

  select t.title into v_title
  from public.property_translations t
  where t.property_id = p_property_id
  order by (t.language = coalesce(p_preferred_language, 'en'::public.app_language)) desc,
           (t.language = 'en'::public.app_language) desc
  limit 1;

  loop
    v_try  := v_try + 1;
    v_code := 'MZ-L-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (
      select 1 from public.leads l where l.reference_code = v_code);
    if v_try >= 6 then
      raise exception 'could not allocate lead reference' using errcode = '55000';
    end if;
  end loop;

  insert into public.leads (
    reference_code, user_id, property_id, partner_id,
    partner_id_snapshot, partner_name_snapshot,
    property_ref_snapshot, property_title_snapshot, price_usd_cents_snapshot,
    source, lead_kind, source_detail, status,
    contact_name, contact_phone, contact_email, message, preferred_language,
    app_version, platform, client_fingerprint
  )
  values (
    v_code, v_uid, v_prop.id, v_prop.partner_id,
    v_prop.partner_id, v_partner.display_name,
    v_prop.reference_code, coalesce(v_title, v_prop.reference_code),
    v_prop.price_usd_cents,
    p_source, v_kind, coalesce(p_source_detail, '{}'::jsonb), 'new',
    left(nullif(trim(coalesce(p_contact_name, '')), ''), 120),
    nullif(trim(coalesce(p_contact_phone, '')), ''),
    nullif(trim(coalesce(p_contact_email, '')), '')::extensions.citext,
    left(nullif(trim(coalesce(p_message, '')), ''), 2000),
    p_preferred_language,
    left(p_app_version, 40),
    p_platform,
    v_fp
  )
  returning leads.id, leads.reference_code into v_new_id, v_new_code;

  lead_id        := v_new_id;
  reference_code := v_new_code;
  return next;
end;
$$;

-- Trigger functions: never called directly, exposed to nobody.
revoke execute on function public.tg_leads_protect_snapshot() from public, anon, authenticated;
revoke execute on function public.tg_leads_block_delete()     from public, anon, authenticated;

revoke execute on function public.create_lead(
  uuid, public.lead_source, text, text, text, text,
  public.app_language, jsonb, text, text) from public, anon, authenticated;

-- create_lead() is the ONLY function a guest needs, and the only insertion path
-- into public.leads. It is SECURITY DEFINER, validates that the property is
-- published, enforces the contact requirement, rate-limits, de-duplicates, and
-- returns nothing but {lead_id, reference_code}.
grant execute on function public.create_lead(
  uuid, public.lead_source, text, text, text, text,
  public.app_language, jsonb, text, text) to anon, authenticated;

comment on function public.create_lead(
  uuid, public.lead_source, text, text, text, text,
  public.app_language, jsonb, text, text) is
  'PUBLIC CONTRACT. Old app builds stay live for weeks after a release: add '
  'future parameters WITH DEFAULTS, AT THE END, or you will break them.';
