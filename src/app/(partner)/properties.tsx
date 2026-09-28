/**
 * ============================================
 * MY PROPERTIES
 * ============================================
 *
 * The partner's inventory, filtered by what they have to do about each row.
 *
 * ONE QUERY, MANY VIEWS
 * Every listing is loaded once and filtered in memory by `matchesFilter`, the
 * same rule the dashboard counts with. That is deliberate: if the tabs
 * filtered with their own query the counts and the rows could disagree, and
 * the partner would be told "2 need changes" over a list showing three.
 *
 * ACTIONS FOLLOW THE BACKEND, NOT THE OTHER WAY ROUND
 * Edit is only offered where the database will actually accept a write —
 * `draft` and `unpublished`. A listing in `pending_review`, `published` or
 * `archived` opens read-only, because the guard trigger refuses partner writes
 * to those regardless of what this screen renders.
 */

import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button } from '@/components/ui';
import { describeStatus, PropertyStatusBadge } from '@/components/partner/PropertyStatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { getPartnerProperties, type PartnerPropertySummary } from '@/lib/partner';
import {
  FILTER_LABEL_KEYS,
  isPropertyListFilter,
  matchesFilter,
  PROPERTY_LIST_FILTERS,
  type PropertyListFilter,
} from '@/lib/partnerFilters';
import { TYPE_LABEL_KEYS } from '@/lib/propertyFields';
import { getPropertyMedia } from '@/lib/propertyMedia';

export default function PartnerPropertiesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { partnerMemberships } = useAuth();
  const insets = useSafeAreaInsets();

  // The dashboard hands a filter through the route so a status card opens the
  // view it promised.
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<PropertyListFilter>(
    isPropertyListFilter(params.filter) ? params.filter : 'all'
  );

  const [items, setItems] = useState<PartnerPropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const partnerId = partnerMemberships[0]?.partnerId;

  const load = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }
    try {
      const rows = await getPartnerProperties(partnerId);

      // Cover thumbnails resolve per row because each needs its own signed
      // URL. Failures are swallowed: a missing thumbnail must never stop the
      // list from rendering.
      const withCovers = await Promise.all(
        rows.map(async (row) => {
          try {
            const media = await getPropertyMedia(row.id);
            const cover =
              media.find((item) => item.mediaType === 'image' && item.isCover)
              ?? media.find((item) => item.mediaType === 'image');
            return { ...row, coverUrl: cover?.url ?? null };
          } catch {
            return { ...row, coverUrl: null };
          }
        })
      );
      setItems(withCovers);
    } catch {
      Alert.alert(t('couldNotLoadYourProperties'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [partnerId, t]);

  // Re-read on focus so returning from Edit Property shows the new status.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const visible = useMemo(() => items.filter((item) => matchesFilter(item, filter)), [items, filter]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.accent}
          />
        }
      >
        <Text style={styles.title}>{t('myProperties')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {PROPERTY_LIST_FILTERS.map((option) => {
            const active = option === filter;
            const count = items.filter((item) => matchesFilter(item, option)).length;
            return (
              <Pressable
                key={option}
                onPress={() => setFilter(option)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.filter, active && styles.filterActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {t(FILTER_LABEL_KEYS[option])} {count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Button
          title={t('addProperty')}
          size="sm"
          icon="create"
          fullWidth={false}
          onPress={() => router.push('/(partner)/add-property')}
        />

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : visible.length === 0 ? (
          <Text style={styles.empty}>
            {items.length === 0 ? t('noPropertiesYet') : t('noPropertiesForFilter')}
          </Text>
        ) : (
          visible.map((item) => {
            const presentation = describeStatus(item.publicationStatus, Boolean(item.rejectionReason));
            const needsAction = Boolean(item.rejectionReason) && presentation.editable;

            return (
              <Pressable
                key={item.id}
                onPress={() => router.push({ pathname: '/(partner)/edit-property', params: { id: item.id } })}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${t(presentation.labelKey)}`}
                style={({ pressed }) => [styles.card, needsAction && styles.cardAlert, pressed && styles.pressed]}
              >
                <View style={styles.cardRow}>
                  {item.coverUrl ? (
                    <Image source={{ uri: item.coverUrl }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbFallback]}>
                      <AppIcon name="image" size="md" color={colors.textMuted} />
                    </View>
                  )}

                  <View style={styles.cardBody}>
                    <Text style={styles.name} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {t(TYPE_LABEL_KEYS[item.propertyType])} · {item.cityName}
                    </Text>
                    <Text style={styles.reference} numberOfLines={1}>
                      {item.referenceCode}
                    </Text>
                    <Text style={styles.price} numberOfLines={1}>
                      {item.priceCurrency} {(item.priceAmount / 100).toLocaleString()}
                    </Text>
                    <PropertyStatusBadge
                      status={item.publicationStatus}
                      hasRejectionReason={Boolean(item.rejectionReason)}
                    />
                  </View>
                </View>

                {/* The review note is the whole reason this listing came back,
                    so it sits on the card rather than behind another tap. */}
                {item.rejectionReason ? (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>{t('reviewNote')}</Text>
                    <Text style={styles.reason} numberOfLines={4}>
                      {item.rejectionReason}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.hint, needsAction && styles.hintAlert]} numberOfLines={2}>
                    {t(presentation.hintKey)}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.action}>
                    {needsAction
                      ? t('fixAndResubmit')
                      : presentation.editable
                        ? t('editListing')
                        : item.publicationStatus === 'pending_review'
                          ? t('awaitingReview')
                          : item.publicationStatus === 'published'
                            ? t('liveLabel')
                            : t('viewListing')}
                  </Text>
                  <AppIcon name="arrowForward" size="xs" color={colors.textMuted} />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.md },
  title: { ...t.typography.h2, color: t.colors.text },
  filters: { gap: 6, paddingVertical: 2 },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: t.borderRadius.full,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  filterActive: { borderColor: t.colors.accent, backgroundColor: t.colors.surfaceAlt },
  filterText: { ...t.typography.caption, color: t.colors.textSecondary },
  filterTextActive: { color: t.colors.accent, fontWeight: '700' },
  loader: { marginTop: t.spacing.xl },
  empty: { ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.xl },
  card: {
    gap: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  cardAlert: { borderColor: t.colors.warning },
  pressed: { opacity: 0.85 },
  cardRow: { flexDirection: 'row', gap: t.spacing.smd },
  thumb: { width: 78, height: 78, borderRadius: t.borderRadius.md, backgroundColor: t.colors.surfaceAlt },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, minWidth: 0, gap: 3 },
  name: { ...t.typography.bodyBold, color: t.colors.text },
  meta: { ...t.typography.caption, color: t.colors.textSecondary },
  reference: { ...t.typography.tiny, color: t.colors.textMuted },
  price: { ...t.typography.captionBold, color: t.colors.text },
  hint: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  hintAlert: { color: t.colors.warning },
  reasonBox: {
    gap: 3,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surfaceAlt,
  },
  reasonLabel: { ...t.typography.tiny, color: t.colors.warning, fontWeight: '700' },
  reason: { ...t.typography.tiny, color: t.colors.text, lineHeight: 16 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    paddingTop: t.spacing.sm,
  },
  action: { ...t.typography.tiny, color: t.colors.textMuted },
}));
