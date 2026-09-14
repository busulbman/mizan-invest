/**
 * ============================================
 * PROPERTY DETAIL SECTIONS
 * ============================================
 *
 * The blocks that make up the listing page, in the order they appear:
 * header → key figures → investment score → description → why invest →
 * features → video → location → partner → similar.
 *
 * Kept in one module because they share the same card shell, the same
 * section heading and the same overflow rules, and are only ever used
 * together by the detail screen.
 *
 * Gold is used sparingly and on purpose — the investment score, the
 * verified marker and the primary CTA. Everything else stays navy,
 * neutral or status-coloured so the accent still reads as premium.
 */

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { PropertyCompactCard } from '@/components/cards/PropertyCards';
import { VideoModal } from '@/components/media/VideoModal';
import { IconName } from '@/constants/icons';
import { TranslationKey } from '@/constants/translations';
import {
  AIAnalysis,
  Partner,
  Property,
  PropertyFeatures as Features,
  PropertyType,
  formatArea,
  formatROI,
} from '@/constants/mockData';
import {
  cityNameKey,
  countryNameKey,
  locationLabel,
  propertyTypeKey,
  riskLevelKey,
} from '@/constants/localizedData';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

/** "Why invest" bullets, chosen by property type */
const WHY_KEYS: Record<PropertyType, TranslationKey[]> = {
  villa: ['whyVilla1', 'whyVilla2', 'whyVilla3'],
  apartment: ['whyApartment1', 'whyApartment2', 'whyApartment3'],
  land: ['whyLand1', 'whyLand2', 'whyLand3'],
  commercial: ['whyCommercial1', 'whyCommercial2', 'whyCommercial3'],
};

// ============================================
// SHARED SECTION SHELL
// ============================================

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const styles = useStyles();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} numberOfLines={2} ellipsizeMode="tail">
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.sectionSubtitle} numberOfLines={2} ellipsizeMode="tail">
          {subtitle}
        </Text>
      )}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

// ============================================
// 1. HEADER — title, location, price
// ============================================

