/**
 * ============================================
 * NOTIFICATIONS
 * ============================================
 *
 * In-app notification centre reached from the Home bell.
 *
 * Everything here is live state, not decoration: unread rows carry a
 * marker and a tinted background, tapping a row marks it read and opens
 * the listing it refers to, and "mark all as read" clears the Home badge
 * immediately.
 *
 * DEMO SCOPE — no push service, no device token, no permission prompt.
 * The rows come from seeded data and read state persists locally.
 */

import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppIcon, IconButton } from '@/components/ui';
import { relativeTime } from '@/constants/notificationsData';
import { AppNotification, useNotifications } from '@/context/NotificationsContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export default function NotificationsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const timeUnits = {
    now: t('timeNow'),
    minutes: t('timeMinutes'),
    hours: t('timeHours'),
    days: t('timeDays'),
  };

  const toneColor = (tone: AppNotification['tone']) =>
    ({
      accent: colors.accent,
      success: colors.success,
      info: colors.info,
      error: colors.error,
    })[tone];

  const openNotification = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.propertyId) {
      router.push(`/(main)/property/${item.propertyId}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <IconButton
            icon="back"
            onPress={() => router.back()}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {t('notifications')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {unreadCount > 0 ? (
          <Pressable
            onPress={markAllRead}
            hitSlop={8}
            accessibilityRole="button"
            style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}
          >
            <AppIcon name="check" size="sm" color={colors.accent} />
            <Text style={styles.markAllText} numberOfLines={1} ellipsizeMode="tail">
              {t('markAllRead')}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.caughtUp} numberOfLines={1}>
            {t('allNotificationsRead')}
          </Text>
        )}
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 40)}>
            <Pressable
              onPress={() => openNotification(item)}
              accessibilityRole="button"
              accessibilityLabel={t(item.titleKey)}
              style={({ pressed }) => [
                styles.row,
                !item.read && styles.rowUnread,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[styles.iconTile, { backgroundColor: `${toneColor(item.tone)}1F` }]}
              >
                <AppIcon name={item.icon} size="md" color={toneColor(item.tone)} />
              </View>

              <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowTitle} numberOfLines={2} ellipsizeMode="tail">
                    {t(item.titleKey)}
                  </Text>
                  <Text style={styles.rowTime} numberOfLines={1}>
                    {relativeTime(item.minutesAgo, timeUnits)}
                  </Text>
                </View>

                <Text style={styles.rowBodyText} numberOfLines={3} ellipsizeMode="tail">
                  {t(item.bodyKey)}
                </Text>

                {!item.read && (
                  <View style={styles.unreadRow}>
                    <View style={styles.unreadDot} />
                    <Text style={styles.unreadLabel} numberOfLines={1}>
                      {t('unreadLabel')}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  pressed: {
    opacity: 0.75,
  },

  header: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.smd,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
  },
  title: {
    flex: 1,
    minWidth: 0,
    ...t.typography.h3,
    color: t.colors.text,
    textAlign: 'center',
  },
  // Balances the back button so the title stays optically centred
  headerSpacer: {
    width: 40,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    minHeight: 36,
    maxWidth: '80%',
  },
  markAllText: {
    flexShrink: 1,
    ...t.typography.captionBold,
    color: t.colors.accent,
  },
  caughtUp: {
    alignSelf: 'flex-end',
    ...t.typography.caption,
    color: t.colors.textMuted,
    paddingTop: t.spacing.sm,
  },

  content: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.section,
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.smd,
    padding: t.spacing.smd,
    marginBottom: t.spacing.sm,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  rowUnread: {
    borderColor: t.colors.accentOverlay.medium,
    backgroundColor: t.colors.accentOverlay.light,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: t.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
    ...t.typography.bodyBold,
    color: t.colors.text,
  },
  rowTime: {
    flexShrink: 0,
    ...t.typography.tiny,
    color: t.colors.textMuted,
  },
  rowBodyText: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  unreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: t.colors.error,
  },
  unreadLabel: {
    ...t.typography.tiny,
    color: t.colors.error,
  },
}));
