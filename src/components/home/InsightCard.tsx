/**
 * ============================================
 * INSIGHT CARD COMPONENT
 * ============================================
 *
 * AI insight mini dashboard card.
 * Used in: Home screen AI insights section
 *
 * TODO: Connect to AI analysis API
 */

import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';

// ============================================
// TYPES
// ============================================

export interface InsightCardProps {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

// ============================================
// COMPONENT
// ============================================

export function InsightCard({ label, value, trend, color }: InsightCardProps) {
  const trendIcon: IconName = trend === 'up' ? 'trendUp' : trend === 'down' ? 'trendDown' : 'trendStable';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${color}15`, `${color}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Trend icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <AppIcon name={trendIcon} size="md" color={color} />
        </View>

        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: 2,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textLight,
  },
});

export default InsightCard;
