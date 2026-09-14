/**
 * ============================================
 * NOTIFICATION DATA
 * ============================================
 *
 * Seed for the in-app notification centre.
 *
 * DEMO ONLY — nothing here talks to a push service. `NotificationsContext`
 * layers read/unread state on top and the Home badge counts the unread
 * rows.
 *
 * Timestamps are stored as `minutesAgo` rather than dates so the list
 * always looks fresh in a demo, and so the relative label can be
 * translated instead of formatted from a locale-specific date string.
 */

import { IconName } from './icons';
import { TranslationKey } from './translations';

export interface DemoNotification {
  id: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  icon: IconName;
  /** Accent colour role for the leading icon tile */
  tone: 'accent' | 'success' | 'info' | 'error';
  /** Listing to open on tap; omitted rows are informational only */
  propertyId?: string;
  minutesAgo: number;
  /** Seeded read state — the mix gives the badge a non-zero count */
  readByDefault: boolean;
}

export const demoNotifications: DemoNotification[] = [
  {
    id: 'n1',
    titleKey: 'notifNewProjectTitle',
    bodyKey: 'notifNewProjectBody',
    icon: 'building',
    tone: 'accent',
    propertyId: '5',
    minutesAgo: 12,
    readByDefault: false,
  },
  {
    id: 'n2',
    titleKey: 'notifPriceUpdateTitle',
    bodyKey: 'notifPriceUpdateBody',
    icon: 'trendUp',
    tone: 'success',
    propertyId: '2',
    minutesAgo: 95,
    readByDefault: false,
  },
  {
    id: 'n3',
    titleKey: 'notifPartnerReplyTitle',
    bodyKey: 'notifPartnerReplyBody',
    icon: 'message',
    tone: 'info',
    propertyId: '13',
    minutesAgo: 260,
    readByDefault: false,
  },
  {
    id: 'n4',
    titleKey: 'notifMadinahTitle',
    bodyKey: 'notifMadinahBody',
    icon: 'star',
    tone: 'accent',
    propertyId: '3',
    minutesAgo: 1450,
    readByDefault: false,
  },
  {
    id: 'n5',
    titleKey: 'notifVideoAddedTitle',
    bodyKey: 'notifVideoAddedBody',
    icon: 'video',
    tone: 'info',
    propertyId: '21',
    minutesAgo: 2880,
    readByDefault: true,
  },
  {
    id: 'n6',
    titleKey: 'notifMarketReportTitle',
    bodyKey: 'notifMarketReportBody',
    icon: 'analytics',
    tone: 'success',
    minutesAgo: 5760,
    readByDefault: true,
  },
];

/**
 * Relative timestamp, localised through short unit labels.
 *
 * Returns e.g. "12 мин", "4 ч", "2 д" — short on purpose so the row's
 * time column never pushes the title into a second line.
 */
export function relativeTime(
  minutesAgo: number,
  units: { now: string; minutes: string; hours: string; days: string }
): string {
  if (minutesAgo < 2) return units.now;
  if (minutesAgo < 60) return `${minutesAgo} ${units.minutes}`;
  if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)} ${units.hours}`;
  return `${Math.floor(minutesAgo / 1440)} ${units.days}`;
}
