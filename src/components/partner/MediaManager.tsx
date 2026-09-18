/**
 * ============================================
 * MEDIA MANAGER
 * ============================================
 *
 * Photo and video management for one editable listing.
 *
 * UPLOAD MODEL
 * A picked file becomes a local "pending" row immediately, so the partner sees
 * the thumbnail before the network finishes. Each pending row owns its own
 * status (`uploading` | `error`), which is what makes a per-item Retry possible
 * instead of forcing the whole batch to be re-picked.
 *
 * DOUBLE-UPLOAD GUARD
 * `busyRef` is a ref, not state: two taps in the same frame would both read a
 * stale `false` from state and both start an upload. The ref is written
 * synchronously, so the second tap sees `true`.
 *
 * ORDERING
 * Photo order is `property_media.sort_order`; the first photo is also the
 * cover. Reordering is exposed as move-up / move-down rather than drag, which
 * keeps this dependency-free and works with screen readers.
 */

import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { AppIcon, Button } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import {
  deletePropertyMedia,
  getPropertyMedia,
  nextSortOrder,
  reorderPropertyMedia,
  setPropertyCover,
  uploadPropertyMediaFromUri,
  type PropertyMediaItem,
  type UploadablePropertyMediaType,
} from '@/lib/propertyMedia';

/** A file chosen on the device that has not finished uploading. */
interface PendingMedia {
  key: string;
  uri: string;
  mimeType: string;
  mediaType: UploadablePropertyMediaType;
  fileName: string | null;
  status: 'uploading' | 'error';
  error?: string;
}

export interface MediaManagerProps {
  propertyId: string;
  /** Media already stored for this listing */
  media: PropertyMediaItem[];
  /** True while the parent still allows edits (draft / rejected) */
  editable: boolean;
  onChange: (next: PropertyMediaItem[]) => void;
}

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME = new Set(['video/mp4', 'video/quicktime']);

