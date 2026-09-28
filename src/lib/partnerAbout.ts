/**
 * ============================================
 * PARTNER PUBLIC DESCRIPTION
 * ============================================
 *
 * The partner's own PUBLIC "about" text, shown to customers.
 *
 * WHY THIS EXISTS
 * Until now nothing in the app could write `partner_translations.about`. The
 * only thing that ever filled it was the approval RPC copying the applicant's
 * PRIVATE application text — which is how approval came to fail on
 * `partner_tr_no_contact`, and which published words the applicant had written
 * to Mizan rather than to customers. Approval no longer publishes that text
 * (migration 20260928110000), so the partner needs a way to say publicly who
 * they are. This is that way.
 *
 * TWO DIFFERENT TEXTS, DELIBERATELY SEPARATE
 *   partner_applications.about   PRIVATE. Written to Mizan during application.
 *                                May contain a phone number. Never shown here,
 *                                never edited here, never published.
 *   partner_translations.about   PUBLIC. Written by the partner, for customers.
 *                                Readable by anon, so contact details are
 *                                forbidden in it.
 *
 * THE DATABASE IS THE AUTHORITY
 * `partner_tr_no_contact` decides what may be published — not this module. The
 * client does not pre-screen, redact or rewrite anything: a rejection comes back
 * from the constraint and is translated into a message the partner can act on,
 * with their own text left exactly as they typed it. Quietly stripping a phone
 * number out of someone's business description would be worse than refusing it,
 * because they would never learn the text was altered.
 *
 * Writes are admitted by `partner_tr_write_member`, which requires active
 * membership via `my_partner_ids()`. A partner cannot reach another partner's
 * description.
 *
 * LANGUAGE
 * One 'en' row, matching what the approval path wrote. This is partner-authored
 * business content, so it is never machine-translated — only the surrounding UI
 * chrome is localised.
 */

import { CONTACT_INFO_ERROR } from '@/lib/partner';
import { supabase } from '@/lib/supabase';

/** Mirrors `partner_tr_about_len`. The database remains the real limit. */
export const MAX_PARTNER_ABOUT_CHARS = 4000;

/** Stable marker for "this text is longer than the column allows". */
export const ABOUT_TOO_LONG_ERROR = 'PARTNER_ABOUT_TOO_LONG';

/**
 * Reads the partner's current public description.
 *
 * Returns '' rather than null for a partner with no description yet, so the
 * editor has a value to bind to without a separate empty state.
 */
export async function getPartnerAbout(partnerId: string): Promise<string> {
  const { data, error } = await supabase
    .from('partner_translations')
    .select('about')
    .eq('partner_id', partnerId)
    .eq('language', 'en')
    .maybeSingle();
  if (error) throw new Error(`[getPartnerAbout] ${error.message}`);
  return data?.about ?? '';
}

/**
 * Saves the public description.
 *
 * Blank clears it to NULL rather than storing an empty string, so "no
 * description" is one state in the database instead of two.
 *
 * `upsert` on (partner_id, language) because the row may not exist: approval
 * only creates one when the applicant supplied text that was already safe to
 * publish.
 */
export async function updatePartnerAbout(partnerId: string, about: string): Promise<void> {
  const trimmed = about.trim();
  if (trimmed.length > MAX_PARTNER_ABOUT_CHARS) throw new Error(ABOUT_TOO_LONG_ERROR);

  const { error } = await supabase.from('partner_translations').upsert(
    { partner_id: partnerId, language: 'en', about: trimmed || null },
    { onConflict: 'partner_id,language' }
  );
  if (!error) return;

  // The constraint is the authority; this only makes its verdict readable.
  if (error.message.includes('partner_tr_no_contact')) throw new Error(CONTACT_INFO_ERROR);
  if (error.message.includes('partner_tr_about_len')) throw new Error(ABOUT_TOO_LONG_ERROR);
  throw new Error(`[updatePartnerAbout] ${error.message}`);
}
