/**
 * ============================================
 * BOTTOM SHEET
 * ============================================
 *
 * The app's one modal pattern — language, currency, appearance and the
 * Explore filters all present through it. Using a sheet rather than a
 * centred dialog is what keeps the app feeling native rather than like a
 * website in a phone frame.
 *
 * Behaviour:
 * - Tapping the scrim closes; tapping inside does not (the inner
 *   Pressable stops the press from reaching the backdrop).
 * - Content scrolls when it is taller than 80% of the screen, so a long
 *   filter sheet never pushes its footer off-screen.
 * - Bottom padding follows the home-indicator inset.
 */

import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from './AppIcon';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Small explanatory line under the title */
  subtitle?: string;
  children: ReactNode;
  /** Sticky action row pinned below the scroll area */
  footer?: ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: BottomSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('close')}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              )}
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              style={styles.closeButton}
            >
              <AppIcon name="close" size="md" color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          {footer && <View style={styles.footer}>{footer}</View>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * A selectable row inside a sheet.
 *
 * Used by every single-choice sheet so the tick, the highlight and the
 * 52pt row height stay identical across language, currency and theme.
 */
export interface SheetOptionProps {
  label: string;
  /** Right-hand detail, e.g. a currency symbol or language code */
  hint?: string;
  active: boolean;
  onPress: () => void;
}

export function SheetOption({ label, hint, active, onPress }: SheetOptionProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.option,
        active && styles.optionActive,
        pressed && styles.optionPressed,
      ]}
    >
      <Text
        style={[styles.optionLabel, active && styles.optionLabelActive]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
      {hint && (
        <Text style={styles.optionHint} numberOfLines={1}>
          {hint}
        </Text>
      )}
      {active && <AppIcon name="verified" size="md" color={colors.accent} />}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  backdrop: {
    flex: 1,
    backgroundColor: t.colors.overlay.darker,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: t.colors.surface,
    borderTopLeftRadius: t.borderRadius.hero,
    borderTopRightRadius: t.borderRadius.hero,
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.smd,
    borderTopWidth: 1,
    borderColor: t.colors.border,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: t.colors.borderStrong,
    marginBottom: t.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.smd,
    marginBottom: t.spacing.smd,
  },
  headerText: {
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
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceAlt,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: t.spacing.sm,
  },
  footer: {
    paddingTop: t.spacing.smd,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    gap: t.spacing.sm,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    minHeight: 52,
    paddingHorizontal: t.spacing.smd,
    borderRadius: t.borderRadius.md,
  },
  optionActive: {
    backgroundColor: t.colors.accentOverlay.light,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionLabel: {
    flex: 1,
    minWidth: 0,
    ...t.typography.body,
    color: t.colors.text,
  },
  optionLabelActive: {
    ...t.typography.bodyBold,
    color: t.colors.text,
  },
  optionHint: {
    ...t.typography.captionBold,
    color: t.colors.textSecondary,
  },
}));

export default BottomSheet;
