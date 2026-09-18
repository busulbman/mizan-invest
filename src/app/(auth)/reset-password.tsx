import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

import { AppIcon, Button, IconButton, LogoMark } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOrHome } from '@/lib/navigation';

export default function ResetPasswordScreen() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { t } = useLanguage();
  const { isAuthenticated, updatePassword } = useAuth();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!password) return;
    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      Alert.alert(t('error'), error.message || t('authRequestFailed'));
      return;
    }
    Alert.alert(t('success'), t('passwordUpdated'), [{ text: t('close'), onPress: () => router.replace('/(main)/home') }]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.darkBackground} style={styles.fill}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fill}>
          <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled">
            <IconButton icon="back" onPress={goBackOrHome} accessibilityLabel={t('back')} variant="glass" size={44} />
            <View style={styles.hero}>
              <LogoMark size="medium" />
              <Text style={styles.title}>{t('resetPassword')}</Text>
              <Text style={styles.subtitle}>{isAuthenticated ? t('newPassword') : t('authRequestFailed')}</Text>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>{t('newPassword')}</Text>
              <View style={[styles.inputShell, focused && styles.inputFocused]}>
                <AppIcon name="security" size="sm" color={colors.textMuted} />
                <TextInput style={styles.input} value={password} onChangeText={setPassword} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} secureTextEntry autoCapitalize="none" returnKeyType="done" onSubmitEditing={submit} />
              </View>
              <Button title={t('resetPassword')} onPress={submit} variant="gold" size="lg" loading={submitting} disabled={!password || !isAuthenticated} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.backgroundDark },
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: t.spacing.xl },
  hero: { alignItems: 'center', paddingVertical: t.spacing.section, gap: t.spacing.smd },
  title: { ...t.typography.h1, color: t.colors.onDark, textAlign: 'center' },
  subtitle: { ...t.typography.body, color: t.colors.onDarkMuted, textAlign: 'center' },
  form: { gap: t.spacing.sm },
  label: { ...t.typography.smallBold, color: t.colors.onDark },
  inputShell: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, height: 54, paddingHorizontal: t.spacing.md, borderRadius: t.borderRadius.lg, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.border },
  inputFocused: { borderColor: t.colors.accent },
  input: { flex: 1, minWidth: 0, ...t.typography.body, color: t.colors.text, padding: 0 },
}));
