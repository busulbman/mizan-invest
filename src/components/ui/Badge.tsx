/**
 * ============================================
 * BADGE
 * ============================================
 *
 * Small status pill: verified, available/reserved/sold, risk level, ROI.
 *
 * `tone` maps onto the colour hierarchy rather than naming a colour, so
 * the palette stays meaningful: green reads as positive investment data,
 * red as risk, gold as a premium marker, and neutral as secondary
 * information. Gold is deliberately rare.
 */

import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { AppIcon } from './AppIcon';
import { IconName } from '@/constants/icons';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export type BadgeTone = 'accent' | 'success' | 'error' | 'info' | 'warning' | 'neutral' | 'onImage';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  /** Compact height for use inside dense card corners */
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', icon, small = false, style }: BadgeProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const palette: Record<BadgeTone, { fg: string; bg: string }> = {
    accent: { fg: colors.accent, bg: colors.accentOverlay.light },
    success: { fg: colors.success, bg: colors.successOverlay.light },
    error: { fg: colors.error, bg: colors.errorOverlay.light },
    info: { fg: colors.info, bg: colors.infoOverlay.light },
    warning: { fg: colors.warning, bg: colors.accentOverlay.light },
    neutral: { fg: colors.textSecondary, bg: colors.surfaceAlt },
    onImage: { fg: colors.onDark, bg: 'rgba(8, 13, 24, 0.55)' },
  };

  const { fg, bg } = palette[tone];

  return (
    <View style={[styles.badge, small && styles.badgeSmall, { backgroundColor: bg }, style]}>
      {icon && <AppIcon name={icon} size={small ? 'xs' : 'sm'} color={fg} />}
      <Text
        style={[small ? styles.labelSmall : styles.label, { color: fg }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: t.borderRadius.sm,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderRadius: t.borderRadius.xs,
  },
  label: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.label,
  },
  labelSmall: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.tiny,
  },
}));

export default Badge;
