/**
 * ============================================
 * EDIT PROFILE
 * ============================================
 *
 * Display name and avatar for the signed-in person.
 *
 * SCOPE
 * This screen edits `public.profiles` only. Email, password and provider state
 * live in `auth.users` and are never written from here — changing an email or
 * password is an Auth operation with its own verification flow, not a profile
 * field.
 *
 * AUTHORITY
 * `profiles_update_own` scopes every write to `auth.uid()`, and the avatar
 * storage policies require the object path to start with the caller's own uid.
 * Nothing on this screen can reach another person's profile or avatar; the
 * read-only rendering for a signed-out visitor is a courtesy, not the boundary.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button, IconButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goToParent } from '@/lib/navigation';
import { pickSingleImage } from '@/lib/pickImage';
import { getAvatarUrl, removeAvatar, updateDisplayName, uploadAvatar } from '@/lib/profile';

export default function EditProfileScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, profile, isAuthenticated, isLoading, refresh } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [busyPhoto, setBusyPhoto] = useState(false);

  // Seed the field from the loaded profile. Keyed on the stored value so an
  // outside refresh does not clobber what the user is currently typing.
  useEffect(() => {
    setName(profile?.fullName ?? '');
  }, [profile?.fullName]);

  useEffect(() => {
    let active = true;
    void getAvatarUrl(profile?.avatarPath ?? null).then((url) => {
      if (active) setAvatarUrl(url);
    });
    return () => {
      active = false;
    };
  }, [profile?.avatarPath]);

  const changePhoto = useCallback(async () => {
    if (!user || busyPhoto) return;

    const picked = await pickSingleImage();
    if (picked.status === 'cancelled') return;
    if (picked.status === 'denied') {
      Alert.alert(t('photoAccessNeeded'), t('photoAccessNeededBody'));
      return;
    }
    if (picked.status === 'unsupported') {
      Alert.alert(t('unsupportedFile'), t('unsupportedFileBody'));
      return;
    }

    setBusyPhoto(true);
    try {
      await uploadAvatar({
        userId: user.id,
        uri: picked.image.uri,
        mimeType: picked.image.mimeType,
        fileName: picked.image.fileName,
        previousPath: profile?.avatarPath ?? null,
      });
      await refresh();
    } catch (error) {
      Alert.alert(t('couldNotUpdateProfile'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setBusyPhoto(false);
    }
  }, [busyPhoto, profile?.avatarPath, refresh, t, user]);

  const clearPhoto = useCallback(() => {
    if (!user || busyPhoto) return;
    Alert.alert(t('removePhoto'), t('removePhotoConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('remove'),
        style: 'destructive',
        onPress: async () => {
          setBusyPhoto(true);
          try {
            await removeAvatar(user.id, profile?.avatarPath ?? null);
            await refresh();
          } catch (error) {
            Alert.alert(t('couldNotUpdateProfile'), error instanceof Error ? error.message : t('pleaseTryAgain'));
          } finally {
            setBusyPhoto(false);
          }
        },
      },
    ]);
  }, [busyPhoto, profile?.avatarPath, refresh, t, user]);

  const saveName = useCallback(async () => {
    if (!user || savingName) return;
    if (!name.trim()) {
      Alert.alert(t('couldNotUpdateProfile'), t('displayNameRequired'));
      return;
    }

    setSavingName(true);
    try {
      await updateDisplayName(user.id, name);
      await refresh();
      Alert.alert(t('profileUpdated'));
    } catch (error) {
      Alert.alert(t('couldNotUpdateProfile'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setSavingName(false);
    }
  }, [name, refresh, savingName, t, user]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/(main)/home" />;

  const hasPhoto = Boolean(profile?.avatarPath);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goToParent('/(main)/profile')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title} numberOfLines={1}>
            {t('editProfile')}
          </Text>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.label}>{t('profilePhoto')}</Text>
        <View style={styles.photoRow}>
          <View style={styles.avatar}>
            {busyPhoto ? (
              <ActivityIndicator color={colors.accent} />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <AppIcon name="profile" size="lg" color={colors.accent} />
            )}
          </View>

          <View style={styles.photoActions}>
            <Button
              title={hasPhoto ? t('changePhoto') : t('addPhoto')}
              variant="secondary"
              size="sm"
              icon="images"
              onPress={() => void changePhoto()}
              disabled={busyPhoto}
            />
            {hasPhoto ? (
              <Button
                title={t('removePhoto')}
                variant="outline"
                size="sm"
                onPress={clearPhoto}
                disabled={busyPhoto}
              />
            ) : null}
          </View>
        </View>

        <Text style={styles.label}>{t('displayName')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder={t('displayNamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          maxLength={120}
          autoCapitalize="words"
          accessibilityLabel={t('displayName')}
        />

        <Text style={styles.readonlyLabel}>{t('email')}</Text>
        <Text style={styles.readonlyValue} numberOfLines={1}>
          {user?.email ?? '—'}
        </Text>

        <Button
          title={t('saveChanges')}
          onPress={() => void saveName()}
          loading={savingName}
          disabled={savingName || busyPhoto}
          style={styles.save}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.smd },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, marginBottom: t.spacing.sm },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
  label: { ...t.typography.label, color: t.colors.textSecondary, marginTop: t.spacing.sm },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  photoActions: { flex: 1, minWidth: 0, gap: t.spacing.sm },
  input: {
    minHeight: 48,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    backgroundColor: t.colors.surface,
    ...t.typography.body,
  },
  readonlyLabel: { ...t.typography.label, color: t.colors.textSecondary, marginTop: t.spacing.sm },
  readonlyValue: { ...t.typography.body, color: t.colors.textMuted },
  save: { marginTop: t.spacing.lg },
}));
