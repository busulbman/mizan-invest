/**
 * ============================================
 * ADMIN — ACTIVITY
 * ============================================
 *
 * The audit trail. `action` values come from the database and are deliberately
 * NOT translated: they are stable machine identifiers an admin needs to be
 * able to quote when investigating, and inventing localized names for them
 * would make two admins describe the same event differently.
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';
import { getAdminActivity, type ActivityItem } from '@/lib/partner';

export default function AdminActivityScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAdminActivity());
    } catch {
      Alert.alert(t('couldNotLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goBackOr('/(admin)/dashboard')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title}>{t('activitySection')}</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>{t('noRecordedActivity')}</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.action}>{item.action.replaceAll('_', ' ')}</Text>
              <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, marginBottom: t.spacing.md },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
  row: { padding: t.spacing.md, borderRadius: t.borderRadius.lg, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
  action: { ...t.typography.bodyBold, color: t.colors.text, textTransform: 'capitalize' },
  meta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 },
  empty: { ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.xl },
}));
