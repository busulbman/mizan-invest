/**
 * ============================================
 * PARTNER LOGO
 * ============================================
 *
 * The partner organisation's PUBLIC company image.
 *
 * This is NOT the user avatar. An avatar identifies a person and is private to
 * them; a logo identifies the company and is shown to customers next to its
 * listings. They live in different buckets with different policies on purpose,
 * so neither can be mistaken for the other or reached through the other's path.
 *
 * AUTHORITY
 * Writes are restricted by two independent boundaries the database enforces:
 *   - `partner-logos` storage policies require the first path segment to be a
 *     partner the caller is an ACTIVE MEMBER of (`my_partner_ids()`)
 *   - `partners_update_member` plus `trg_partners_guard_privileged` allow a
 *     member to change display_name and logo_path and nothing else
 * A partner therefore cannot touch another partner's logo, and cannot smuggle
 * a privileged column change in alongside it.
 *
 * Reads are public for a live partner, which is what lets the customer-facing
 * listing UI show the logo. No private partner contact data is involved here at
 * any point — that lives in `private.partner_private`, a schema PostgREST does
 * not serve.
 */

import { supabase } from '@/lib/supabase';
import { imageExtensionFor, isAcceptedImageMime, MAX_AVATAR_BYTES } from '@/lib/profile';

/** Same 5 MB ceiling as the avatars bucket; both are small images. */
export const MAX_LOGO_BYTES = MAX_AVATAR_BYTES;

export interface PartnerIdentity {
  id: string;
  displayName: string;
  logoPath: string | null;
}

/** Reads the caller's own partner row. RLS admits only partners they belong to. */
export async function getPartnerIdentity(partnerId: string): Promise<PartnerIdentity | null> {
  const { data, error } = await supabase
    .from('partners')
    .select('id, display_name, logo_path')
    .eq('id', partnerId)
    .maybeSingle();
  if (error) throw new Error(`[getPartnerIdentity] ${error.message}`);
  if (!data) return null;

  return { id: data.id, displayName: data.display_name, logoPath: data.logo_path };
}

/**
 * Uploads a new company logo and points the partner row at it.
 *
 * The first path segment MUST be the partner id — the storage policies read
 * `storage.foldername(name)[1]` to decide which partner's folder this is.
 */
export async function uploadPartnerLogo(input: {
  partnerId: string;
  uri: string;
  mimeType: string;
  fileName?: string | null;
  previousPath?: string | null;
}): Promise<string> {
  if (!isAcceptedImageMime(input.mimeType)) {
    throw new Error('Use a JPEG, PNG or WebP image.');
  }

  const response = await fetch(input.uri);
  if (!response.ok) throw new Error('The selected image could not be read from the device.');
  const body = await response.arrayBuffer();

  if (body.byteLength === 0) throw new Error('The selected image is empty.');
  if (body.byteLength > MAX_LOGO_BYTES) throw new Error('This image is larger than the 5 MB limit.');

  const extension = imageExtensionFor(input.mimeType, input.fileName).replace(/[^a-z0-9]/gi, '');
  if (!extension) throw new Error('A safe file extension is required.');

  const storagePath = `${input.partnerId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('partner-logos')
    .upload(storagePath, body, { contentType: input.mimeType, upsert: false });
  if (uploadError) throw new Error(`[uploadPartnerLogo] ${uploadError.message}`);

  // Only logo_path is sent. Adding any other column here would be rejected by
  // the guard trigger, and that is the intended boundary rather than an
  // inconvenience to route around.
  const { error: rowError } = await supabase
    .from('partners')
    .update({ logo_path: storagePath })
    .eq('id', input.partnerId);

  if (rowError) {
    await supabase.storage.from('partner-logos').remove([storagePath]);
    throw new Error(`[uploadPartnerLogo] ${rowError.message}`);
  }

  if (input.previousPath && input.previousPath !== storagePath) {
    await supabase.storage.from('partner-logos').remove([input.previousPath]);
  }

  return storagePath;
}

/** Clears the logo. The row is cleared first so it never points at a deleted file. */
export async function removePartnerLogo(partnerId: string, currentPath: string | null): Promise<void> {
  const { error } = await supabase
    .from('partners')
    .update({ logo_path: null })
    .eq('id', partnerId);
  if (error) throw new Error(`[removePartnerLogo] ${error.message}`);

  if (currentPath) {
    await supabase.storage.from('partner-logos').remove([currentPath]);
  }
}

/**
 * Signed read URL for a logo, or null when it cannot be signed.
 *
 * Null rather than throwing: a missing logo must degrade to the placeholder,
 * never break a listing screen.
 */
export async function getPartnerLogoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from('partner-logos').createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
