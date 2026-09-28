-- =============================================================================
-- MIZAN INVEST — PRODUCTION FIX
-- 20260928110000_partner_approval_about_guard.sql
-- review_partner_application: stop applicant free text from blocking approval
-- =============================================================================
-- THE BUG
--   Approving a real application failed with:
--
--     new row for relation "partner_translations"
--     violates check constraint "partner_tr_no_contact"
--
--   review_partner_application copied partner_applications.about straight into
--   partner_translations.about. Those two columns have OPPOSITE rules:
--
--     partner_applications.about   PRIVATE. Length-checked only. The applicant
--                                  is writing to Mizan and may legitimately
--                                  include a phone number or an email - the
--                                  form has dedicated phone/email columns right
--                                  beside it.
--     partner_translations.about   PUBLIC. anon can read it (partner_tr_read),
--                                  so partner_tr_no_contact forbids contact
--                                  details in it.
--
--   So the copy took text that was allowed to contain a phone number and tried
--   to publish it where a phone number is forbidden. The constraint did its job
--   and aborted the whole approval.
--
-- WHY THE CONSTRAINT IS NOT THE PROBLEM
--   partner_translations.about is world-readable. partner_tr_no_contact is the
--   only thing standing between an applicant's WhatsApp number and every guest
--   in the app. Weakening it would break the broker model at its foundation:
--   a customer must reach the partner THROUGH Mizan, not around it. It stays
--   exactly as it is, and so does contains_contact_info().
--
-- WHAT CHANGES
--   Approval no longer depends on what the applicant typed. Clean text is still
--   published; text carrying contact details is WITHHELD from the public
--   profile and the approval proceeds.
--
--   The application row is NOT modified. The original about stays in
--   partner_applications verbatim, which is where Mizan's record of what the
--   applicant said belongs. Nothing is deleted and nothing is rewritten:
--   auto-redacting business prose would mangle a legitimate licence or
--   trade-registry number (contains_contact_info flags any run of 9+ digits),
--   and silently altering someone's words is worse than not publishing them.
--
--   The decision is recorded on the existing approval activity_log entry as
--   about_withheld, so a withheld description is visible rather than
--   mysterious.
--
--   The partner supplies their own public description in Partner Profile, which
--   writes through partner_tr_write_member and hits the same constraint - so
--   they get an immediate, actionable error on their OWN text instead of an
--   admin hitting an opaque constraint failure on someone else's.
--
-- THE EXISTING STUCK APPLICATION
--   No data repair is needed. The failed approval was fully atomic - one
--   PostgREST call is one transaction, there is no exception block and no
--   savepoint, so the partners / partner_members / user_roles inserts all rolled
--   back with it. Verified against production: zero partner_translations rows
--   exist, and no orphan partner carries the '<name>-<10 hex>' slug this
--   function generates. Retrying approval after this migration simply succeeds.
--
-- SAFETY
--   CREATE OR REPLACE preserves the function's existing grants, so the
--   revoke/grant matrix from 20260918123107 is untouched. Signature, return
--   type, security definer, search_path and every other behaviour - partner
--   creation, owner membership, the partner role grant, the rejection path -
--   are byte-for-byte unchanged. No schema change, no data change, no DROP.
-- =============================================================================

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
  -- Decided once, before the insert, so the log and the insert can never
  -- disagree about what happened.
  v_about_withheld boolean;
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

  -- THE FIX. Only publish a description that is already safe to publish.
  -- NULL about -> nothing to publish, no row, not "withheld".
  v_about_withheld := v_application.about is not null
                      and public.contains_contact_info(v_application.about);

  insert into public.partner_translations (partner_id, language, about)
  select v_partner_id, 'en', v_application.about
  where v_application.about is not null
    and not public.contains_contact_info(v_application.about);

  update public.partner_applications
    set status = 'approved', partner_id = v_partner_id, reviewed_by = auth.uid(), reviewed_at = now()
    where id = v_application.id;
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'partner_application_approved', 'partner_application', v_application.id,
            jsonb_build_object('partner_id', v_partner_id,
                               'about_withheld', v_about_withheld));
  return v_partner_id;
end;
$$;

comment on function public.review_partner_application(uuid, text, text) is
  'Approves or rejects a partner application. The applicant private about text '
  'is published only when it carries no contact details; otherwise it is '
  'withheld from the public profile (activity_log.metadata.about_withheld) and '
  'left untouched in partner_applications. partner_tr_no_contact remains '
  'authoritative - see migration 20260928110000.';
