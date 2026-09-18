/**
 * Single-image picking, shared by the user avatar and the partner logo.
 *
 * Both flows need the same three things — a permission check, one image, and a
 * MIME type the bucket will actually accept — so they share one implementation
 * rather than two that can drift apart.
 *
 * expo-image-picker SDK 56: `mediaTypes` takes an array of strings
 * (`['images']`); the old `MediaTypeOptions` enum is gone.
 */

import * as ImagePicker from 'expo-image-picker';

import { resolveImageMime } from '@/lib/profile';

export interface PickedImage {
  uri: string;
  mimeType: string;
  fileName: string | null;
}

export type PickImageResult =
  | { status: 'picked'; image: PickedImage }
  /** The user closed the picker; not an error, so callers stay silent. */
  | { status: 'cancelled' }
  /** Library permission was refused — the caller should explain why it is needed. */
  | { status: 'denied' }
  /** A file the bucket's MIME allowlist would reject. */
  | { status: 'unsupported' };

export async function pickSingleImage(): Promise<PickImageResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    allowsEditing: true,
    // Square, because both destinations render inside a circle or a square
    // tile; cropping here avoids a surprising centre-crop at display time.
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled) return { status: 'cancelled' };

  const asset = result.assets[0];
  if (!asset) return { status: 'cancelled' };

  const mimeType = resolveImageMime(asset.mimeType);
  if (!mimeType) return { status: 'unsupported' };

  return {
    status: 'picked',
    image: { uri: asset.uri, mimeType, fileName: asset.fileName ?? null },
  };
}
