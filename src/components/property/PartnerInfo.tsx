/**
 * ============================================
 * PARTNER INFO COMPONENT
 * ============================================
 *
 * Verified partner information card.
 * Shows: Logo, Name, Rating, Listings count
 *
 * Used in: Property Detail Screen
 *
 * TODO: Add navigation to partner profile
 * TODO: Add direct contact options
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { theme } from '@/theme';
import { Partner } from '@/constants/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';

// ============================================
// TYPES
// ============================================

export interface PartnerInfoProps {
  partner: Partner;
  onViewProfile?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function PartnerInfo({ partner, onViewProfile }: PartnerInfoProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <Text style={styles.title}>{t('listedBy')}</Text>

      {/* Partner Card */}
      <View style={styles.card}>
        {/* Partner Logo */}
        <View style={styles.logoContainer}>
          {/* TODO: Replace with actual partner logo */}
          <Image source={{ uri: partner.logo }} style={styles.logo} />
          {partner.verified && (
            <View style={styles.verifiedBadge}>
              <AppIcon name="verified" size="xs" color={theme.colors.white} />
            </View>
          )}
        </View>

        {/* Partner Info */}
        <View style={styles.info}>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <Text style={styles.partnerCountry}>{partner.country}</Text>

          <View style={styles.statsRow}>
            {/* Rating */}
            <View style={styles.stat}>
              <AppIcon name="star" size="sm" color={theme.colors.warning} />
              <Text style={styles.statValue}>{partner.rating}</Text>
            </View>

            {/* Listings */}
            <View style={styles.stat}>
              <AppIcon name="villa" size="sm" color={theme.colors.textLight} />
              <Text style={styles.statValue}>{partner.listings} {t('listings')}</Text>
            </View>
          </View>

          {/* Verified Partner Badge */}
          <View style={styles.verifiedPartnerBadge}>
            <AppIcon name="verified" size="xs" color={theme.colors.success} />
            <Text style={styles.verifiedPartnerText}>{t('verifiedPartner')}</Text>
          </View>
        </View>

        {/* View Profile Button */}
        <TouchableOpacity style={styles.profileButton} onPress={onViewProfile}>
          <AppIcon name="arrowForward" size="md" color={theme.colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Partner Description */}
      {partner.description && (
        <Text style={styles.description}>{partner.description}</Text>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  info: {
    flex: 1,
  },
  partnerName: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
  },
  partnerCountry: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...theme.typography.caption,
    color: theme.colors.textDark,
    fontWeight: '600',
  },
  verifiedPartnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.successOverlay.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
    gap: 4,
  },
  verifiedPartnerText: {
    ...theme.typography.tiny,
    color: theme.colors.success,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
    lineHeight: 22,
  },
});

export default PartnerInfo;
