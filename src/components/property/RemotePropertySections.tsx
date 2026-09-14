/**
 * Database-backed property-detail sections.
 *
 * These intentionally sit beside the mock-detail sections: Home can retain
 * its demonstration catalogue while a remote UUID is rendered entirely from
 * the public Supabase property model.
 */

import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';

import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { VideoModal } from '@/components/media/VideoModal';
import { propertyTypeKey } from '@/constants/localizedData';
import { formatListingPrice, RemoteProperty } from '@/lib/properties';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import type { IconName } from '@/constants/icons';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const styles = useStyles();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} numberOfLines={2} ellipsizeMode="tail">
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function RemotePropertyHeader({ property }: { property: RemoteProperty }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const statusTone = {
    available: 'success',
    reserved: 'warning',
    sold: 'error',
  }[property.status] as 'success' | 'warning' | 'error';

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
        {property.title}
      </Text>
      <View style={styles.inlineRow}>
        <AppIcon name="location" size="xs" color={colors.textSecondary} />
        <Text style={styles.headerLocation} numberOfLines={1} ellipsizeMode="tail">
          {property.city.name}, {property.country.name}
        </Text>
      </View>

      <View style={styles.badgeRow}>
        <Badge label={t(propertyTypeKey(property.type))} tone="neutral" />
        <Badge label={t(property.status)} tone={statusTone} />
        {property.verified && <Badge label={t('verified')} tone="success" icon="verified" />}
        {property.featured && <Badge label={t('featuredProperties')} tone="accent" />}
      </View>

      <View style={styles.priceBlock}>
        <Text style={styles.priceLabel} numberOfLines={1}>
          {t('price')}
        </Text>
        <Text style={styles.priceValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {formatListingPrice(property.price, property.priceCurrency, language)}
        </Text>
      </View>
    </View>
  );
}

export function RemoteKeyFigures({ property }: { property: RemoteProperty }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });
  const figures: { icon: IconName; label: string; value: string; tone: string }[] = [];

  if (property.roi !== null) {
    figures.push({ icon: 'trendUp', label: t('estimatedRoi'), value: `${number.format(property.roi)}%`, tone: colors.success });
  }
  if (property.rentalYield !== null) {
    figures.push({ icon: 'wallet', label: t('rentalYield'), value: `${number.format(property.rentalYield)}%`, tone: colors.info });
  }
  if (property.areaSqm !== null) {
    figures.push({ icon: 'area', label: t('area'), value: `${number.format(property.areaSqm)} m²`, tone: colors.textSecondary });
  }
  if (property.aiAnalysis.amortizationYears !== null) {
    figures.push({
      icon: 'time',
      label: t('amortization'),
      value: `${number.format(property.aiAnalysis.amortizationYears)} ${t('years')}`,
      tone: colors.textSecondary,
    });
  }

  if (figures.length === 0) return null;

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
    </Section>
  );
}

