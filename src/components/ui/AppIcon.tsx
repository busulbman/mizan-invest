/**
 * ============================================
 * APP ICON
 * ============================================
 *
 * The only place Ionicons is imported. Screens reference semantic names
 * from `@/constants/icons`, so swapping icon packs is a one-file change.
 *
 * Colour defaults to the active theme's primary text, which means an
 * icon rendered without an explicit colour still flips correctly between
 * light and dark mode.
 *
 * Usage:
 *   <AppIcon name="favorite" size="md" color={colors.accent} />
 */

import { ComponentProps } from 'react';
import { ColorValue, StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { IconName, IconSize, iconSizes, icons } from '@/constants/icons';
import { useTheme } from '@/context/ThemeContext';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface AppIconProps {
  name: IconName;
  /** Preset key or an explicit point size */
  size?: IconSize | number;
  /** Defaults to the theme's primary text colour */
  color?: ColorValue;
  style?: StyleProp<TextStyle>;
}

export function AppIcon({ name, size = 'md', color, style }: AppIconProps) {
  const { colors } = useTheme();

  const iconName: IoniconName = icons[name];
  const iconSize = typeof size === 'number' ? size : iconSizes[size];

  return (
    <Ionicons name={iconName} size={iconSize} color={color ?? colors.text} style={style} />
  );
}

export default AppIcon;
