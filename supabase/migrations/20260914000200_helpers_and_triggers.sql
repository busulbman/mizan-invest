-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 02 of 11
-- 20260914000200_helpers_and_triggers.sql
-- Object-independent helper functions
-- =============================================================================
-- ORDERING NOTE (important):
--   Only functions that depend on NOTHING but built-ins and the enums from
--   step 01 may live here. PostgreSQL validates LANGUAGE sql function bodies at
--   CREATE time (check_function_bodies = on), so a SQL function referencing a
--   table that does not exist yet will FAIL TO CREATE.
--
--   Therefore:
--     - Role helpers  (read public.user_roles)      -> defined in step 03
--     - Partner helper(reads public.partner_members)-> defined in step 05
--
--   PL/pgSQL bodies are only syntax-checked, not name-resolved, at CREATE
--   time, which is why client_fingerprint() is safe here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
-- Never trust a client to set updated_at.
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Contact-information detection
-- -----------------------------------------------------------------------------
-- IMMUTABLE so it can be used inside CHECK constraints.
--
-- Tuned to avoid false positives on prices and measurements:
--   '2 500 000 AED'            -> false (no + prefix, <9 consecutive digits)
--   '1250000'                  -> false (7 digits)
--   'Built 2023, 450 sqm'      -> false
--   '+966 50 123 4567'         -> TRUE
--   '00966501234567'           -> TRUE
--   '0501234567'               -> TRUE (10 consecutive digits)
--   'reach me at a@b.com'      -> TRUE
--   'WhatsApp me'              -> TRUE
--
-- KNOWN LIMIT: cannot catch spelled-out digits ("zero five zero...") or a
-- phone number rendered inside an uploaded image. Those need human
-- moderation (Phase 12). This constraint is a floor, not a ceiling.
create or replace function public.contains_contact_info(p_text text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_text is null then false
    else
         p_text ~ '\+[0-9][0-9 ().-]{6,}'
      or p_text ~ '(^|[^0-9])00[1-9][0-9 ().-]{6,}'
      or p_text ~ '[0-9]{9,}'
      or p_text ~* '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[a-z]{2,}'
      or p_text ~* '(whatsapp|wa\.me|t\.me|telegram|viber|imo\.im)'
      or p_text ~* '(instagram\.com|facebook\.com|fb\.me|snapchat)'
  end;
$$;

comment on function public.contains_contact_info(text) is
  'Blocks partner contact details in public-facing text. NOTE: changing this '
  'function does NOT revalidate existing rows - run a verification query after '
  'any change.';

-- Array-aware variant for property_translations.highlights[]
create or replace function public.array_contains_contact_info(p_arr text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    (select bool_or(public.contains_contact_info(x)) from unnest(p_arr) as x),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- Lead source classification
-- -----------------------------------------------------------------------------
-- Attribution sources record a tap-through and need no contact details:
-- a guest may tap WhatsApp before we know anything about them.
-- Inquiry sources are a real request for a reply, so an unauthenticated
-- person must leave a phone number or an email.
create or replace function public.lead_source_requires_contact(
  p_source public.lead_source
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_source in ('interested_button', 'web', 'other');
$$;

comment on function public.lead_source_requires_contact(public.lead_source) is
  'TRUE for sources that constitute a full inquiry. FALSE for attribution '
  'tap-throughs (whatsapp, phone_call, share, reel, ...).';

-- -----------------------------------------------------------------------------
-- Privacy-preserving client fingerprint (abuse control only)
-- -----------------------------------------------------------------------------
-- Derives a per-day salted hash of the caller IP. NO RAW IP IS EVER STORED,
-- and the daily salt means the value cannot be used to track a person across
-- days. Used solely to rate-limit guest lead creation.
--
-- Degrades to NULL rather than raising: a missing or malformed header must
-- never block a legitimate enquiry.
create or replace function public.client_fingerprint()
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_ip text;
begin
  v_ip := nullif(
    split_part(
      coalesce(
        current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for',
        ''
      ),
      ',', 1
    ),
    ''
  );

  if v_ip is null then
    return null;
  end if;

  return md5(v_ip || '|' || current_date::text);
exception
  when others then
    return null;
end;
$$;

-- -----------------------------------------------------------------------------
-- EXECUTE privileges
-- -----------------------------------------------------------------------------
-- REVOKE ... FROM PUBLIC IS NOT SUFFICIENT ON SUPABASE.
--   Supabase ships ALTER DEFAULT PRIVILEGES that grant EXECUTE directly to
--   `anon` and `authenticated` when a function is created. Those are separate
--   grants from the PUBLIC one and survive a REVOKE ... FROM PUBLIC. Every
--   function must be revoked from PUBLIC, anon AND authenticated explicitly,
--   then granted back only where genuinely required.
--
-- Verified empirically against this schema on local Supabase (PostgreSQL 17):
--   * an RLS policy expression REQUIRES the caller to hold EXECUTE
--   * a CHECK constraint REQUIRES the writing role to hold EXECUTE
--   * a TRIGGER function does NOT require the caller to hold EXECUTE
--   * inside SECURITY DEFINER, CHECK functions resolve as the DEFINER
-- -----------------------------------------------------------------------------

revoke execute on function public.tg_set_updated_at()                 from public, anon, authenticated;
revoke execute on function public.contains_contact_info(text)         from public, anon, authenticated;
revoke execute on function public.array_contains_contact_info(text[]) from public, anon, authenticated;
revoke execute on function public.lead_source_requires_contact(public.lead_source)
                                                                      from public, anon, authenticated;
revoke execute on function public.client_fingerprint()                from public, anon, authenticated;

-- contains_contact_info / array_contains_contact_info back CHECK constraints on
-- partners, partner_translations, property_translations and property_media.
-- `authenticated` writes those tables, so it must hold EXECUTE or every partner
-- INSERT/UPDATE fails with "permission denied for function".
-- `anon` writes none of them and is therefore NOT granted.
grant execute on function public.contains_contact_info(text)         to authenticated;
grant execute on function public.array_contains_contact_info(text[]) to authenticated;

-- lead_source_requires_contact backs two CHECK constraints on public.leads.
-- A guest INSERT arrives through create_lead(), which is SECURITY DEFINER, so it
-- resolves as the definer - anon does not need this. An ADMIN UPDATE of a lead
-- runs as `authenticated` and does.
grant execute on function public.lead_source_requires_contact(public.lead_source)
                                                                     to authenticated;

-- NOT granted to any client role:
--   tg_set_updated_at    - trigger function; PostgreSQL refuses a direct call
--                          ("trigger functions can only be called as triggers")
--   client_fingerprint   - used only inside create_lead(), a SECURITY DEFINER
