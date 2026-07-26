/**
 * ============================================
 * INPUT COMPONENT
 * ============================================
 *
 * Styled text input with label and focus states.
 * Used for: Login forms, search, filters, etc.
 *
 * Usage:
 * <Input label="Email" value={email} onChangeText={setEmail} />
 * <Input label="Password" secureTextEntry />
 * <Input variant="dark" placeholder="Search..." />
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '@/theme';

// ============================================
// TYPES
// ============================================

export interface InputProps extends TextInputProps {
  /** Input label (optional) */
  label?: string;

  /** Container style variant */
  variant?: 'light' | 'dark';

  /** Custom container style */
  containerStyle?: ViewStyle;

  /** Error message */
  error?: string;

  /** Right side element (icon, button) */
  rightElement?: React.ReactNode;
}

// ============================================
// COMPONENT
// ============================================

export function Input({
  label,
  variant = 'light',
  containerStyle,
  error,
  rightElement,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isDark = variant === 'dark';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputContainerDark : styles.inputContainerLight,
          isFocused && (isDark ? styles.inputFocusedDark : styles.inputFocusedLight),
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholderTextColor={
            isDark ? 'rgba(255, 255, 255, 0.3)' : theme.colors.textMuted
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },

  // Label
  label: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  labelDark: {
    color: theme.colors.textOnDarkMuted,
  },

  // Input container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerLight: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.card,
  },
  inputContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },

  // Focus states
  inputFocusedLight: {
    borderColor: theme.colors.accent,
  },
  inputFocusedDark: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Error state
  inputError: {
    borderColor: theme.colors.error,
  },

  // Input text
  input: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...theme.typography.body,
    color: theme.colors.textDark,
  },
  inputDark: {
    color: theme.colors.white,
  },

  // Right element
  rightElement: {
    paddingRight: 16,
  },

  // Error text
  errorText: {
    ...theme.typography.small,
    color: theme.colors.error,
    marginTop: 4,
  },
});

export default Input;
