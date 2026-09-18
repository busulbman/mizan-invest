/**
 * ============================================
 * PENDING REVIEW
 * ============================================
 *
 * Read-only queue of the partner's listings currently with Mizan. Editing is
 * locked in this state, so nothing here offers an action.
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';
import { getPartnerProperties, type PartnerPropertySummary } from '@/lib/partner';

export default function PendingReviewScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { partnerMemberships } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PartnerPropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const id = partnerMemberships[0]?.partnerId;

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setItems(await getPartnerProperties(id, 'pending_review'));
    } catch {
      Alert.alert(t('couldNotLoadReviewQueue'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

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
          <Text style={styles.title}>{t('pendingReview')}</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>{t('noPropertiesAwaitingReview')}</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.referenceCode} · {t('submittedLabel')}{' '}
                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '—'}
              </Text>
            </View>
          ))
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
  empty: { ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.xl },
  card: { padding: t.spacing.md, borderRadius: t.borderRadius.lg, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
  name: { ...t.typography.bodyBold, color: t.colors.text },
  meta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 6 },
}));
