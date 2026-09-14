/**
 * ============================================
 * BUTTON
 * ============================================
 *
 * Every button in the app is this component. Having one implementation
 * is what keeps two buttons sitting side by side the same height, and
 * what guarantees a 44pt minimum touch target everywhere.
 *
 * VARIANTS
 *   gold      — the single primary CTA on a screen (gold gradient)
 *   primary   — solid navy action
 *   secondary — filled surface with a border, for the second action
 *   outline   — transparent with a border, for tertiary actions
 *   ghost     — text only, for dismissals and inline links
 *   glass     — blurred, for use over photography and dark heroes
 *
 * OVERFLOW
 * Labels are capped at one line with an ellipsis and the text node
 * shrinks (`flexShrink`) rather than pushing the icon out of the button.
 * That is what keeps longer Russian labels inside the pill instead of
 * spilling past its edge.
 */

import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { AppIcon } from './AppIcon';
import { IconName } from '@/constants/icons';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export type ButtonVariant = 'gold' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon */
  icon?: IconName;
  /** Trailing icon — usually an arrow */
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Stretches to the row width; otherwise the button hugs its label */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'gold',
  size = 'lg',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const styles = useStyles();
  const { colors, gradients } = useTheme();

  const isDisabled = disabled || loading;

  // Content colour drives the label, both icons and the spinner together
  const contentColor =
    variant === 'gold'
      ? colors.onAccent
      : variant === 'primary'
        ? colors.onPrimary
        : variant === 'glass'
          ? colors.onDark
          : variant === 'ghost'
            ? colors.textSecondary
            : colors.text;

  const body = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={contentColor} size="small" />
      ) : (
        <>
          {icon && <AppIcon name={icon} size={size === 'sm' ? 'sm' : 'md'} color={contentColor} />}
          <Text
            style={[styles.label, styles[`label_${size}`], { color: contentColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {iconRight && (
            <AppIcon name={iconRight} size={size === 'sm' ? 'sm' : 'md'} color={contentColor} />
          )}
        </>
      )}
    </View>
  );

  const shell: StyleProp<ViewStyle> = [
    styles.base,
    styles[`size_${size}`],
    fullWidth ? styles.fullWidth : styles.hug,
    isDisabled && styles.disabled,
    style,
  ];

  // Gold is the only variant that carries a gradient and a glow
  if (variant === 'gold') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => [shell, styles.goldShell, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          {body}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'glass') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => [shell, styles.glassShell, pressed && styles.pressed]}
      >
        <BlurView intensity={24} tint="dark" style={styles.fill}>
          {body}
        </BlurView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        shell,
        styles.padded,
        variant === 'primary' && styles.primaryShell,
        variant === 'secondary' && styles.secondaryShell,
        variant === 'outline' && styles.outlineShell,
        pressed && styles.pressed,
      ]}
    >
      {body}
    </Pressable>
  );
}

/**
 * Circular icon-only button.
 *
 * Kept beside `Button` so both agree on the 44pt minimum and on how the
 * pressed state feels.
 */
export interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'surface' | 'ghost' | 'glass' | 'accent';
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 44,
  color,
  style,
}: IconButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const tint =
    color ??
    (variant === 'glass' ? colors.onDark : variant === 'accent' ? colors.onAccent : colors.text);

  const content: ReactNode = <AppIcon name={icon} size={size >= 44 ? 'md' : 'sm'} color={tint} />;

  const shell: StyleProp<ViewStyle> = [
    styles.iconButton,
    { width: size, height: size, borderRadius: size / 2 },
    variant === 'surface' && styles.iconSurface,
    variant === 'accent' && styles.iconAccent,
    style,
  ];

  if (variant === 'glass') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        style={({ pressed }) => [shell, styles.iconGlass, pressed && styles.pressed]}
      >
        <BlurView intensity={30} tint="dark" style={styles.iconGlassFill}>
          {content}
        </BlurView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [shell, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderRadius: t.borderRadius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  hug: {
    alignSelf: 'flex-start',
  },

  // Heights are fixed so two buttons in a row always match
  size_lg: { height: t.metrics.controlHeight },
  size_md: { height: t.metrics.controlHeightSmall },
  size_sm: { height: 36, borderRadius: t.borderRadius.md },

  padded: {
    paddingHorizontal: t.spacing.lg,
  },
  fill: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.lg,
  },

  goldShell: {
    ...t.shadows.gold,
  },
  glassShell: {
    borderWidth: 1,
    borderColor: t.colors.overlay.medium,
  },
  primaryShell: {
    backgroundColor: t.colors.primary,
  },
  secondaryShell: {
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  outlineShell: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: t.colors.borderStrong,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
    // Lets the label shrink instead of overflowing the button edge
    minWidth: 0,
    flexShrink: 1,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
  label_lg: t.typography.button,
  label_md: t.typography.buttonSmall,
  label_sm: t.typography.buttonSmall,

  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconSurface: {
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  iconAccent: {
    backgroundColor: t.colors.accent,
  },
  iconGlass: {
    borderWidth: 1,
    borderColor: t.colors.overlay.medium,
  },
  iconGlassFill: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default Button;
