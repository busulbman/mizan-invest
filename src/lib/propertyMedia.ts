/**
 * Private `property-media` bucket access for a partner's editable listing.
 *
 * Every write path here is additionally constrained by Storage RLS and the
 * `property_media` table policy, both of which require the row's property to
 * belong to one of `my_partner_ids()` AND sit in an editable publication
 * status ('draft' or 'unpublished'). This module never widens that boundary;
 * it only makes the allowed operations reachable from the app.
 */
import { supabase } from '@/lib/supabase';

/**
 * Media kinds a partner can upload.
 *
 * 'video' is the property tour shown on the listing; 'reel_video' is the
 * short-form vertical clip for the Reels surface. They are separate enum
 * values so the two can never be confused by a consumer, which is exactly
 * what the Phase 4B.1 schema could not express.
 */
export type UploadablePropertyMediaType = 'image' | 'video' | 'reel_video';

/** Enum members that carry a video payload and therefore need a video MIME. */
const VIDEO_MEDIA_TYPES = new Set<UploadablePropertyMediaType>(['video', 'reel_video']);

/** Mirrors the bucket's `allowed_mime_types`. Keep the two in sync. */
const acceptedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
]);

/** Mirrors the bucket's 100 MB `file_size_limit`, checked before the round trip. */
export const MAX_MEDIA_BYTES = 104_857_600;

/** Publication statuses whose media a partner may still add to or remove. */
export const EDITABLE_STATUSES = ['draft', 'unpublished'] as const;

export interface PropertyMediaItem {
  id: string;
  mediaType: 'image' | 'video' | 'reel_video' | 'floor_plan' | 'document';
  storagePath: string;
  sortOrder: number;
  isCover: boolean;
  byteSize: number | null;
  /** Signed read URL, or null when the object could not be signed. */
  url: string | null;
}

