/**
 * ============================================
 * APP ICON COMPONENT
 * ============================================
 *
 * Centralized icon component for Mizan Invest.
 * Use this instead of importing Ionicons directly.
 *
 * To change icon pack later:
 * 1. Update this file to use a different icon library
 * 2. Update src/constants/icons.ts with new icon names
 *
 * Usage:
 * <AppIcon name="home" />
 * <AppIcon name="favorite" size="lg" color={theme.colors.accent} />
 */

import { ComponentProps } from 'react';
import { ColorValue, StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { icons, iconSizes, IconName, IconSize } from '@/constants/icons';
import { theme } from '@/theme';

/** Icon names accepted by the underlying icon pack */
type IoniconName = ComponentProps<typeof Ionicons>['name'];

// ============================================
// TYPES
// ============================================

export interface AppIconProps {
  /** Icon name from icons constant */
  name: IconName;

  /** Icon size - use preset or number */
  size?: IconSize | number;

  /** Icon color - defaults to textDark */
  color?: ColorValue;

  /** Additional style */
  style?: StyleProp<TextStyle>;
}

// ============================================
// COMPONENT
// ============================================

export function AppIcon({
  name,
  size = 'md',
  color = theme.colors.textDark,
  style,
}: AppIconProps) {
  const iconName: IoniconName = icons[name];
  const iconSize = typeof size === 'number' ? size : iconSizes[size];

  return (
    <Ionicons
      name={iconName}
      size={iconSize}
      color={color}
      style={style}
    />
  );
}

export default AppIcon;
