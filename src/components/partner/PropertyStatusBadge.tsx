/**
 * ============================================
 * PROPERTY STATUS BADGE
 * ============================================
 *
 * One place that maps a `publication_status` onto the words and colour a
 * partner sees, so My Properties, Edit Property and the admin queue can never
 * disagree about what a listing's state is called.
 *
 * LOCALIZATION
 * `describeStatus` returns translation KEYS, not sentences, so it stays a pure
 * function and every caller renders it in the language the user picked. A
 * caller that forgot to translate would be a TypeScript error, not a silent
 * English string.
 *
 * NAMING
 * The database has no `rejected` status: a rejected listing is
 * `unpublished` carrying a `rejection_reason`. The partner should never have
 * to learn that, so the label says "Changes requested" and the reason is
 * surfaced next to it.
 */

import { Text, View } from 'react-native';

import { AppIcon } from '@/components/ui';
import type { IconName } from '@/constants/icons';
import type { TranslationKey } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import type { PartnerPropertyStatus } from '@/lib/partner';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning';

export interface StatusPresentation {
  labelKey: TranslationKey;
  tone: StatusTone;
  icon: IconName;
  /** One line telling the partner what, if anything, to do next */
  hintKey: TranslationKey;
  /** True when the partner can still open the edit form */
  editable: boolean;
}

export function describeStatus(
  status: PartnerPropertyStatus,
  hasRejectionReason = false
): StatusPresentation {
  switch (status) {
    case 'draft':
      return {
        labelKey: 'statusDraft',
        tone: 'neutral',
        icon: 'listings',
        hintKey: 'hintDraft',
        editable: true,
      };
    case 'pending_review':
      return {
        labelKey: 'statusPendingReview',
        tone: 'info',
        icon: 'time',
        hintKey: 'hintPendingReview',
        editable: false,
      };
    case 'published':
      return {
        labelKey: 'statusPublished',
        tone: 'success',
        icon: 'verified',
        hintKey: 'hintPublished',
        editable: false,
      };
    case 'unpublished':
      return hasRejectionReason
        ? {
            labelKey: 'statusChangesRequested',
            tone: 'warning',
            icon: 'warning',
            hintKey: 'hintChangesRequested',
            editable: true,
          }
        : {
            labelKey: 'statusUnpublished',
            tone: 'neutral',
            icon: 'listings',
            hintKey: 'hintUnpublished',
            editable: true,
          };
    case 'archived':
    default:
      return {
        labelKey: 'statusArchived',
        tone: 'neutral',
        icon: 'trash',
        hintKey: 'hintArchived',
        editable: false,
      };
  }
}

export interface PropertyStatusBadgeProps {
  status: PartnerPropertyStatus;
  hasRejectionReason?: boolean;
}

export function PropertyStatusBadge({ status, hasRejectionReason }: PropertyStatusBadgeProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const presentation = describeStatus(status, hasRejectionReason);

  const toneColor = {
    neutral: colors.textSecondary,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
  }[presentation.tone];

  return (
    <View style={[styles.badge, { borderColor: toneColor }]}>
      <AppIcon name={presentation.icon} size="xs" color={toneColor} />
      <Text style={[styles.label, { color: toneColor }]} numberOfLines={1}>
        {t(presentation.labelKey)}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: t.borderRadius.full,
    borderWidth: 1,
  },
  label: {
    ...t.typography.tiny,
    fontWeight: '700',
  },
}));

export default PropertyStatusBadge;