export function MediaManager({ propertyId, media, editable, onChange }: MediaManagerProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [pending, setPending] = useState<PendingMedia[]>([]);
  const [working, setWorking] = useState(false);
  const busyRef = useRef(false);

  const photos = media.filter((item) => item.mediaType === 'image');
  const videos = media.filter((item) => item.mediaType === 'video');
  const reels = media.filter((item) => item.mediaType === 'reel_video');

  const refresh = useCallback(async () => {
    onChange(await getPropertyMedia(propertyId));
  }, [propertyId, onChange]);

  /** Normalises what the picker returns into a MIME type the bucket accepts. */
  const resolveMime = (
    asset: ImagePicker.ImagePickerAsset,
    kind: UploadablePropertyMediaType
  ): string | null => {
    const raw = asset.mimeType?.toLowerCase() ?? '';
    if (kind === 'image') {
      if (IMAGE_MIME.has(raw)) return raw;
      // iOS often reports nothing for a library photo; JPEG is the safe default
      // and matches what the picker writes to the cache directory.
      return raw.startsWith('image/') ? null : 'image/jpeg';
    }
    if (VIDEO_MIME.has(raw)) return raw;
    return raw.startsWith('video/') ? null : 'video/mp4';
  };

  const runUpload = useCallback(
    async (item: PendingMedia, sortOrder: number) => {
      try {
        await uploadPropertyMediaFromUri({
          propertyId,
          uri: item.uri,
          mimeType: item.mimeType,
          mediaType: item.mediaType,
          fileName: item.fileName,
          // The first photo of a listing with no cover yet becomes the cover.
          isCover: item.mediaType === 'image' && photos.length === 0,
          sortOrder,
        });
        setPending((current) => current.filter((row) => row.key !== item.key));
        await refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : t('uploadFailed');
        setPending((current) =>
          current.map((row) => (row.key === item.key ? { ...row, status: 'error', error: message } : row))
        );
      }
    },
    [propertyId, refresh, photos.length, t]
  );

  const pick = useCallback(
    async (kind: UploadablePropertyMediaType) => {
      if (busyRef.current || !editable) return;
      busyRef.current = true;
      setWorking(true);
      try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(t('photoAccessNeeded'), t('photoAccessNeededBody'));
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: kind === 'image' ? ['images'] : ['videos'],
          allowsMultipleSelection: kind === 'image',
          // One property tour and one reel per listing; photos are a gallery.
          selectionLimit: kind === 'image' ? 10 : 1,
          quality: 0.85,
        });
        if (result.canceled) return;

        const accepted: PendingMedia[] = [];
        for (const asset of result.assets) {
          const mimeType = resolveMime(asset, kind);
          if (!mimeType) {
            Alert.alert(t('unsupportedFile'), t('unsupportedFileBody'));
            continue;
          }
          accepted.push({
            key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            uri: asset.uri,
            mimeType,
            mediaType: kind,
            fileName: asset.fileName ?? null,
            status: 'uploading',
          });
        }
        if (accepted.length === 0) return;

        setPending((current) => [...current, ...accepted]);
        // Uploads run in sequence so sort_order stays deterministic and a slow
        // connection is not asked to hold ten concurrent request bodies.
        // The slot is property-wide: uq_media_order spans every media type, so
        // numbering videos from zero would collide with the first photo.
        let nextOrder = nextSortOrder(media);
        for (const item of accepted) {
          await runUpload(item, nextOrder);
          nextOrder += 1;
        }
      } finally {
        busyRef.current = false;
        setWorking(false);
      }
    },
    [editable, media, runUpload, t]
  );

  const retry = useCallback(
    async (item: PendingMedia) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setWorking(true);
      setPending((current) =>
        current.map((row) => (row.key === item.key ? { ...row, status: 'uploading', error: undefined } : row))
      );
      try {
        await runUpload(item, nextSortOrder(media));
      } finally {
        busyRef.current = false;
        setWorking(false);
      }
    },
    [media, runUpload]
  );

  const discard = (key: string) => setPending((current) => current.filter((row) => row.key !== key));

  const remove = (item: PropertyMediaItem) => {
    Alert.alert(t('removeMediaTitle'), t('removeMediaBody'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('remove'),
        style: 'destructive',
        onPress: async () => {
          if (busyRef.current) return;
          busyRef.current = true;
          setWorking(true);
          try {
            await deletePropertyMedia(item);
            await refresh();
          } catch (error) {
            Alert.alert(t('couldNotRemove'), error instanceof Error ? error.message : t('pleaseTryAgain'));
          } finally {
            busyRef.current = false;
            setWorking(false);
          }
        },
      },
    ]);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length || busyRef.current) return;
    busyRef.current = true;
    setWorking(true);
    try {
      const ordered = [...photos];
      const [moved] = ordered.splice(index, 1);
      ordered.splice(target, 0, moved);
      // Every row is renumbered, not just the photos: uq_media_order is unique
      // per property, so leaving the videos on their old slots would collide.
      const others = media.filter((item) => item.mediaType !== 'image');
      await reorderPropertyMedia([...ordered, ...others].map((item) => item.id));
      // Position 0 is the cover, so a reorder has to re-point it.
      if (ordered[0] && !ordered[0].isCover) await setPropertyCover(propertyId, ordered[0].id);
      await refresh();
    } catch (error) {
      Alert.alert(t('couldNotReorder'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      busyRef.current = false;
      setWorking(false);
    }
  };

  if (!editable) {
    return (
      <View style={styles.block}>
        <Text style={styles.heading}>{t('media')}</Text>
        <Text style={styles.note}>
          {media.length === 0
            ? t('noMediaUploaded')
            : `${photos.length} ${t('photosLabel')} · ${videos.length} ${t('videosLabel')} · ${
                reels.length
              } ${t('reelsLabel')} — ${t('mediaDraftOnlyNote')}`}
        </Text>
        <MediaStrip items={photos} />
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{t('photos')}</Text>
        {working ? <ActivityIndicator color={colors.accent} size="small" /> : null}
      </View>
      <Text style={styles.note}>{t('coverPhotoNote')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {photos.map((item, index) => (
          <View key={item.id} style={styles.tile}>
            {item.url ? (
              <Image source={{ uri: item.url }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <AppIcon name="image" size="md" color={colors.textMuted} />
              </View>
            )}
            {index === 0 ? <Text style={styles.coverTag}>{t('coverTag')}</Text> : null}
            <View style={styles.tileActions}>
              <TileButton icon="back" label={t('moveLeft')} onPress={() => void move(index, -1)} disabled={index === 0} />
              <TileButton
                icon="arrowForward"
                label={t('moveRight')}
                onPress={() => void move(index, 1)}
                disabled={index === photos.length - 1}
              />
              <TileButton icon="close" label={t('remove')} onPress={() => remove(item)} tone="error" />
            </View>
          </View>
        ))}

        {pending
          .filter((item) => item.mediaType === 'image')
          .map((item) => (
            <PendingTile key={item.key} item={item} onRetry={() => void retry(item)} onDiscard={() => discard(item.key)} />
          ))}
      </ScrollView>

      <Button title={t('addPhotos')} variant="secondary" size="md" icon="images" onPress={() => void pick('image')} disabled={working} />

      <Text style={[styles.heading, styles.spaced]}>{t('propertyVideo')}</Text>
      <Text style={styles.note}>{t('propertyVideoNote')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {videos.map((item) => (
          <View key={item.id} style={styles.tile}>
            <View style={[styles.thumb, styles.thumbFallback]}>
              <AppIcon name="video" size="lg" color={colors.accent} />
            </View>
            <View style={styles.tileActions}>
              <TileButton icon="close" label={t('remove')} onPress={() => remove(item)} tone="error" />
            </View>
          </View>
        ))}
        {pending
          .filter((item) => item.mediaType === 'video')
          .map((item) => (
            <PendingTile key={item.key} item={item} onRetry={() => void retry(item)} onDiscard={() => discard(item.key)} />
          ))}
      </ScrollView>

      <Button title={t('addVideo')} variant="secondary" size="md" icon="video" onPress={() => void pick('video')} disabled={working} />

      <Text style={[styles.heading, styles.spaced]}>{t('reelVideo')}</Text>
      <Text style={styles.note}>{t('reelVideoNote')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {reels.map((item) => (
          <View key={item.id} style={styles.tile}>
            <View style={[styles.thumb, styles.thumbFallback, styles.reelThumb]}>
              <AppIcon name="reels" size="lg" color={colors.accent} />
            </View>
            <View style={styles.tileActions}>
              <TileButton icon="close" label={t('removeReel')} onPress={() => remove(item)} tone="error" />
            </View>
          </View>
        ))}
        {pending
          .filter((item) => item.mediaType === 'reel_video')
          .map((item) => (
            <PendingTile key={item.key} item={item} onRetry={() => void retry(item)} onDiscard={() => discard(item.key)} />
          ))}
      </ScrollView>

      <Button
        title={reels.length > 0 ? t('replaceReel') : t('addReelVideo')}
        variant="secondary"
        size="md"
        icon="reels"
        onPress={() => void pick('reel_video')}
        disabled={working}
      />
    </View>
  );
}

/** Read-only strip used when the listing is no longer editable. */
function MediaStrip({ items }: { items: PropertyMediaItem[] }) {
  const styles = useStyles();
  if (items.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {items.map((item) =>
        item.url ? <Image key={item.id} source={{ uri: item.url }} style={styles.thumb} resizeMode="cover" /> : null
      )}
    </ScrollView>
  );
}

function PendingTile({
  item,
  onRetry,
  onDiscard,
}: {
  item: PendingMedia;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const failed = item.status === 'error';

  return (
    <View style={styles.tile}>
      {item.mediaType === 'image' ? (
        <Image source={{ uri: item.uri }} style={[styles.thumb, styles.thumbDim]} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]}>
          <AppIcon name={item.mediaType === 'reel_video' ? 'reels' : 'video'} size="lg" color={colors.textMuted} />
        </View>
      )}
      <View style={styles.overlay} pointerEvents={failed ? 'auto' : 'none'}>
        {failed ? (
          <>
            <Text style={styles.errorText} numberOfLines={3}>
              {item.error ?? t('uploadFailed')}
            </Text>
            <View style={styles.tileActions}>
              <TileButton icon="replay" label={t('retryUpload')} onPress={onRetry} />
              <TileButton icon="close" label={t('discard')} onPress={onDiscard} tone="error" />
            </View>
          </>
        ) : (
          <ActivityIndicator color="#FFFFFF" />
        )}
      </View>
    </View>
  );
}

function TileButton({
  icon,
  label,
  onPress,
  disabled,
  tone,
}: {
  icon: 'back' | 'arrowForward' | 'close' | 'replay';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'error';
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.tileButton, disabled && styles.tileButtonDisabled, pressed && styles.pressed]}
    >
      <AppIcon name={icon} size="xs" color={tone === 'error' ? colors.error : colors.text} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  block: { gap: t.spacing.sm },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { ...t.typography.label, color: t.colors.textSecondary },
  spaced: { marginTop: t.spacing.md },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  reelThumb: { borderWidth: 1, borderColor: t.colors.accent },
  strip: { gap: t.spacing.sm, paddingVertical: t.spacing.sm },
  tile: { width: 108, gap: 6 },
  thumb: {
    width: 108,
    height: 108,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surfaceAlt,
  },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  thumbDim: { opacity: 0.45 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    borderRadius: t.borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  errorText: { ...t.typography.tiny, color: '#FFFFFF', textAlign: 'center' },
  coverTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    ...t.typography.tiny,
    fontSize: 9,
    color: t.colors.onAccent,
    backgroundColor: t.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: t.borderRadius.sm,
    overflow: 'hidden',
  },
  tileActions: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  tileButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.sm,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  tileButtonDisabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
}));

export default MediaManager;
