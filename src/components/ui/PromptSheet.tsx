/**
 * ============================================
 * PROMPT SHEET
 * ============================================
 *
 * A cross-platform replacement for `Alert.prompt`, which exists on iOS only —
 * on Android it is a silent no-op, so an admin could tap Reject and nothing
 * would happen.
 *
 * Built on the existing BottomSheet so it inherits the app's sheet chrome,
 * backdrop and dismissal behaviour rather than introducing a second modal
 * idiom.
 *
 * The confirm action stays disabled until the input satisfies `minLength`,
 * which is what makes "a reason is required" true in the UI as well as in the
 * `review_property` RPC.
 */

import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export interface PromptSheetProps {
  visible: boolean;
  title: string;
  /** Explanatory line under the title */
  subtitle?: string;
  label: string;
  placeholder?: string;
  /** Defaults to the translated "Confirm" */
  confirmTitle?: string;
  /** Defaults to the translated "Cancel" */
  cancelTitle?: string;
  /** Characters required before confirm becomes available */
  minLength?: number;
  /**
   * When set, confirm unlocks only on this EXACT value (case sensitive).
   * Used for destructive confirmations where a deliberate, typed word is the
   * point — a length check would let any ten characters through.
   */
  requiredValue?: string;
  maxLength?: number;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

export function PromptSheet({
  visible,
  title,
  subtitle,
  label,
  placeholder,
  confirmTitle,
  cancelTitle,
  minLength = 1,
  requiredValue,
  maxLength = 500,
  busy = false,
  onCancel,
  onConfirm,
}: PromptSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [value, setValue] = useState('');

  // Clear on open so a previous rejection reason is never pre-filled into the
  // next one — that would be an easy way to send the wrong partner feedback.
  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  const trimmed = value.trim();
  const canConfirm = !busy
    && (requiredValue === undefined ? trimmed.length >= minLength : trimmed === requiredValue);

  return (
    <BottomSheet
      visible={visible}
      onClose={busy ? () => undefined : onCancel}
      title={title}
      subtitle={subtitle}
      footer={
        <View style={styles.footer}>
          <Button
            title={cancelTitle ?? t('cancel')}
            variant="secondary"
            size="md"
            onPress={onCancel}
            disabled={busy}
            style={styles.footerButton}
          />
          <Button
            title={confirmTitle ?? t('confirmAction')}
            variant="gold"
            size="md"
            onPress={() => onConfirm(trimmed)}
            disabled={!canConfirm}
            loading={busy}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={maxLength}
        autoFocus
        textAlignVertical="top"
        accessibilityLabel={label}
      />
      <Text style={styles.counter}>
        {requiredValue !== undefined
          ? requiredValue
          : trimmed.length < minLength
            ? `${t('minimumCharacters')}: ${minLength}`
            : `${value.length} / ${maxLength}`}
      </Text>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) => ({
  label: {
    ...t.typography.smallBold,
    color: t.colors.text,
    marginBottom: t.spacing.sm,
  },
  input: {
    minHeight: 110,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    color: t.colors.text,
    ...t.typography.body,
  },
  counter: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    marginTop: t.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: t.spacing.sm,
  },
  footerButton: {
    flex: 1,
    minWidth: 0,
  },
}));

export default PromptSheet;
