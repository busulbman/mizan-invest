/**
 * ============================================
 * NOTIFICATIONS CONTEXT
 * ============================================
 *
 * In-app notification centre for the demo.
 *
 * Deliberately NOT a push notification system — there is no Firebase, no
 * device token and no permission prompt. The list is seeded demo data,
 * read state lives in memory and mirrors to AsyncStorage so the badge
 * survives a reload during a presentation.
 *
 * Copy is stored as translation keys, never as literal strings, so the
 * centre follows the active language like the rest of the app.
 *
 * Usage:
 *   const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
 */

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DemoNotification, demoNotifications } from '@/constants/notificationsData';

const READ_STORAGE_KEY = '@mizan_invest/notifications-read';

export interface AppNotification extends DemoNotification {
  read: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>(
    demoNotifications.filter((item) => item.readByDefault).map((item) => item.id)
  );

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(READ_STORAGE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
          setReadIds(parsed);
        }
      })
      .catch(() => {
        // Fall back to the seeded read/unread mix
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((ids: string[]) => {
    AsyncStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids)).catch(() => {
      // Session-only read state is acceptable for the demo
    });
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      setReadIds((current) => {
        if (current.includes(id)) return current;
        const next = [...current, id];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markAllRead = useCallback(() => {
    const all = demoNotifications.map((item) => item.id);
    setReadIds(all);
    persist(all);
  }, [persist]);

  const value = useMemo<NotificationsContextValue>(() => {
    const notifications = demoNotifications.map((item) => ({
      ...item,
      read: readIds.includes(item.id),
    }));

    return {
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markAsRead,
      markAllRead,
    };
  }, [readIds, markAsRead, markAllRead]);

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
