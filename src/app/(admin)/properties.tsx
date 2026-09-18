/**
 * ============================================
 * ADMIN — PROPERTY REVIEW
 * ============================================
 *
 * The review queue. An admin can see a listing's media before deciding, which
 * is the point of this screen: approving a listing whose photos were never
 * looked at is how a bad listing reaches customers.
 *
 * Media loads on demand, one listing at a time, because every object needs its
 * own signed URL and the queue can be long.
 *
 * REJECTION
 * The reason is collected through PromptSheet, a cross-platform sheet.
 * `Alert.prompt` is iOS-only — on Android it silently does nothing, so an
 * admin could tap Reject and never learn the listing was untouched.
 *
 * SCOPE
 * Nothing here surfaces partner-private contact data. `partner_private` lives
 * in a schema PostgREST does not serve, so this screen could not read it even
 * if it tried.
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button, IconButton, PromptSheet } from '@/components/ui';
import type { TranslationKey } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';
import {
  getAdminProperties,
  reviewProperty,
  type PartnerPropertyStatus,
  type PartnerPropertySummary,
} from '@/lib/partner';
import { getPropertyMedia, type PropertyMediaItem } from '@/lib/propertyMedia';

const TABS: Array<{ key: string; labelKey: TranslationKey; status?: PartnerPropertyStatus }> = [
  { key: 'pending', labelKey: 'tabPending', status: 'pending_review' },
  { key: 'published', labelKey: 'tabPublished', status: 'published' },
  { key: 'rejected', labelKey: 'tabRejected', status: 'unpublished' },
  { key: 'all', labelKey: 'tabAll' },
];

/** `publication_status` -> the badge wording an admin sees. */
const STATUS_LABELS: Record<PartnerPropertyStatus, TranslationKey> = {
  draft: 'statusDraft',
  pending_review: 'statusPendingReview',
  published: 'statusPublished',
  unpublished: 'statusUnpublished',
  archived: 'statusArchived',
};