export function RemoteInvestmentMetrics({ property }: { property: RemoteProperty }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
  const metrics: { icon: IconName; label: string; value: string; color?: string }[] = [];

  if (property.investmentScore !== null) {
    metrics.push({ icon: 'analytics', label: t('investmentScore'), value: `${number.format(property.investmentScore)} / 100` });
  }
  if (property.aiAnalysis.growthScore !== null) {
    metrics.push({ icon: 'trendUp', label: t('growthScore'), value: `${number.format(property.aiAnalysis.growthScore)} / 100` });
  }
  if (property.aiAnalysis.riskLevel !== null) {
    const riskColors = { low: colors.success, medium: colors.warning, high: colors.error };
    metrics.push({ icon: 'risk', label: t('riskLevel'), value: t(property.aiAnalysis.riskLevel), color: riskColors[property.aiAnalysis.riskLevel] });
  }
  if (metrics.length === 0) return null;

  return (
    <Section title={t('investmentScore')}>
      <View style={styles.metricCard}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricRow}>
            <AppIcon name={metric.icon} size="sm" color={metric.color ?? colors.accent} />
            <Text style={styles.metricLabel} numberOfLines={1}>{metric.label}</Text>
            <Text style={[styles.metricValue, metric.color ? { color: metric.color } : undefined]} numberOfLines={1}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function RemoteDescriptionSection({ description }: { description: string | null }) {
  const styles = useStyles();
  const { t } = useLanguage();

  if (!description?.trim()) return null;

  return (
    <Section title={t('aboutProperty')}>
      <Text style={styles.body}>{description}</Text>
    </Section>
  );
}

export function RemoteHighlightsSection({ highlights }: { highlights: string[] }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  if (highlights.length === 0) return null;

  return (
    <Section title={t('whyInvest')}>
      <View style={styles.highlightList}>
        {highlights.map((highlight, index) => (
          <View key={`${highlight}-${index}`} style={styles.highlight}>
            <View style={styles.highlightIcon}>
              <AppIcon name="check" size="xs" color={colors.success} />
            </View>
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function RemoteFeaturesSection({ property }: { property: RemoteProperty }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
  const primary: { icon: IconName; label: string; value: string }[] = [];
  const { features } = property;

  if (features.bedrooms > 0) primary.push({ icon: 'bedroom', label: t('bedrooms'), value: String(features.bedrooms) });
  if (features.bathrooms > 0) primary.push({ icon: 'bathroom', label: t('bathrooms'), value: String(features.bathrooms) });
  if (property.areaSqm !== null) primary.push({ icon: 'area', label: t('area'), value: `${number.format(property.areaSqm)} m²` });
  if (features.parking > 0) primary.push({ icon: 'parking', label: t('parking'), value: String(features.parking) });

  const amenities: { icon: IconName; label: string }[] = [];
  if (features.pool) amenities.push({ icon: 'pool', label: t('pool') });
  if (features.security) amenities.push({ icon: 'security', label: t('security') });
  if (features.garden) amenities.push({ icon: 'garden', label: t('garden') });
  if (features.seaView) amenities.push({ icon: 'seaView', label: t('seaView') });
  if (features.yearBuilt) amenities.push({ icon: 'calendar', label: `${t('yearBuilt')} ${features.yearBuilt}` });

  if (primary.length === 0 && amenities.length === 0) return null;

  return (
    <Section title={t('propertyFeatures')}>
      {primary.length > 0 && (
        <View style={styles.figureGrid}>
          {primary.map((item) => (
            <View key={item.label} style={styles.figure}>
              <AppIcon name={item.icon} size="sm" color={colors.textSecondary} />
              <Text style={styles.figureValue} numberOfLines={1}>{item.value}</Text>
              <Text style={styles.figureLabel} numberOfLines={2}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
      {amenities.length > 0 && (
        <View style={styles.amenityRow}>
          {amenities.map((item) => <Badge key={item.label} label={item.label} tone="success" icon={item.icon} small />)}
        </View>
      )}
    </Section>
  );
}

export function RemoteVideoSection({ property }: { property: RemoteProperty }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const video = property.media.find((item) => item.type === 'video');

  // No public, usable video URL means no video UI at all.
  if (!video) return null;

  return (
    <Section title={t('propertyVideoTour')}>
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
          <Text style={styles.videoLabel} numberOfLines={1}>{t('watchVideo')}</Text>
        </View>
      </Pressable>
      <VideoModal
        visible={open}
        onClose={() => setOpen(false)}
        videoUrl={video.url}
        title={property.title}
        subtitle={`${property.city.name}, ${property.country.name}`}
      />
    </Section>
  );
}

export function RemoteLocationSection({ property }: { property: RemoteProperty }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Section title={t('locationMap')}>
      <View style={styles.mapCard}>
        <RemoteImage uri={property.image} style={styles.mapImage} />
        <View style={styles.mapScrim} />
        <View style={styles.mapPin}>
          <AppIcon name="locationFilled" size="md" color={colors.error} />
        </View>
        <View style={styles.mapLabel}>
          <AppIcon name="location" size="xs" color={colors.onDark} />
          <Text style={styles.mapLabelText} numberOfLines={1}>{property.city.name}, {property.country.name}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('city')}</Text>
          <Text style={styles.detailValue} numberOfLines={1}>{property.city.name}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('country')}</Text>
          <Text style={styles.detailValue} numberOfLines={1}>{property.country.name}</Text>
        </View>
      </View>
    </Section>
  );
}

export function RemotePartnerSection({ property }: { property: RemoteProperty }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
  const { partner } = property;

  return (
    <Section title={t('listedBy')}>
      <View style={styles.partnerCard}>
        <View style={styles.partnerTop}>
          <View style={styles.partnerAvatar}>
            <AppIcon name="partner" size="md" color={colors.textSecondary} />
          </View>
          <View style={styles.partnerText}>
            <Text style={styles.partnerName} numberOfLines={2}>{partner.name}</Text>
            <Text style={styles.partnerCountry} numberOfLines={1}>{property.country.name}</Text>
            {(partner.rating !== null || partner.listings > 0) && (
              <View style={styles.partnerStats}>
                {partner.rating !== null && (
                  <View style={styles.inlineRow}>
                    <AppIcon name="star" size="xs" color={colors.warning} />
                    <Text style={styles.partnerStat}>{number.format(partner.rating)}</Text>
                  </View>
                )}
                {partner.listings > 0 && (
                  <View style={styles.inlineRow}>
                    <AppIcon name="listings" size="xs" color={colors.textMuted} />
                    <Text style={styles.partnerStat}>{number.format(partner.listings)} {t('listings')}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        {partner.verified && <Badge label={t('verifiedPartner')} tone="success" icon="verified" small style={styles.partnerBadge} />}
      </View>
    </Section>
  );
}

const useStyles = makeStyles((t) => ({
  pressed: { opacity: 0.8 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 },
  section: { paddingHorizontal: t.spacing.screenHorizontal, paddingTop: t.spacing.xl },
  sectionTitle: { ...t.typography.h4, color: t.colors.text },
  sectionBody: { marginTop: t.spacing.smd },
  header: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.lg,
    backgroundColor: t.colors.background,
    borderTopLeftRadius: t.borderRadius.hero,
    borderTopRightRadius: t.borderRadius.hero,
  },
  headerTitle: { ...t.typography.h2, color: t.colors.text, marginBottom: 4 },
  headerLocation: { flexShrink: 1, minWidth: 0, ...t.typography.small, color: t.colors.textSecondary },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.smd },
  priceBlock: { marginTop: t.spacing.md, padding: t.spacing.md, borderRadius: t.borderRadius.xl, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
  priceLabel: { ...t.typography.label, color: t.colors.textSecondary },
  priceValue: { ...t.typography.priceLarge, color: t.colors.text, marginTop: 2 },
  figureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  figure: {
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
  figureValue: { ...t.typography.bodyBold, color: t.colors.text },
  figureLabel: { ...t.typography.tiny, color: t.colors.textMuted },
  metricCard: { borderRadius: t.borderRadius.xl, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, overflow: 'hidden' },
  metricRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, paddingHorizontal: t.spacing.md, borderBottomWidth: 1, borderBottomColor: t.colors.border },
  metricLabel: { flex: 1, minWidth: 0, ...t.typography.caption, color: t.colors.textSecondary },
  metricValue: { flexShrink: 1, ...t.typography.bodyBold, color: t.colors.text },
  body: { ...t.typography.body, color: t.colors.textSecondary },
  highlightList: { gap: t.spacing.smd },
  highlight: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm },
  highlightIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.successOverlay.light, flexShrink: 0, marginTop: 1 },
  highlightText: { flex: 1, minWidth: 0, ...t.typography.small, color: t.colors.textSecondary },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.smd },
  videoCard: { height: 190, borderRadius: t.borderRadius.xl, overflow: 'hidden', backgroundColor: t.colors.surfaceAlt },
  videoImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  videoScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8, 13, 24, 0.45)' },
  videoPlay: { position: 'absolute', top: '50%', left: '50%', width: 60, height: 60, marginTop: -30, marginLeft: -30, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.accent },
  videoFooter: { position: 'absolute', left: t.spacing.smd, right: t.spacing.smd, bottom: t.spacing.smd, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.sm },
  videoLabel: { flexShrink: 1, ...t.typography.captionBold, color: t.colors.onDark },
  mapCard: { height: 170, borderRadius: t.borderRadius.xl, overflow: 'hidden', backgroundColor: t.colors.surfaceAlt },
  mapImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8, 13, 24, 0.35)' },
  mapPin: { position: 'absolute', top: '38%', left: '46%', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surface, ...t.shadows.floating },
  mapLabel: { position: 'absolute', left: t.spacing.smd, bottom: t.spacing.smd, maxWidth: '80%', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xs, borderRadius: t.borderRadius.md, backgroundColor: 'rgba(8, 13, 24, 0.65)' },
  mapLabelText: { flexShrink: 1, ...t.typography.captionBold, color: t.colors.onDark },
  detailRow: { flexDirection: 'row', alignItems: 'stretch', marginTop: t.spacing.smd, padding: t.spacing.smd, borderRadius: t.borderRadius.lg, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
  detailItem: { flex: 1, minWidth: 0 },
  detailDivider: { width: 1, backgroundColor: t.colors.border, marginHorizontal: t.spacing.smd },
  detailLabel: { ...t.typography.tiny, color: t.colors.textMuted },
  detailValue: { ...t.typography.bodyBold, color: t.colors.text, marginTop: 2 },
  partnerCard: { padding: t.spacing.md, borderRadius: t.borderRadius.xl, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
  partnerTop: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd },
  partnerAvatar: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surfaceAlt, borderWidth: 1, borderColor: t.colors.border },
  partnerText: { flex: 1, minWidth: 0 },
  partnerName: { ...t.typography.bodyBold, color: t.colors.text },
  partnerCountry: { ...t.typography.caption, color: t.colors.textMuted, marginTop: 2 },
  partnerStats: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.smd, marginTop: t.spacing.xs },
  partnerStat: { ...t.typography.caption, color: t.colors.textSecondary },
  partnerBadge: { alignSelf: 'flex-start', marginTop: t.spacing.smd },
}));
