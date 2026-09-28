/**
 * ============================================
 * MIZAN MANAGEMENT — LEADS
 * ============================================
 *
 * Customer enquiries, read and progressed by Mizan.
 *
 * WHAT THE SCHEMA PERMITS — verified against the live database, not assumed:
 *   READ    admin only (`leads_select_admin`); a customer may read their own
 *           rows; anon can read none.
 *   WRITE   `status` only. `tg_leads_protect_snapshot` rejects any change to
 *           the attribution snapshot, source, lead_kind or created_at, so the
 *           record of who earned a lead cannot be rewritten after the fact.
 *   DELETE  blocked for everyone, including service_role
 *           (`tg_leads_block_delete`). 'spam' is the disposal route.
 * So this screen is a list plus a status change — nothing more is offered,
 * because nothing more is permitted.
 *
 * PRIVACY
 * The contact details shown here are what the CUSTOMER gave Mizan when
 * enquiring. They are Mizan's own lead data, visible to Mizan admins only.
 * This is not partner-private data — that lives in `private.partner_private`,
 * a schema PostgREST does not serve — and nothing here changes the
 * company-only customer contact model: the customer still reaches the partner
 * through Mizan, never around it.
 *
 * This is deliberately not a CRM. No pipeline, no assignment, no analytics.
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, SheetOption } from '@/components/ui';
import type { TranslationKey } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { getAdminLeads, LEAD_STATUSES, updateLeadStatus, type AdminLead, type LeadStatus } from '@/lib/admin';

const STATUS_LABEL_KEYS: Record<LeadStatus, TranslationKey> = {
  new: 'leadStatusNew',
  contacted: 'leadStatusContacted',
  qualified: 'leadStatusQualified',
  matched_to_partner: 'leadStatusMatched',
  closed_won: 'leadStatusClosedWon',
  closed_lost: 'leadStatusClosedLost',
  spam: 'leadStatusSpam',
};

/** Tone per status so an admin can scan the list without reading every label. */
const STATUS_TONE: Record<LeadStatus, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  new: 'warning',
  contacted: 'info',
  qualified: 'info',
  matched_to_partner: 'info',
  closed_won: 'success',
  closed_lost: 'neutral',
  spam: 'error',
};

export default function AdminLeadsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<AdminLead | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await getAdminLeads());
    } catch {
      Alert.alert(t('couldNotLoadLeads'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const applyStatus = async (lead: AdminLead, status: LeadStatus) => {
    setEditing(null);
    setBusyId(lead.id);
    try {
      await updateLeadStatus(lead.id, status);
      await load();
      Alert.alert(t('leadStatusUpdated'));
    } catch (error) {
      Alert.alert(t('couldNotUpdateLead'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setBusyId(null);
    }
  };

  const toneColor = {
    neutral: colors.textSecondary,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.accent}
          />
        }
      >
        <Text style={styles.title}>{t('leadsTitle')}</Text>
        <Text style={styles.note}>{t('leadsReadOnlyNote')}</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>{t('noLeads')}</Text>
        ) : (
          items.map((lead) => (
            <View key={lead.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.reference}>{lead.referenceCode}</Text>
                <View style={[styles.badge, { borderColor: toneColor[STATUS_TONE[lead.status]] }]}>
                  <Text style={[styles.badgeText, { color: toneColor[STATUS_TONE[lead.status]] }]}>
                    {t(STATUS_LABEL_KEYS[lead.status])}
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>{t('leadAbout')}</Text>
              <Text style={styles.value} numberOfLines={2}>
                {lead.propertyTitleSnapshot}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {lead.propertyRefSnapshot} · {lead.partnerNameSnapshot}
              </Text>

              <Text style={styles.label}>{t('leadContact')}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {lead.contactName || '—'}
              </Text>
              {lead.contactPhone ? (
                <Text style={styles.meta} numberOfLines={1}>
                  {lead.contactPhone}
                </Text>
              ) : null}
              {lead.contactEmail ? (
                <Text style={styles.meta} numberOfLines={1}>
                  {lead.contactEmail}
                </Text>
              ) : null}
              {lead.message ? (
                <Text style={styles.message} numberOfLines={4}>
                  {lead.message}
                </Text>
              ) : null}

              <Text style={styles.meta}>
                {lead.source.replaceAll('_', ' ')} · {new Date(lead.createdAt).toLocaleDateString()}
              </Text>

              <Pressable
                onPress={() => setEditing(lead)}
                disabled={busyId === lead.id}
                accessibilityRole="button"
                style={({ pressed }) => [styles.statusButton, pressed && styles.pressed]}
              >
                {busyId === lead.id ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <Text style={styles.statusButtonText}>{t('changeStatus')}</Text>
                )}
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <BottomSheet visible={editing !== null} onClose={() => setEditing(null)} title={t('changeStatus')}>
        {LEAD_STATUSES.map((status) => (
          <SheetOption
            key={status}
            label={t(STATUS_LABEL_KEYS[status])}
            active={editing?.status === status}
            onPress={() => {
              const target = editing;
              if (target) void applyStatus(target, status);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.md },
  title: { ...t.typography.h2, color: t.colors.text },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  loader: { marginTop: t.spacing.xl },
  empty: { ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.xl },
  card: {
    gap: 4,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.sm },
  reference: { ...t.typography.captionBold, color: t.colors.accent },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: t.borderRadius.full,
    borderWidth: 1,
  },
  badgeText: { ...t.typography.tiny, fontWeight: '700' },
  label: { ...t.typography.tiny, color: t.colors.textMuted, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { ...t.typography.bodyBold, color: t.colors.text },
  meta: { ...t.typography.caption, color: t.colors.textSecondary },
  message: {
    ...t.typography.caption,
    color: t.colors.text,
    marginTop: 6,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surfaceAlt,
    lineHeight: 18,
  },
  statusButton: {
    marginTop: t.spacing.sm,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  statusButtonText: { ...t.typography.captionBold, color: t.colors.accent },
  pressed: { opacity: 0.7 },
}));
