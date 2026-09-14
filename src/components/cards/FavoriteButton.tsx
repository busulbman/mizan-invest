/**
 * ============================================
 * FAVORITE BUTTON
 * ============================================
 *
 * The single heart control. Home cards, Explore rows, the detail header,
 * the sticky CTA and Reels all render this component, so a listing saved
 * in one place is instantly shown as saved everywhere else — it reads
 * and writes the shared `FavoritesContext`, never local state.
 *
 * `variant` only changes the chrome, never the behaviour:
 *   glass   — over photography (cards, Reels)
 *   surface — on a card or toolbar
 *   plain   — icon only, for dense rows
 */

import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { AppIcon } from '@/components/ui/AppIcon';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export interface FavoriteButtonProps {
  propertyId: string;
  variant?: 'glass' | 'surface' | 'plain';
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function FavoriteButton({
  propertyId,
  variant = 'glass',
  size = 40,
  style,
}: FavoriteButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const saved = isFavorite(propertyId);

  // Saved always reads red; unsaved follows the surface it sits on
  const tint = saved
    ? colors.error
    : variant === 'glass'
      ? colors.onDark
      : colors.textSecondary;

  const icon = <AppIcon name={saved ? 'favoriteFilled' : 'favorite'} size="md" color={tint} />;

  const shell: StyleProp<ViewStyle> = [
    styles.button,
    { width: size, height: size, borderRadius: size / 2 },
    variant === 'surface' && styles.surface,
    style,
  ];

  if (variant === 'glass') {
    return (
      <Pressable
        onPress={() => toggleFavorite(propertyId)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ selected: saved }}
        accessibilityLabel={saved ? t('removedFromFavorites') : t('addedToFavorites')}
        style={({ pressed }) => [shell, styles.glass, pressed && styles.pressed]}
      >
        <BlurView intensity={30} tint="dark" style={styles.glassFill}>
          {icon}
        </BlurView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => toggleFavorite(propertyId)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? t('removedFromFavorites') : t('addedToFavorites')}
      style={({ pressed }) => [shell, pressed && styles.pressed]}
    >
      {icon}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glass: {
    borderWidth: 1,
    borderColor: t.colors.overlay.medium,
  },
  glassFill: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
}));

export default FavoriteButton;
