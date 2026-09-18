/**
 * ============================================
 * OWN PROFILE
 * ============================================
 *
 * Display name, avatar, onboarding state and account deletion for the SIGNED-IN
 * user only.
 *
 * AUTHORITY
 * Nothing here is the security boundary. `profiles_update_own` already restricts
 * writes to `id = auth.uid()`, and every avatar storage policy requires the
 * first path segment to equal the caller's uid. This module simply makes the
 * operations the database already permits reachable from the app; it never
 * takes a user id from the caller, so there is no parameter to point at
 * somebody else.
 *
 * The `avatars` bucket is PRIVATE. Reads go through short-lived signed URLs, so
 * an avatar is not served from a guessable public address.
 */

import { supabase } from '@/lib/supabase';

/** Mirrors the bucket's 5 MB `file_size_limit`, checked before the round trip. */
export const MAX_AVATAR_BYTES = 5_242_880;

/** Mirrors the bucket's `allowed_mime_types`. Keep the two in sync. */
const ACCEPTED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function isAcceptedImageMime(mimeType: string): boolean {
  return ACCEPTED_IMAGE_MIME.has(mimeType);
}

export function imageExtensionFor(mimeType: string, fileName?: string | null): string {
  if (EXTENSION_BY_MIME[mimeType]) return EXTENSION_BY_MIME[mimeType];
  const fromName = fileName?.split('.').pop() ?? '';
  return fromName.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

/**
 * Normalises what the image picker hands back.
 *
 * iOS frequently reports no MIME type for a library photo, and the picker
 * writes JPEG to the cache directory in that case, so JPEG is the correct
 * default rather than a guess.
 */
export function resolveImageMime(rawMimeType: string | null | undefined): string | null {
  const raw = rawMimeType?.toLowerCase() ?? '';
  if (ACCEPTED_IMAGE_MIME.has(raw)) return raw;
  return raw.startsWith('image/') ? null : 'image/jpeg';
}

/** Updates the caller's display name. RLS scopes the row to auth.uid(). */
export async function updateDisplayName(userId: string, fullName: string): Promise<void> {
  const trimmed = fullName.trim();
  if (!trimmed) throw new Error('A display name is required.');

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: trimmed })
    .eq('id', userId);
  if (error) throw new Error(`[updateDisplayName] ${error.message}`);
}

/**
 * Uploads a new avatar and points the profile at it.
 *
 * The first path segment MUST be the user id: every avatars policy reads
 * `storage.foldername(name)[1]` to decide whose folder this is. A path in any
 * other shape is rejected by the database, not merely discouraged here.
 *
 * The previous object is removed only AFTER the profile row has been updated.
 * Doing it the other way round would leave the profile pointing at a file that
 * no longer exists if the update failed.
 */
export async function uploadAvatar(input: {
  userId: string;
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
  if (body.byteLength > MAX_AVATAR_BYTES) throw new Error('This image is larger than the 5 MB limit.');

  const extension = imageExtensionFor(input.mimeType, input.fileName).replace(/[^a-z0-9]/gi, '');
  if (!extension) throw new Error('A safe file extension is required.');

  const storagePath = `${input.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(storagePath, body, { contentType: input.mimeType, upsert: false });
  if (uploadError) throw new Error(`[uploadAvatar] ${uploadError.message}`);

  const { error: rowError } = await supabase
    .from('profiles')
    .update({ avatar_path: storagePath })
    .eq('id', input.userId);

  if (rowError) {
    // Best-effort cleanup of an object in the caller's own folder. Storage RLS
    // makes it impossible for this to reach anyone else's file.
    await supabase.storage.from('avatars').remove([storagePath]);
    throw new Error(`[uploadAvatar] ${rowError.message}`);
  }

  if (input.previousPath && input.previousPath !== storagePath) {
    await supabase.storage.from('avatars').remove([input.previousPath]);
  }

  return storagePath;
}

/**
 * Clears the avatar.
 *
 * The profile row is cleared first: if that fails the object is left alone, so
 * the profile never points at a file that has already been deleted.
 */
export async function removeAvatar(userId: string, currentPath: string | null): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_path: null })
    .eq('id', userId);
  if (error) throw new Error(`[removeAvatar] ${error.message}`);

  if (currentPath) {
    await supabase.storage.from('avatars').remove([currentPath]);
  }
}

/**
 * Signed read URL for an avatar, or null when it cannot be signed.
 *
 * Returning null rather than throwing is deliberate: a missing avatar must
 * degrade to the placeholder icon, never break the screen that shows it.
 */
export async function getAvatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

/**
 * Clears the server-side onboarding marker.
 *
 * Local state is cleared separately by the caller; this is the half that
 * follows the person across reinstalls, which is what
 * `profiles.onboarding_completed_at` exists for. Nothing is deleted: the
 * account, favourites, roles and partner membership are untouched.
 */
export async function resetOnboardingFlag(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed_at: null })
    .eq('id', userId);
  if (error) throw new Error(`[resetOnboardingFlag] ${error.message}`);
}

/**
 * Permanently deletes the signed-in account.
 *
 * The RPC takes NO arguments and always acts on `auth.uid()` — there is no
 * user id to supply and therefore none to tamper with. The client never holds
 * a service_role key and has no grant on `auth.users`.
 *
 * The avatar is removed through the Storage API FIRST, because the database
 * cannot do it: Supabase rejects direct DML on `storage.objects`, and a raw row
 * delete would orphan the file bytes anyway.
 *
 * The RPC refuses in two cases — sole owner of a partner with live listings,
 * and last remaining super admin — and its message explains which. Those are
 * surfaced to the user rather than worked around.
 */
export async function deleteOwnAccount(input: {
  userId: string;
  avatarPath: string | null;
}): Promise<void> {
  if (input.avatarPath) {
    // Best effort. If it fails the object is still unreachable afterwards:
    // every avatars policy requires foldername[1] = auth.uid(), and this uid
    // is never issued again.
    await supabase.storage.from('avatars').remove([input.avatarPath]);
  }

  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(error.message);
}
