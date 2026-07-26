/**
 * ============================================
 * AI ANALYSIS SECTION COMPONENT
 * ============================================
 *
 * Premium AI investment analysis dashboard.
 * Shows: ROI, Rental Income, Amortization, Risk, etc.
 *
 * Used in: Property Detail Screen
 *
 * TODO: Connect to AI analysis API
 * TODO: Add interactive charts
 * TODO: Add comparison feature
 */

import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme';
import { AIAnalysis, formatMonthlyIncome, getRiskLevelColor } from '@/constants/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';

// ============================================
// TYPES
// ============================================

export interface AIAnalysisSectionProps {
  analysis: AIAnalysis;
}

// ============================================
// COMPONENT
// ============================================

export function AIAnalysisSection({ analysis }: AIAnalysisSectionProps) {
  const { t } = useLanguage();

  const getMarketTrendIcon = (): IconName => {
    if (analysis.marketTrend === 'up') return 'trendUp';
    if (analysis.marketTrend === 'down') return 'trendDown';
    return 'trendStable';
  };

  const getMarketTrendColor = () => {
    if (analysis.marketTrend === 'up') return theme.colors.success;
    if (analysis.marketTrend === 'down') return theme.colors.error;
    return theme.colors.textLight;
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <AppIcon name="ai" size="lg" color={theme.colors.accent} />
          </View>
          <View>
            <Text style={styles.title}>{t('aiInvestmentInsights')}</Text>
            <Text style={styles.subtitle}>{t('aiDisclaimer')}</Text>
          </View>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{analysis.confidenceScore}%</Text>
        </View>
      </View>

      {/* Analysis Cards Grid */}
      <View style={styles.cardsGrid}>
        {/* Estimated ROI */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
          style={styles.card}
        >
          <View style={styles.cardIcon}>
            <AppIcon name="trendUp" size="md" color={theme.colors.success} />
          </View>
          <Text style={styles.cardValue}>{analysis.estimatedRoi}%</Text>
          <Text style={styles.cardLabel}>{t('estimatedRoi')}</Text>
          <View style={[styles.trendBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <AppIcon name="arrowUp" size="xs" color={theme.colors.success} />
            <Text style={[styles.trendText, { color: theme.colors.success }]}>
              {t('trending')}
            </Text>
          </View>
        </LinearGradient>

        {/* Rental Income */}
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.card}
        >
          <View style={styles.cardIcon}>
            <AppIcon name="wallet" size="md" color="#3B82F6" />
          </View>
          <Text style={styles.cardValue}>{formatMonthlyIncome(analysis.rentalIncome)}</Text>
          <Text style={styles.cardLabel}>{t('monthlyIncome')}</Text>
        </LinearGradient>

        {/* Amortization Period */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
          style={styles.card}
        >
          <View style={styles.cardIcon}>
            <AppIcon name="time" size="md" color="#8B5CF6" />
          </View>
          <Text style={styles.cardValue}>{analysis.amortizationYears}</Text>
          <Text style={styles.cardLabel}>{t('amortization')} ({t('years')})</Text>
        </LinearGradient>

        {/* Growth Score */}
        <LinearGradient
          colors={['rgba(212, 180, 131, 0.2)', 'rgba(212, 180, 131, 0.08)']}
          style={styles.card}
        >
          <View style={styles.cardIcon}>
            <AppIcon name="analytics" size="md" color={theme.colors.accent} />
          </View>
          <Text style={styles.cardValue}>{analysis.growthScore}</Text>
          <Text style={styles.cardLabel}>{t('growthScore')}</Text>
          {/* Score bar */}
          <View style={styles.scoreBarContainer}>
            <View style={styles.scoreBarBg}>
              <LinearGradient
                colors={theme.gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.scoreBar, { width: `${analysis.growthScore}%` }]}
              />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Risk Level Card */}
      <View style={styles.riskCard}>
        <View style={styles.riskHeader}>
          <Text style={styles.riskTitle}>{t('riskLevel')}</Text>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: `${getRiskLevelColor(analysis.riskLevel)}20` },
            ]}
          >
            <View
              style={[
                styles.riskDot,
                { backgroundColor: getRiskLevelColor(analysis.riskLevel) },
              ]}
            />
            <Text
              style={[
                styles.riskText,
                { color: getRiskLevelColor(analysis.riskLevel) },
              ]}
            >
              {t(analysis.riskLevel as any)}
            </Text>
          </View>
        </View>

        {/* Risk meter visualization */}
        <View style={styles.riskMeter}>
          <View style={styles.riskMeterBg}>
            <View
              style={[
                styles.riskMeterFill,
                {
                  width: analysis.riskLevel === 'low' ? '25%' : analysis.riskLevel === 'medium' ? '55%' : '85%',
                  backgroundColor: getRiskLevelColor(analysis.riskLevel),
                },
              ]}
            />
          </View>
          <View style={styles.riskLabels}>
            <Text style={styles.riskLabelText}>{t('low')}</Text>
            <Text style={styles.riskLabelText}>{t('medium')}</Text>
            <Text style={styles.riskLabelText}>{t('high')}</Text>
          </View>
        </View>

        {/* Market Trend */}
        <View style={styles.marketTrend}>
          <Text style={styles.marketTrendLabel}>{t('marketTrend')}</Text>
          <View style={styles.marketTrendBadge}>
            <AppIcon name={getMarketTrendIcon()} size="md" color={getMarketTrendColor()} />
            <Text style={styles.marketTrendText}>
              {analysis.marketTrend === 'up' ? 'Upward' : analysis.marketTrend === 'down' ? 'Downward' : 'Stable'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accentOverlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.smd,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  confidenceBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  confidenceText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.smd,
    marginBottom: theme.spacing.md,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: 2,
  },
  cardLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
    gap: 4,
  },
  trendText: {
    ...theme.typography.tiny,
  },
  scoreBarContainer: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  scoreBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 3,
  },
  riskCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  riskTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskText: {
    ...theme.typography.label,
    textTransform: 'capitalize',
  },
  riskMeter: {
    marginBottom: theme.spacing.md,
  },
  riskMeterBg: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskMeterFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  riskLabelText: {
    ...theme.typography.tiny,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  marketTrend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  marketTrendLabel: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  marketTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marketTrendText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
  },
});

export default AIAnalysisSection;
