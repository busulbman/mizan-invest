/**
 * Filters for the partner's property list.
 *
 * These are VIEWS, not database statuses. The schema has no `rejected` value:
 * a rejected listing is `unpublished` carrying a `rejection_reason`. The
 * dashboard and the list both need that distinction, so it is defined once
 * here rather than re-derived in each screen.
 */

import type { TranslationKey } from '@/constants/translations';
import type { PartnerPropertyStatus, PartnerPropertySummary } from '@/lib/partner';

export const PROPERTY_LIST_FILTERS = [
  'all',
  'draft',
  'pending_review',
  'published',
  'needs_changes',
] as const;

export type PropertyListFilter = (typeof PROPERTY_LIST_FILTERS)[number];

export const FILTER_LABEL_KEYS: Record<PropertyListFilter, TranslationKey> = {
  all: 'filterAll',
  draft: 'statusDraft',
  pending_review: 'statusPendingReview',
  published: 'statusPublished',
  needs_changes: 'needsChangesCount',
};

export function isPropertyListFilter(value: unknown): value is PropertyListFilter {
  return typeof value === 'string' && (PROPERTY_LIST_FILTERS as readonly string[]).includes(value);
}

/**
 * Applies a view to an already-loaded list.
 *
 * Filtering client-side keeps one query serving every tab, which matters
 * because the counts on the dashboard and the rows here must never disagree —
 * they are computed from the same rule.
 */
export function matchesFilter(item: PartnerPropertySummary, filter: PropertyListFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'needs_changes':
      return item.publicationStatus === 'unpublished' && Boolean(item.rejectionReason);
    case 'draft':
    case 'pending_review':
    case 'published':
      return item.publicationStatus === (filter as PartnerPropertyStatus);
    default:
      return true;
  }
}
