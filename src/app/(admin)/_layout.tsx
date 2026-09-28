/**
 * ============================================
 * MIZAN MANAGEMENT
 * ============================================
 *
 * The admin's own area of Mizan, with its own persistent navigation.
 *
 * WHY TABS
 * This was a plain Stack whose dashboard listed six rows, three of which
 * routed nowhere. Tabs give the four destinations that actually exist a
 * permanent home, and the dead rows are gone rather than hidden.
 *
 * FOUR TABS, NOT FIVE
 * Dashboard, Properties, Partners and Leads are the four surfaces that carry
 * real, working functionality. Activity is a genuine feature but it is a
 * read-only audit log consulted occasionally, not a daily destination, so it
 * stays a secondary route reached from the dashboard — a fifth tab for it
 * would be a tab nobody presses. Nothing here is a placeholder.
 *
 * THIS IS NOT THE INVESTOR TAB BAR
 * A separate navigator. The customer tabs are never mounted here and nothing
 * from `(main)` is duplicated; leaving is an explicit action on the dashboard.
 *
 * backBehavior="history" IS LOAD-BEARING
 * React Navigation defaults to `firstRoute`, which would send every back
 * gesture to Dashboard regardless of where the admin actually came from —
 * the same class of bug that used to drop investor users into Explore.
 *
 * ACCESS
 * RoleGate is unchanged: `admin` or `super_admin`. The database enforces the
 * same boundary independently through `is_admin()` in RLS, so this is a UI
 * guard over an already-protected area, never the protection itself.
 */

import { Tabs } from 'expo-router';
import { ColorValue, Platform } from 'react-native';

import { RoleGate } from '@/components/auth/RoleGate';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout() {
  return (
    <RoleGate role="admin">
      <AdminTabs />
    </RoleGate>
  );
}

function AdminTabs() {
  const { t } = useLanguage();
  const { colors, typography } = useTheme();

  const icon = (name: IconName) =>
    function TabBarIcon({ color }: { color: ColorValue }) {
      return <AppIcon name={name} size={24} color={color} />;
    };

  return (
    <Tabs
      initialRouteName="dashboard"
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.select({ ios: 86, default: 64 }),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.tiny.fontFamily,
          fontSize: 10,
          lineHeight: 13,
          letterSpacing: 0,
          marginTop: 2,
        },
        tabBarLabelPosition: 'below-icon',
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: t('dashboardTab'), tabBarIcon: icon('analytics') }} />
      <Tabs.Screen name="properties" options={{ title: t('propertiesTitle'), tabBarIcon: icon('listings') }} />
      <Tabs.Screen name="partners" options={{ title: t('partners'), tabBarIcon: icon('building') }} />
      <Tabs.Screen name="leads" options={{ title: t('leadsTitle'), tabBarIcon: icon('message') }} />

      {/* Secondary route: reachable from the dashboard, never shown as a tab. */}
      <Tabs.Screen name="activity" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
