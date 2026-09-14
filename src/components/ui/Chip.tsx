/**
 * ============================================
 * CHIP
 * ============================================
 *
 * Horizontal filter pill — country rows on Home and Explore, type rows
 * in the filter sheet.
 *
 * The label is capped at one line with `flexShrink`, and the chip caps
 * its own width, so "Саудовская Аравия" ellipsises inside the pill
 * rather than stretching the row off-screen.
 */

import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';

import { makeStyles } from '@/context/ThemeContext';

export interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Emoji flag or similar, rendered before the label */
  leading?: string;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, active, onPress, leading, style }: ChipProps) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leading && <Text style={styles.leading}>{leading}</Text>}
      <Text
        style={[styles.label, active && styles.labelActive]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    maxWidth: 220,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.full,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  chipActive: {
    backgroundColor: t.colors.primary,
    borderColor: t.colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  leading: {
    fontSize: 15,
  },
  label: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.captionBold,
    color: t.colors.text,
  },
  labelActive: {
    color: t.colors.onPrimary,
  },
}));

export default Chip;