export function PropertyHeader({
  property,
}: {
  property: Property;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { priceFull } = useCurrency();

  const statusTone = {
    available: 'success',
    reserved: 'warning',
    sold: 'error',
  }[property.status] as 'success' | 'warning' | 'error';

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
            {t(property.titleKey)}
          </Text>
          <View style={styles.inlineRow}>
            <AppIcon name="location" size="xs" color={colors.textSecondary} />
            <Text style={styles.headerLocation} numberOfLines={1} ellipsizeMode="tail">
              {locationLabel(t, property.cityId, property.countryCode)}
            </Text>
          </View>
        </View>

      </View>

      <View style={styles.badgeRow}>
        <Badge label={t(propertyTypeKey(property.type))} tone="neutral" />
        <Badge label={t(property.status)} tone={statusTone} />
        {property.verified && <Badge label={t('verified')} tone="success" icon="verified" />}
      </View>

      {/* Price is the loudest element on the page */}
      <View style={styles.priceBlock}>
        <Text style={styles.priceLabel} numberOfLines={1}>
          {t('price')}
        </Text>
        <Text style={styles.priceValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {priceFull(property.price)}
        </Text>
        <Text style={styles.priceNote} numberOfLines={1}>
          {t('demoExchangeRate')}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// 2. KEY FIGURES
// ============================================

export function KeyFigures({ property }: { property: Property }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { income } = useCurrency();

  const analysis = property.aiAnalysis;

  const figures: { icon: IconName; label: string; value: string; tone: string }[] = [
    {
      icon: 'trendUp',
      label: t('estimatedRoi'),
      value: formatROI(analysis.estimatedRoi),
      tone: colors.success,
    },
    {
      icon: 'wallet',
      label: t('rentalYield'),
      value: property.rentalYield ? formatROI(property.rentalYield) : '—',
      tone: colors.info,
    },
    {
      icon: 'time',
      label: t('amortization'),
      value: `${analysis.amortizationYears} ${t('years')}`,
      tone: colors.textSecondary,
    },
    {
      icon: 'area',
      label: t('area'),
      value: formatArea(property.features.area),
      tone: colors.textSecondary,
    },
  ];

  return (
    <Section title={t('investmentBasics')}>
      <View style={styles.figureGrid}>
        {figures.map((figure) => (
          <View key={figure.label} style={styles.figure}>
            <AppIcon name={figure.icon} size="sm" color={figure.tone} />
            <Text style={styles.figureValue} numberOfLines={1} ellipsizeMode="tail">
              {figure.value}
            </Text>
            <Text style={styles.figureLabel} numberOfLines={2} ellipsizeMode="tail">
              {figure.label}
            </Text>
          </View>
        ))}
      </View>

      {analysis.rentalIncome > 0 && (
        <View style={styles.incomeRow}>
          <AppIcon name="analytics" size="sm" color={colors.accent} />
          <Text style={styles.incomeLabel} numberOfLines={1} ellipsizeMode="tail">
            {t('monthlyIncome')}
          </Text>
          <Text style={styles.incomeValue} numberOfLines={1} ellipsizeMode="tail">
            {income(analysis.rentalIncome)}
            {t('perMonth')}
          </Text>
        </View>
      )}
    </Section>
  );
}

// ============================================
// 3. INVESTMENT SCORE
// ============================================

export function InvestmentScoreCard({
  score,
  analysis,
}: {
  score: number;
  analysis: AIAnalysis;
}) {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { t } = useLanguage();

  const riskTone =
    analysis.riskLevel === 'low'
      ? colors.success
      : analysis.riskLevel === 'medium'
        ? colors.warning
        : colors.error;

  return (
    <Section title={t('investmentScore')} subtitle={t('investmentScoreHint')}>
      <View style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View style={styles.scoreValueWrap}>
            <Text style={styles.scoreValue} numberOfLines={1}>
              {score}
            </Text>
            <Text style={styles.scoreMax} numberOfLines={1}>
              / 100
            </Text>
          </View>
          <Badge label={t('trending')} tone="accent" icon="ai" small />
        </View>

        {/* Score bar — the one place gold carries data */}
        <View style={styles.scoreTrack}>
          <LinearGradient
            colors={gradients.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.scoreFill, { width: `${score}%` }]}
          />
        </View>

        <View style={styles.scoreMeta}>
          <View style={styles.scoreMetaItem}>
            <Text style={styles.scoreMetaLabel} numberOfLines={2} ellipsizeMode="tail">
              {t('growthScore')}
            </Text>
            <Text style={styles.scoreMetaValue} numberOfLines={1}>
              {analysis.growthScore}
            </Text>
          </View>
          <View style={styles.scoreMetaDivider} />
          <View style={styles.scoreMetaItem}>
            <Text style={styles.scoreMetaLabel} numberOfLines={2} ellipsizeMode="tail">
              {t('riskLevel')}
            </Text>
            <Text style={[styles.scoreMetaValue, { color: riskTone }]} numberOfLines={1}>
              {t(riskLevelKey(analysis.riskLevel))}
            </Text>
          </View>
          <View style={styles.scoreMetaDivider} />
          <View style={styles.scoreMetaItem}>
            <Text style={styles.scoreMetaLabel} numberOfLines={2} ellipsizeMode="tail">
              {t('confidenceScore')}
            </Text>
            <Text style={styles.scoreMetaValue} numberOfLines={1}>
              {analysis.confidenceScore}%
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.disclaimer} numberOfLines={4}>
        {t('aiDisclaimer')}
      </Text>
    </Section>
  );
}

// ============================================
// 4. DESCRIPTION
// ============================================

export function DescriptionSection({ descriptionKey }: { descriptionKey: TranslationKey }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <Section title={t('aboutProperty')}>
      <Text style={styles.body} numberOfLines={expanded ? undefined : 5}>
        {t(descriptionKey)}
      </Text>
      <Pressable
        onPress={() => setExpanded((current) => !current)}
        accessibilityRole="button"
        hitSlop={6}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <Text style={styles.toggleText} numberOfLines={1}>
          {expanded ? t('readLess') : t('readMore')}
        </Text>
        <AppIcon name={expanded ? 'chevronUp' : 'chevronDown'} size="xs" color={colors.accent} />
      </Pressable>
    </Section>
  );
}

// ============================================
// 5. WHY INVEST
// ============================================

