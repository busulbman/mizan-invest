/**
 * ============================================
 * SUPPORTING CARDS
 * ============================================
 *
 * The non-listing tiles used by Home: property categories, popular
 * cities, verified partners and the AI insight strip.
 *
 * Every one of them caps its label to a single line with an ellipsis.
 * These tiles sit in fixed-width grids and rails, so an un-capped
 * Russian label — "Коммерческая недвижимость" against a 4-up grid —
 * is exactly where text used to break out of its tile.
 */

import { Pressable, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { IconName } from '@/constants/icons';
import { Partner } from '@/constants/mockData';
import { countryNameKey } from '@/constants/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

// ============================================
// CATEGORY TILE
// ============================================

export interface CategoryCardProps {
  name: string;
  icon: IconName;
  count: number;
  active?: boolean;
  onPress: () => void;
}

export function CategoryCard({ name, icon, count, active = false, onPress }: CategoryCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.category,
        active && styles.categoryActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.categoryIcon, active && styles.categoryIconActive]}>
        <AppIcon name={icon} size="lg" color={active ? colors.accent : colors.textSecondary} />
      </View>
      <Text
        style={[styles.categoryName, active && styles.categoryNameActive]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {name}
      </Text>
      <Text style={styles.categoryCount} numberOfLines={1}>
        {count} {t('objectsShort')}
      </Text>
    </Pressable>
  );
}

// ============================================
// CITY CARD
// ============================================

export interface CityCardProps {
  name: string;
  image: string;
  count: number;
  onPress: () => void;
}

export function CityCard({ name, image, count, onPress }: CityCardProps) {
  const styles = useStyles();
  const { t } = useLanguage();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [styles.city, pressed && styles.pressed]}
    >
      <RemoteImage uri={image} style={styles.cityImage} />
      <View style={styles.cityScrim} />
      <View style={styles.cityBody}>
        <Text style={styles.cityName} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
        <Text style={styles.cityCount} numberOfLines={1}>
          {count} {t('objectsShort')}
        </Text>
      </View>
    </Pressable>
  );
}

// ============================================
// PARTNER CARD
// ============================================

export function PartnerCard({ partner, onPress }: { partner: Partner; onPress: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={partner.name}
      style={({ pressed }) => [styles.partner, pressed && styles.pressed]}
    >
      <RemoteImage uri={partner.logo} style={styles.partnerLogo} />

      <View style={styles.partnerBody}>
        <Text style={styles.partnerName} numberOfLines={2} ellipsizeMode="tail">
          {partner.name}
        </Text>

        <View style={styles.partnerMetaRow}>
          <AppIcon name="location" size="xs" color={colors.textMuted} />
          <Text style={styles.partnerCountry} numberOfLines={1} ellipsizeMode="tail">
            {t(countryNameKey(partner.countryCode))}
          </Text>
        </View>

        <View style={styles.partnerFooter}>
          {partner.verified && <Badge label={t('verified')} tone="success" icon="verified" small />}
          <View style={styles.partnerRating}>
            <AppIcon name="star" size="xs" color={colors.warning} />
            <Text style={styles.partnerRatingText}>{partner.rating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ============================================
// AI INSIGHT TILE
// ============================================

export interface InsightCardProps {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  tone: 'success' | 'info' | 'accent' | 'warning';
}

export function InsightCard({ label, value, trend, tone }: InsightCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const toneColor = {
    success: colors.success,
    info: colors.info,
    accent: colors.accent,
    warning: colors.warning,
  }[tone];

  const trendIcon: IconName =
    trend === 'up' ? 'trendUp' : trend === 'down' ? 'trendDown' : 'trendStable';

  return (
    <View style={styles.insight}>
      <View style={[styles.insightIcon, { backgroundColor: `${toneColor}1F` }]}>
        <AppIcon name={trendIcon} size="sm" color={toneColor} />
      </View>
      <Text style={styles.insightValue} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
      <Text style={styles.insightLabel} numberOfLines={2} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  pressed: {
    opacity: 0.85,
  },

  // ---- Category ----
  category: {
    width: 104,
    marginRight: t.spacing.sm,
    paddingVertical: t.spacing.smd,
    paddingHorizontal: t.spacing.sm,
    borderRadius: t.borderRadius.xl,
    alignItems: 'center',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  categoryActive: {
    borderColor: t.colors.accent,
    backgroundColor: t.colors.accentOverlay.light,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: t.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceAlt,
    marginBottom: t.spacing.sm,
  },
  categoryIconActive: {
    backgroundColor: t.colors.surface,
  },
  categoryName: {
    maxWidth: '100%',
    ...t.typography.tiny,
    color: t.colors.text,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: t.colors.text,
  },
  categoryCount: {
    maxWidth: '100%',
    ...t.typography.tiny,
    color: t.colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },

  // ---- City ----
  city: {
    width: 148,
    height: 100,
    marginRight: t.spacing.smd,
    borderRadius: t.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: t.colors.surfaceAlt,
  },
  cityImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cityScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 13, 24, 0.45)',
  },
  cityBody: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: t.spacing.smd,
  },
  cityName: {
    ...t.typography.bodyBold,
    color: t.colors.onDark,
  },
  cityCount: {
    ...t.typography.tiny,
    color: t.colors.onDarkMuted,
    marginTop: 1,
  },

  // ---- Partner ----
  partner: {
    width: 208,
    marginRight: t.spacing.smd,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: 'hidden',
    ...t.shadows.card,
  },
  partnerLogo: {
    width: '100%',
    height: 84,
  },
  partnerBody: {
    padding: t.spacing.smd,
    gap: 3,
  },
  partnerName: {
    ...t.typography.captionBold,
    color: t.colors.text,
    minHeight: 36,
  },
  partnerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minWidth: 0,
  },
  partnerCountry: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.tiny,
    color: t.colors.textMuted,
  },
  partnerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
    marginTop: t.spacing.sm,
  },
  partnerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  partnerRatingText: {
    ...t.typography.tiny,
    color: t.colors.text,
  },

  // ---- Insight ----
  insight: {
    // Two per row with a 12pt gap, on every screen width
    width: (t.metrics.screenWidth - t.spacing.screenHorizontal * 2 - t.spacing.smd) / 2,
    padding: t.spacing.smd,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  insightIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.sm,
  },
  insightValue: {
    ...t.typography.h3,
    color: t.colors.text,
  },
  insightLabel: {
    ...t.typography.tiny,
    color: t.colors.textSecondary,
    marginTop: 1,
  },
}));