export default function AdminPropertiesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<PartnerPropertyStatus | undefined>('pending_review');
  const [items, setItems] = useState<PartnerPropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [media, setMedia] = useState<Record<string, PropertyMediaItem[]>>({});
  const [mediaLoading, setMediaLoading] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PartnerPropertySummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAdminProperties(status));
    } catch {
      Alert.alert(t('couldNotLoadProperties'));
    } finally {
      setLoading(false);
    }
  }, [status, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, decision: 'approved' | 'rejected' | 'archived', reason?: string) => {
    setBusy(id);
    try {
      await reviewProperty(id, decision, reason);
      await load();
    } catch (error) {
      Alert.alert(t('couldNotUpdate'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setBusy(null);
    }
  };

  const toggleMedia = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (media[id]) return;

    setMediaLoading(id);
    try {
      const rows = await getPropertyMedia(id);
      setMedia((current) => ({ ...current, [id]: rows }));
    } catch (error) {
      Alert.alert(t('couldNotLoadMedia'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setMediaLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goBackOr('/(admin)/dashboard')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title}>{t('propertiesTitle')}</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setStatus(tab.status)}
              accessibilityRole="tab"
              accessibilityState={{ selected: status === tab.status }}
              style={[styles.tab, status === tab.status && styles.tabActive]}
            >
              <Text style={styles.tabText}>{t(tab.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>{t('noPropertiesInQueue')}</Text>
        ) : (
          items.map((item) => {
            const rows = media[item.id] ?? [];
            const photos = rows.filter((row) => row.mediaType === 'image');
            const videos = rows.filter((row) => row.mediaType === 'video');
            // Reels are a distinct enum value, so an admin can tell a vertical
            // clip from a property tour instead of guessing from a thumbnail.
            const reels = rows.filter((row) => row.mediaType === 'reel_video');
            const isOpen = expanded === item.id;

            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.meta}>
                  {item.referenceCode} · {item.cityName} · {item.priceCurrency}{' '}
                  {(item.priceAmount / 100).toLocaleString()}
                </Text>
                <Text style={styles.meta}>{t(STATUS_LABELS[item.publicationStatus])}</Text>

                <Pressable onPress={() => void toggleMedia(item.id)} accessibilityRole="button" style={styles.mediaToggle}>
                  <AppIcon name={isOpen ? 'chevronUp' : 'chevronDown'} size="xs" color={colors.accent} />
                  <Text style={styles.mediaToggleText}>
                    {isOpen ? t('hideMedia') : t('reviewMediaBeforeDeciding')}
                  </Text>
                </Pressable>

                {isOpen ? (
                  mediaLoading === item.id ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : rows.length === 0 ? (
                    <Text style={styles.warn}>{t('noMediaUploaded')}</Text>
                  ) : (
                    <>
                      <Text style={styles.mediaCount}>
                        {photos.length} {t('photosLabel')} · {videos.length} {t('videosLabel')} · {reels.length}{' '}
                        {t('reelsLabel')}
                      </Text>

                      <Text style={styles.mediaGroup}>{t('photos')}</Text>
                      {photos.length === 0 ? (
                        <Text style={styles.warn}>{t('noPhotosUploaded')}</Text>
                      ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
                          {photos.map((row) =>
                            row.url ? (
                              <Image key={row.id} source={{ uri: row.url }} style={styles.thumb} resizeMode="cover" />
                            ) : (
                              <View key={row.id} style={[styles.thumb, styles.thumbFallback]}>
                                <AppIcon name="warning" size="sm" color={colors.error} />
                              </View>
                            )
                          )}
                        </ScrollView>
                      )}

                      {videos.length > 0 ? (
                        <>
                          <Text style={styles.mediaGroup}>{t('propertyVideo')}</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
                            {videos.map((row) => (
                              <View key={row.id} style={[styles.thumb, styles.thumbFallback]}>
                                <AppIcon name="video" size="lg" color={colors.accent} />
                              </View>
                            ))}
                          </ScrollView>
                        </>
                      ) : null}

                      {reels.length > 0 ? (
                        <>
                          <Text style={styles.mediaGroup}>{t('reelVideo')}</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
                            {reels.map((row) => (
                              <View key={row.id} style={[styles.thumb, styles.thumbFallback, styles.reelThumb]}>
                                <AppIcon name="reels" size="lg" color={colors.accent} />
                              </View>
                            ))}
                          </ScrollView>
                        </>
                      ) : null}
                    </>
                  )
                ) : null}

                {item.publicationStatus === 'pending_review' ? (
                  <View style={styles.actions}>
                    <Button
                      title={t('approveAndPublish')}
                      size="sm"
                      onPress={() => void act(item.id, 'approved')}
                      loading={busy === item.id}
                    />
                    <Button
                      title={t('reject')}
                      variant="secondary"
                      size="sm"
                      onPress={() => setRejecting(item)}
                      disabled={busy === item.id}
                    />
                  </View>
                ) : null}

                {item.publicationStatus === 'published' ? (
                  <Button
                    title={t('archiveAction')}
                    variant="secondary"
                    size="sm"
                    onPress={() => void act(item.id, 'archived')}
                    loading={busy === item.id}
                  />
                ) : null}

                {item.rejectionReason ? (
                  <Text style={styles.reject}>
                    {t('reasonLabel')}: {item.rejectionReason}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <PromptSheet
        visible={rejecting !== null}
        title={t('rejectListing')}
        subtitle={rejecting ? `${rejecting.referenceCode} — ${rejecting.title}` : undefined}
        label={t('reasonShownToPartner')}
        placeholder={t('rejectListingPlaceholder')}
        confirmTitle={t('reject')}
        minLength={10}
        busy={busy === rejecting?.id}
        onCancel={() => setRejecting(null)}
        onConfirm={(reason) => {
          const target = rejecting;
          setRejecting(null);
          if (target) void act(target.id, 'rejected', reason);
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
  tabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  tabActive: { borderColor: t.colors.accent, backgroundColor: t.colors.surfaceAlt },
  tabText: { ...t.typography.caption, color: t.colors.text },
  loader: { marginTop: t.spacing.xl },
  empty: { ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.xl },
  card: {
    gap: 7,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  actions: { flexDirection: 'row', gap: t.spacing.sm },
  name: { ...t.typography.bodyBold, color: t.colors.text },
  meta: { ...t.typography.caption, color: t.colors.textSecondary },
  mediaToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  mediaToggleText: { ...t.typography.caption, color: t.colors.accent },
  mediaCount: { ...t.typography.tiny, color: t.colors.textMuted },
  strip: { gap: t.spacing.sm, paddingVertical: 4 },
  thumb: { width: 92, height: 92, borderRadius: t.borderRadius.md, backgroundColor: t.colors.surfaceAlt },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  reelThumb: { borderWidth: 1, borderColor: t.colors.accent },
  mediaGroup: { ...t.typography.tiny, color: t.colors.textSecondary, marginTop: 4, fontWeight: '700' },
  warn: { ...t.typography.caption, color: t.colors.warning },
  reject: { ...t.typography.caption, color: t.colors.error },
}));