export function WhyInvestSection({ type }: { type: PropertyType }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Section title={t('whyInvest')} subtitle={t('whyInvestSubtitle')}>
      <View style={styles.bulletList}>
        {WHY_KEYS[type].map((key) => (
          <View key={key} style={styles.bullet}>
            <View style={styles.bulletIcon}>
              <AppIcon name="check" size="xs" color={colors.success} />
            </View>
            <Text style={styles.bulletText} numberOfLines={3} ellipsizeMode="tail">
              {t(key)}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

// ============================================
// 6. FEATURES
// ============================================

export function FeaturesSection({ features }: { features: Features }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Land listings have no bedrooms or bathrooms — hide, do not show "0"
  const primary: { icon: IconName; label: string; value: string }[] = [];
  if (features.bedrooms > 0) {
    primary.push({ icon: 'bedroom', label: t('bedrooms'), value: String(features.bedrooms) });
  }
  if (features.bathrooms > 0) {
    primary.push({ icon: 'bathroom', label: t('bathrooms'), value: String(features.bathrooms) });
  }
  primary.push({ icon: 'area', label: t('area'), value: formatArea(features.area) });
  if (features.parking > 0) {
    primary.push({ icon: 'parking', label: t('parking'), value: String(features.parking) });
  }

  const amenities: { icon: IconName; label: string }[] = [];
  if (features.pool) amenities.push({ icon: 'pool', label: t('pool') });
  if (features.security) amenities.push({ icon: 'security', label: t('security') });
  if (features.garden) amenities.push({ icon: 'garden', label: t('garden') });
  if (features.seaView) amenities.push({ icon: 'seaView', label: t('seaView') });
  if (features.yearBuilt) {
    amenities.push({ icon: 'calendar', label: `${t('yearBuilt')} ${features.yearBuilt}` });
  }

  return (
    <Section title={t('propertyFeatures')}>
      <View style={styles.figureGrid}>
        {primary.map((item) => (
          <View key={item.label} style={styles.figure}>
            <AppIcon name={item.icon} size="sm" color={colors.textSecondary} />
            <Text style={styles.figureValue} numberOfLines={1} ellipsizeMode="tail">
              {item.value}
            </Text>
            <Text style={styles.figureLabel} numberOfLines={2} ellipsizeMode="tail">
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {amenities.length > 0 && (
        <View style={styles.amenityRow}>
          {amenities.map((item) => (
            <Badge key={item.label} label={item.label} tone="success" icon={item.icon} small />
          ))}
        </View>
      )}
    </Section>
  );
}

// ============================================
// 7. VIDEO
// ============================================

export function VideoSection({ property }: { property: Property }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Section title={t('propertyVideoTour')} subtitle={t('videoTourSubtitle')}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('watchVideo')}
        style={({ pressed }) => [styles.videoCard, pressed && styles.pressed]}
      >
        <RemoteImage uri={property.image} style={styles.videoImage} />
        <View style={styles.videoScrim} />

        <View style={styles.videoPlay}>
          <AppIcon name="play" size="lg" color={colors.onAccent} />
        </View>

        <View style={styles.videoFooter}>
          <Badge label={t('virtualTour')} tone="onImage" icon="video" small />
          <Text style={styles.videoLabel} numberOfLines={1} ellipsizeMode="tail">
            {t('watchVideo')}
          </Text>
        </View>
      </Pressable>

      <VideoModal
        visible={open}
        onClose={() => setOpen(false)}
        videoKey="propertyTour"
        title={t(property.titleKey)}
        subtitle={t(cityNameKey(property.cityId))}
      />
    </Section>
  );
}

// ============================================
// 8. LOCATION
// ============================================

export function LocationSection({ property }: { property: Property }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Section title={t('locationMap')}>
      {/* Static preview — a live map is out of scope for the demo */}
      <View style={styles.mapCard}>
        <RemoteImage uri={property.images[0]} style={styles.mapImage} />
        <View style={styles.mapScrim} />
        <View style={styles.mapPin}>
          <AppIcon name="locationFilled" size="md" color={colors.error} />
        </View>
        <View style={styles.mapLabel}>
          <AppIcon name="location" size="xs" color={colors.onDark} />
          <Text style={styles.mapLabelText} numberOfLines={1} ellipsizeMode="tail">
            {locationLabel(t, property.cityId, property.countryCode)}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel} numberOfLines={1}>
            {t('city')}
          </Text>
          <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
            {t(cityNameKey(property.cityId))}
          </Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel} numberOfLines={1}>
            {t('country')}
          </Text>
          <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
            {t(countryNameKey(property.countryCode))}
          </Text>
        </View>
      </View>
    </Section>
  );
}

// ============================================
// 9. PARTNER
// ============================================

export function PartnerSection({ partner }: { partner: Partner }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Section title={t('listedBy')}>
      <View style={styles.partnerCard}>
        <View style={styles.partnerTop}>
          <RemoteImage uri={partner.logo} style={styles.partnerLogo} borderRadius={14} />

          <View style={styles.partnerText}>
            <Text style={styles.partnerName} numberOfLines={2} ellipsizeMode="tail">
              {partner.name}
            </Text>
            <View style={styles.inlineRow}>
              <AppIcon name="location" size="xs" color={colors.textMuted} />
              <Text style={styles.partnerCountry} numberOfLines={1} ellipsizeMode="tail">
                {t(countryNameKey(partner.countryCode))}
              </Text>
            </View>
            <View style={styles.partnerStats}>
              <View style={styles.inlineRow}>
                <AppIcon name="star" size="xs" color={colors.warning} />
                <Text style={styles.partnerStat} numberOfLines={1}>
                  {partner.rating}
                </Text>
              </View>
              <View style={styles.inlineRow}>
                <AppIcon name="listings" size="xs" color={colors.textMuted} />
                <Text style={styles.partnerStat} numberOfLines={1}>
                  {partner.listings} {t('listings')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {partner.verified && (
          <Badge
            label={t('verifiedPartner')}
            tone="success"
            icon="verified"
            small
            style={styles.partnerBadge}
          />
        )}

        <Text style={styles.partnerDescription} numberOfLines={4} ellipsizeMode="tail">
          {t(partner.descriptionKey)}
        </Text>
      </View>
    </Section>
  );
}

// ============================================
// 10. SIMILAR
// ============================================

export function SimilarSection({ properties }: { properties: Property[] }) {
  const styles = useStyles();
  const { t } = useLanguage();

  if (properties.length === 0) return null;

  return (
    <View style={styles.similarWrap}>
      <Text style={styles.sectionTitle} numberOfLines={2}>
        {t('similarProperties')}
      </Text>
      <Text style={styles.sectionSubtitle} numberOfLines={2}>
        {t('youMayAlsoLike')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.similarRail}
      >
        {properties.map((property) => (
          <PropertyCompactCard key={property.id} property={property} />
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================
// NOT FOUND
// ============================================

export function PropertyNotFound() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={styles.notFound}>
      <AppIcon name="warning" size="xl" color={colors.textMuted} />
      <Text style={styles.notFoundText} numberOfLines={2}>
        {t('propertyNotFound')}
      </Text>
      <Button
        title={t('backToHome')}
        onPress={() => router.replace('/(main)/home')}
        variant="secondary"
        size="md"
        fullWidth={false}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  pressed: {
    opacity: 0.8,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },

  // ---- Section shell ----
  section: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.xl,
  },
  sectionTitle: {
    ...t.typography.h4,
    color: t.colors.text,
    paddingHorizontal: 0,
  },
  sectionSubtitle: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 1,
  },
  sectionBody: {
    marginTop: t.spacing.smd,
  },

  // ---- Header ----
  header: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.lg,
    backgroundColor: t.colors.background,
    borderTopLeftRadius: t.borderRadius.hero,
    borderTopRightRadius: t.borderRadius.hero,
    marginTop: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.smd,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    ...t.typography.h2,
    color: t.colors.text,
    marginBottom: 4,
  },
  headerLocation: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.small,
    color: t.colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
    marginTop: t.spacing.smd,
  },
  priceBlock: {
    marginTop: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  priceLabel: {
    ...t.typography.label,
    color: t.colors.textSecondary,
  },
  priceValue: {
    ...t.typography.priceLarge,
    color: t.colors.text,
    marginTop: 2,
  },
  priceNote: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    marginTop: 2,
  },

  // ---- Figure grid ----
  figureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
  },
  figure: {
    // Two per row on small phones, four on wide ones
    width: t.metrics.isSmall
      ? (t.metrics.screenWidth - t.spacing.screenHorizontal * 2 - t.spacing.sm) / 2
      : (t.metrics.screenWidth - t.spacing.screenHorizontal * 2 - t.spacing.sm * 3) / 4,
    minHeight: 92,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: 4,
  },
  figureValue: {
    ...t.typography.bodyBold,
    color: t.colors.text,
  },
  figureLabel: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    marginTop: t.spacing.smd,
    padding: t.spacing.smd,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.accentOverlay.light,
  },
  incomeLabel: {
    flex: 1,
    minWidth: 0,
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  incomeValue: {
    flexShrink: 1,
    ...t.typography.bodyBold,
    color: t.colors.text,
  },

  // ---- Score ----
  scoreCard: {
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.accentOverlay.medium,
  },
  scoreTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
  },
  scoreValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  scoreValue: {
    ...t.typography.hero,
    fontSize: 34,
    lineHeight: 40,
    color: t.colors.text,
  },
  scoreMax: {
    ...t.typography.caption,
    color: t.colors.textMuted,
  },
  scoreTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.surfaceAlt,
    overflow: 'hidden',
    marginTop: t.spacing.smd,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreMeta: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: t.spacing.md,
  },
  scoreMetaItem: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: t.spacing.xs,
  },
  scoreMetaLabel: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
  },
  scoreMetaValue: {
    ...t.typography.bodyBold,
    color: t.colors.text,
    marginTop: 2,
  },
  scoreMetaDivider: {
    width: 1,
    backgroundColor: t.colors.border,
    marginHorizontal: t.spacing.sm,
  },
  disclaimer: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    marginTop: t.spacing.smd,
  },

  // ---- Description ----
  body: {
    ...t.typography.body,
    color: t.colors.textSecondary,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    marginTop: t.spacing.xs,
  },
  toggleText: {
    ...t.typography.captionBold,
    color: t.colors.accent,
  },

  // ---- Bullets ----
  bulletList: {
    gap: t.spacing.smd,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
  },
  bulletIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.successOverlay.light,
    flexShrink: 0,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    minWidth: 0,
    ...t.typography.small,
    color: t.colors.textSecondary,
  },

  // ---- Amenities ----
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
    marginTop: t.spacing.smd,
  },

  // ---- Video ----
  videoCard: {
    height: 190,
    borderRadius: t.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: t.colors.surfaceAlt,
  },
  videoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 13, 24, 0.45)',
  },
  videoPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginTop: -30,
    marginLeft: -30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.accent,
  },
  videoFooter: {
    position: 'absolute',
    left: t.spacing.smd,
    right: t.spacing.smd,
    bottom: t.spacing.smd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
  },
  videoLabel: {
    flexShrink: 1,
    ...t.typography.captionBold,
    color: t.colors.onDark,
  },

  // ---- Location ----
  mapCard: {
    height: 170,
    borderRadius: t.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: t.colors.surfaceAlt,
  },
  mapImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 13, 24, 0.35)',
  },
  mapPin: {
    position: 'absolute',
    top: '38%',
    left: '46%',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    ...t.shadows.floating,
  },
  mapLabel: {
    position: 'absolute',
    left: t.spacing.smd,
    bottom: t.spacing.smd,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: t.borderRadius.sm,
    backgroundColor: 'rgba(8, 13, 24, 0.6)',
  },
  mapLabelText: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.tiny,
    color: t.colors.onDark,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: t.spacing.smd,
    padding: t.spacing.smd,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  detailItem: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
  },
  detailValue: {
    ...t.typography.bodyBold,
    color: t.colors.text,
    marginTop: 1,
  },
  detailDivider: {
    width: 1,
    backgroundColor: t.colors.border,
    marginHorizontal: t.spacing.smd,
  },

  // ---- Partner ----
  partnerCard: {
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  partnerTop: {
    flexDirection: 'row',
    gap: t.spacing.smd,
  },
  partnerLogo: {
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  partnerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  partnerName: {
    ...t.typography.bodyBold,
    color: t.colors.text,
  },
  partnerCountry: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.caption,
    color: t.colors.textMuted,
  },
  partnerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.smd,
    marginTop: 2,
  },
  partnerStat: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  partnerBadge: {
    marginTop: t.spacing.smd,
  },
  partnerDescription: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: t.spacing.smd,
  },

  // ---- Similar ----
  similarWrap: {
    paddingTop: t.spacing.xl,
    paddingLeft: t.spacing.screenHorizontal,
  },
  similarRail: {
    paddingTop: t.spacing.smd,
    paddingRight: t.spacing.screenHorizontal,
  },

  // ---- Not found ----
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.section,
  },
  notFoundText: {
    ...t.typography.body,
    color: t.colors.textSecondary,
    textAlign: 'center',
  },
}));
