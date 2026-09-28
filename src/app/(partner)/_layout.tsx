/**
 * ============================================
 * PARTNER WORKSPACE
 * ============================================
 *
 * The partner's own area of Mizan, with its own persistent navigation.
 *
 * WHY TABS AND NOT A STACK
 * This used to be a plain Stack whose only navigation was four buttons on the
 * dashboard, so every screen was a push with a back arrow and there was no
 * sense of being *inside* a workspace. Tabs give the four primary destinations
 * a permanent home.
 *
 * THIS IS NOT THE INVESTOR TAB BAR
 * A separate navigator with its own four destinations — the customer tabs
 * (Explore / Reels / Home / News / AI Studio) are never rendered here, and
 * nothing from `(main)` is duplicated. A partner in this group cannot reach
 * the investor bar by accident; leaving is an explicit action in Profile.
 *
 * SECONDARY ROUTES
 * `edit-property` and `pending-review` live in this navigator but are hidden
 * from the bar with `href: null`. They are detail screens reached from
 * Properties and the dashboard, not destinations of their own.
 *
 * backBehavior="history" IS LOAD-BEARING
 * React Navigation's default is `firstRoute`, which would send every back
 * gesture to whichever tab is declared first regardless of where the partner
 * actually came from. That is the exact bug that used to drop investor users
 * into Explore. `history` returns to the previously visited destination, and
 * the detail screens additionally name their own parent.
 *
 * ACCESS
 * RoleGate is unchanged: `partner` role AND an active membership. The database
 * enforces the same boundary independently through RLS, so this is a UI guard
 * over an already-protected area, never the protection itself.
 */

import { Tabs } from 'expo-router';
import { ColorValue, Platform } from 'react-native';

import { RoleGate } from '@/components/auth/RoleGate';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function PartnerLayout() {
  return (
    <RoleGate role="partner">
      <PartnerTabs />
    </RoleGate>
  );
}

function PartnerTabs() {
  const { t } = useLanguage();
  const { colors, typography } = useTheme();

  const icon = (name: IconName, activeName: IconName) =>
    function TabBarIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
      return <AppIcon name={focused ? activeName : name} size={24} color={color} />;
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
      <Tabs.Screen
        name="dashboard"
        options={{ title: t('dashboardTab'), tabBarIcon: icon('analytics', 'analytics') }}
      />
      <Tabs.Screen
        name="properties"
        options={{ title: t('myProperties'), tabBarIcon: icon('listings', 'listings') }}
      />
      <Tabs.Screen
        name="add-property"
        options={{ title: t('addTab'), tabBarIcon: icon('create', 'create') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('profileTitle'), tabBarIcon: icon('profile', 'profileFilled') }}
      />

      {/* Detail routes: reachable by navigation, never shown as a tab. */}
      <Tabs.Screen name="edit-property" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="pending-review" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
