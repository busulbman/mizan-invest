/**
 * ============================================
 * SECTION HEADER
 * ============================================
 *
 * Title + optional subtitle on the left, optional action on the right.
 * Used above every Home rail and every block on the detail screen.
 *
 * The text column takes the remaining width and wraps to two lines; the
 * action never shrinks below its own label. This is what stops a long
 * Russian heading from pushing "Смотреть все" off the screen edge.
 */

import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import { AppIcon } from './AppIcon';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Renders the right-hand action only when both props are given */
  actionText?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
}: SectionHeaderProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const showAction = Boolean(actionText && onActionPress);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textColumn}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
            {subtitle}
          </Text>
        )}
      </View>

      {showAction && (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={actionText}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText} numberOfLines={1}>
            {actionText}
          </Text>
          <AppIcon name="arrowForward" size="xs" color={colors.accent} />
        </Pressable>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.smd,
    paddingHorizontal: t.spacing.screenHorizontal,
    marginBottom: t.spacing.smd,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...t.typography.h3,
    color: t.colors.text,
  },
  subtitle: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // Never squeezed by a long title, and never wider than a third
    flexShrink: 0,
    maxWidth: '38%',
    minHeight: 32,
  },
  actionText: {
    ...t.typography.captionBold,
    color: t.colors.accent,
  },
  actionPressed: {
    opacity: 0.6,
  },
}));

export default SectionHeader;
