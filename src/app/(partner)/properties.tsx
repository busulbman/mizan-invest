/**
 * ============================================
 * MY PROPERTIES
 * ============================================
 *
 * The partner's listing inventory, grouped by what the partner has to do
 * about each row rather than by database status.
 *
 * Every card states its status and offers exactly the action that status
 * allows: Edit for a draft or a listing with changes requested, nothing for
 * one in review, view-only for a published listing. Submitting happens inside
 * Edit Property, where validation and media live — offering it here would let
 * a partner submit a listing they have not looked at.
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button, IconButton } from '@/components/ui';
import { describeStatus, PropertyStatusBadge } from '@/components/partner/PropertyStatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { getPartnerProperties, type PartnerPropertySummary } from '@/lib/partner';
import { goBackOr } from '@/lib/navigation';
import { getPropertyMedia } from '@/lib/propertyMedia';

export default function PartnerPropertiesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { partnerMemberships } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

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

      // Cover thumbnails are resolved per row because each one needs its own
      // signed URL. Failures are swallowed: a missing thumbnail must never
      // stop the list from rendering.
      const withCovers = await Promise.all(
        rows.map(async (row) => {
          try {
            const media = await getPropertyMedia(row.id);
            const cover = media.find((item) => item.mediaType === 'image' && item.isCover)
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

  // Re-read on focus so returning from Edit Property shows the new status
  // without a manual pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
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
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goBackOr('/(partner)/dashboard')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title}>{t('myProperties')}</Text>
          <View style={styles.spacer} />
        </View>

        <Button
          title={t('addProperty')}
          size="sm"
          icon="create"
          onPress={() => router.push('/(partner)/add-property')}
          fullWidth={false}
        />

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>{t('noPropertiesYet')}</Text>
        ) : (
          items.map((item) => {
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
                      {item.cityName} · {item.referenceCode}
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

                <Text style={[styles.hint, needsAction && styles.hintAlert]} numberOfLines={2}>
                  {t(presentation.hintKey)}
                </Text>

                {item.rejectionReason ? (
                  <Text style={styles.reason} numberOfLines={3}>
                    {t('reviewNote')}: {item.rejectionReason}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.action}>
                    {presentation.editable ? t('tapToEdit') : t('tapToView')}
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
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
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
  cardBody: { flex: 1, minWidth: 0, gap: 4 },
  name: { ...t.typography.bodyBold, color: t.colors.text },
  meta: { ...t.typography.caption, color: t.colors.textSecondary },
  price: { ...t.typography.captionBold, color: t.colors.text },
  hint: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  hintAlert: { color: t.colors.warning },
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
