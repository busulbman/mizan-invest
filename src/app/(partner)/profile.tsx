/**
 * ============================================
 * PARTNER PROFILE
 * ============================================
 *
 * The partner organisation's own identity surface.
 *
 * LOGO vs AVATAR
 * The logo here is the COMPANY image shown publicly next to listings. It is not
 * the person's account avatar, which lives in Settings → Profile and in a
 * different, private bucket. Keeping them apart means a partner employee's face
 * never becomes the company's public mark by accident.
 *
 * SCOPE
 * Private partner contact details are never rendered here. They live in
 * `private.partner_private`, a schema PostgREST does not serve, so this screen
 * could not read them even if it tried.
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button, IconButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';
import { pickSingleImage } from '@/lib/pickImage';
import {
  getPartnerIdentity,
  getPartnerLogoUrl,
  removePartnerLogo,
  uploadPartnerLogo,
  type PartnerIdentity,
} from '@/lib/partnerLogo';

export default function PartnerProfileScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { profile, partnerMemberships } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const partnerId = partnerMemberships[0]?.partnerId;

  const [identity, setIdentity] = useState<PartnerIdentity | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }
    try {
      const row = await getPartnerIdentity(partnerId);
      setIdentity(row);
      setLogoUrl(await getPartnerLogoUrl(row?.logoPath ?? null));
    } catch (error) {
      Alert.alert(t('couldNotLoad'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setLoading(false);
    }
  }, [partnerId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeLogo = useCallback(async () => {
    if (!partnerId || busy) return;

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

    setBusy(true);
    try {
      await uploadPartnerLogo({
        partnerId,
        uri: picked.image.uri,
        mimeType: picked.image.mimeType,
        fileName: picked.image.fileName,
        previousPath: identity?.logoPath ?? null,
      });
      await load();
      Alert.alert(t('logoUpdated'));
    } catch (error) {
      Alert.alert(t('couldNotUpdateLogo'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setBusy(false);
    }
  }, [busy, identity?.logoPath, load, partnerId, t]);

  const clearLogo = useCallback(() => {
    if (!partnerId || busy) return;
    Alert.alert(t('removeLogo'), t('removeLogoConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('remove'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await removePartnerLogo(partnerId, identity?.logoPath ?? null);
            await load();
          } catch (error) {
            Alert.alert(t('couldNotUpdateLogo'), error instanceof Error ? error.message : t('pleaseTryAgain'));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }, [busy, identity?.logoPath, load, partnerId, t]);

  const hasLogo = Boolean(identity?.logoPath);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goBackOr('/(partner)/dashboard')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title}>{t('partnerProfile')}</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>{t('partnerLogo')}</Text>
              <Text style={styles.note}>{t('partnerLogoNote')}</Text>

              <View style={styles.logoRow}>
                <View style={styles.logo}>
                  {busy ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : logoUrl ? (
                    <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="cover" />
                  ) : (
                    <AppIcon name="building" size="lg" color={colors.accent} />
                  )}
                </View>

                <View style={styles.logoActions}>
                  <Button
                    title={hasLogo ? t('replaceLogo') : t('uploadLogo')}
                    variant="secondary"
                    size="sm"
                    icon="images"
                    onPress={() => void changeLogo()}
                    disabled={busy}
                  />
                  {hasLogo ? (
                    <Button title={t('removeLogo')} variant="outline" size="sm" onPress={clearLogo} disabled={busy} />
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.name}>{identity?.displayName ?? profile?.fullName ?? t('partnerFallbackName')}</Text>
              <Text style={styles.meta}>
                {t('membership')}: {partnerMemberships[0]?.memberRole ?? '—'}
              </Text>
              <Text style={styles.meta}>{t('partnerProfileNote')}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
  loader: { marginTop: t.spacing.xl },
  card: {
    padding: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    gap: 8,
  },
  sectionLabel: { ...t.typography.label, color: t.colors.textSecondary },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginTop: t.spacing.sm },
  logo: {
    width: 84,
    height: 84,
    borderRadius: t.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  logoActions: { flex: 1, minWidth: 0, gap: t.spacing.sm },
  name: { ...t.typography.bodyBold, color: t.colors.text },
  meta: { ...t.typography.body, color: t.colors.textSecondary },
}));