export async function uploadPropertyMedia(input: {
  propertyId: string;
  body: ArrayBuffer | Blob | Uint8Array;
  mimeType: string;
  mediaType: UploadablePropertyMediaType;
  extension: string;
  isCover?: boolean;
  sortOrder?: number;
  byteSize?: number;
}): Promise<string> {
  if (!acceptedMimeTypes.has(input.mimeType)) throw new Error('Unsupported media type.');
  if (input.mediaType === 'image' && !input.mimeType.startsWith('image/')) {
    throw new Error('An image media record requires an image MIME type.');
  }
  if (VIDEO_MEDIA_TYPES.has(input.mediaType) && !input.mimeType.startsWith('video/')) {
    throw new Error('A video media record requires a video MIME type.');
  }
  if (input.byteSize !== undefined && input.byteSize > MAX_MEDIA_BYTES) {
    throw new Error('This file is larger than the 100 MB limit.');
  }

  const extension = input.extension.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (!extension) throw new Error('A safe file extension is required.');

  // The first path segment MUST be the property id: Storage RLS reads
  // `storage.foldername(name)[1]` to decide whose folder this is.
  const storagePath = `${input.propertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('property-media')
    .upload(storagePath, input.body, { contentType: input.mimeType, upsert: false });
  if (uploadError) throw new Error(`[uploadPropertyMedia] ${uploadError.message}`);

  const { data, error: rowError } = await supabase
    .from('property_media')
    .insert({
      property_id: input.propertyId,
      media_type: input.mediaType,
      storage_bucket: 'property-media',
      storage_path: storagePath,
      is_cover: input.mediaType === 'image' && Boolean(input.isCover),
      sort_order: input.sortOrder ?? 0,
      byte_size: input.byteSize ?? null,
    })
    .select('id')
    .single();

  if (rowError) {
    // Best-effort cleanup of an object the current partner owns. It can never
    // reach a different partner's folder because Storage RLS checks the path.
    await supabase.storage.from('property-media').remove([storagePath]);
    throw new Error(`[uploadPropertyMedia] ${rowError.message}`);
  }
  return data.id;
}

/**
 * Reads a picked file into memory and uploads it.
 *
 * React Native's `fetch` on a `file://` URI yields a Blob, which
 * supabase-js accepts directly. `arrayBuffer()` is used because some RN
 * versions produce a Blob whose size the Storage client cannot infer.
 */
export async function uploadPropertyMediaFromUri(input: {
  propertyId: string;
  uri: string;
  mimeType: string;
  mediaType: UploadablePropertyMediaType;
  fileName?: string | null;
  isCover?: boolean;
  sortOrder?: number;
}): Promise<string> {
  const response = await fetch(input.uri);
  if (!response.ok) throw new Error('The selected file could not be read from the device.');
  const buffer = await response.arrayBuffer();

  if (buffer.byteLength > MAX_MEDIA_BYTES) {
    throw new Error('This file is larger than the 100 MB limit.');
  }
  if (buffer.byteLength === 0) throw new Error('The selected file is empty.');

  return uploadPropertyMedia({
    propertyId: input.propertyId,
    body: buffer,
    mimeType: input.mimeType,
    mediaType: input.mediaType,
    extension: extensionFor(input.mimeType, input.fileName),
    isCover: input.isCover,
    sortOrder: input.sortOrder,
    byteSize: buffer.byteLength,
  });
}

/** Derives a safe extension from the MIME type, falling back to the file name. */
export function extensionFor(mimeType: string, fileName?: string | null): string {
  const byMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
  };
  if (byMime[mimeType]) return byMime[mimeType];
  const fromName = fileName?.split('.').pop() ?? '';
  return fromName.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

/**
 * Lists a property's media with short-lived signed URLs.
 *
 * Signing is per-object and always goes through Storage, so an object whose
 * SELECT policy does not admit the caller simply resolves to `url: null`
 * rather than throwing — the row is still listed so the partner can remove it.
 */
export async function getPropertyMedia(propertyId: string): Promise<PropertyMediaItem[]> {
  const { data, error } = await supabase
    .from('property_media')
    .select('id, media_type, storage_path, sort_order, is_cover, byte_size')
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('media_type', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`[getPropertyMedia] ${error.message}`);

  const rows = data ?? [];
  const signed = await Promise.all(
    rows.map(async (row) => {
      const { data: signedData } = await supabase.storage
        .from('property-media')
        .createSignedUrl(row.storage_path, 60 * 60);
      return {
        id: row.id,
        mediaType: row.media_type as PropertyMediaItem['mediaType'],
        storagePath: row.storage_path,
        sortOrder: row.sort_order ?? 0,
        isCover: Boolean(row.is_cover),
        byteSize: row.byte_size === null ? null : Number(row.byte_size),
        url: signedData?.signedUrl ?? null,
      };
    })
  );
  return signed;
}

/**
 * Removes a media row and its stored object.
 *
 * The row is deleted first: if RLS rejects it (wrong partner, or the property
 * is no longer editable) the object is left untouched, which is the safe
 * ordering. A storage object without a row is invisible to every read path.
 */
export async function deletePropertyMedia(item: {
  id: string;
  storagePath: string;
}): Promise<void> {
  const { error } = await supabase.from('property_media').delete().eq('id', item.id);
  if (error) throw new Error(`[deletePropertyMedia] ${error.message}`);
  await supabase.storage.from('property-media').remove([item.storagePath]);
}

/**
 * Next free `sort_order` for a property.
 *
 * IMPORTANT: `uq_media_order` is unique on (property_id, sort_order) across
 * EVERY media type, not per type. Numbering photos and videos independently
 * would make the first video collide with the first photo, so the next slot
 * is always computed over all of a property's media.
 */
export function nextSortOrder(media: PropertyMediaItem[]): number {
  return media.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;
}

/**
 * Writes a new order across ALL of a property's media.
 *
 * `orderedIds` must list every media row for the property, because
 * `uq_media_order` spans the whole property: renumbering only the photos
 * would collide with whatever slot a video already holds.
 *
 * `uq_media_order` is DEFERRABLE INITIALLY DEFERRED, so a full reshuffle is
 * safe inside one transaction — but PostgREST gives each update its own
 * transaction, so the rows are first parked in a high offset band and then
 * written down to their final values. Without the two passes an intermediate
 * state would collide with a row that has not moved yet.
 */
export async function reorderPropertyMedia(orderedIds: string[]): Promise<void> {
  const OFFSET = 1000;
  for (let index = 0; index < orderedIds.length; index += 1) {
    const { error } = await supabase
      .from('property_media')
      .update({ sort_order: OFFSET + index })
      .eq('id', orderedIds[index]);
    if (error) throw new Error(`[reorderPropertyMedia] ${error.message}`);
  }
  for (let index = 0; index < orderedIds.length; index += 1) {
    const { error } = await supabase
      .from('property_media')
      .update({ sort_order: index })
      .eq('id', orderedIds[index]);
    if (error) throw new Error(`[reorderPropertyMedia] ${error.message}`);
  }
}

/**
 * Promotes one image to cover.
 *
 * `uq_media_one_cover` is a partial unique index, so the previous cover must be
 * cleared before the new one is set or the second update violates it.
 */
export async function setPropertyCover(propertyId: string, mediaId: string): Promise<void> {
  const { error: clearError } = await supabase
    .from('property_media')
    .update({ is_cover: false })
    .eq('property_id', propertyId)
    .eq('is_cover', true);
  if (clearError) throw new Error(`[setPropertyCover] ${clearError.message}`);

  const { error } = await supabase
    .from('property_media')
    .update({ is_cover: true })
    .eq('id', mediaId);
  if (error) throw new Error(`[setPropertyCover] ${error.message}`);
}
