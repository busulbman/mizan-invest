/**
 * ============================================
 * MAIN TAB LAYOUT
 * ============================================
 *
 * Native bottom tabs: Explore · Reels · Home · News · AI Studio.
 *
 * TAB LABEL OVERFLOW
 * Five tabs on a 375pt screen leaves ~75pt per item, and Russian labels
 * ("Уведомления") do not fit at the default size. The label is
 * therefore set to 10pt, capped at one line and allowed to use the full
 * item width — smaller than body text on purpose, which is normal for a
 * tab bar, rather than letting it wrap or clip.
 *
 * Detail, notification, settings and gallery routes live in this group
 * but are hidden from the bar (`href: null`) and hide it while open, so
 * they present full-screen and back returns to the tab that opened them.
 */

import { Tabs } from 'expo-router';
import { ColorValue, Platform } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';
import { useLanguage } from '@/context/LanguageContext';
import { MAIN_TAB_NAMES, MainTabName, TabRefreshProvider, useTabRefresh } from '@/context/TabRefreshContext';
import { useTheme } from '@/context/ThemeContext';

interface TabIconProps {
  name: IconName;
  activeName: IconName;
  color: ColorValue;
  focused: boolean;
}

function TabIcon({ name, activeName, color, focused }: TabIconProps) {
  const isHome = name === 'home';
  return (
    <AppIcon
      name={focused ? activeName : name}
      size={isHome ? 26 : 24}
      color={color}
    />
  );
}

export default function MainTabLayout() {
  return (
    <TabRefreshProvider>
      <MainTabs />
    </TabRefreshProvider>
  );
}

function isMainTabName(name: string): name is MainTabName {
  return MAIN_TAB_NAMES.includes(name as MainTabName);
}

function MainTabs() {
  const { t } = useLanguage();
  const { colors, typography, metrics } = useTheme();
  const { refreshTab } = useTabRefresh();

  return (
    <Tabs
        initialRouteName="home"
        // Settings, Profile, Favorites, Notifications, Property detail and the
        // partner application are hidden TABS (href: null), not stack screens,
        // so router.back() from them is resolved by this prop rather than by a
        // stack. React Navigation defaults to 'firstRoute', which is `explore`
        // below — that is why back used to land on Explore. 'history' returns
        // to the previously visited route instead.
        backBehavior="history"
        screenListeners={({ route, navigation }) => ({
          tabPress: () => {
            const state = navigation.getState();
            const activeRoute = state.routes[state.index];
            if (activeRoute?.key === route.key && isMainTabName(route.name)) {
              refreshTab(route.name);
            }
          },
        })}
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
        tabBarItemStyle: {
          paddingHorizontal: metrics.isSmall ? 0 : 2,
        },
        // One line only — a wrapped label would push the icon upward
        // and misalign the row.
        tabBarLabelPosition: 'below-icon',
        sceneStyle: { backgroundColor: colors.background },
        }}
      >
      <Tabs.Screen
        name="explore"
        options={{
          title: t('exploreTab'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="explore" activeName="exploreFilled" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: t('reels'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="reels" activeName="reelsFilled" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" activeName="homeFilled" color={color} focused={focused} />
          ),
          tabBarLabelStyle: {
            fontSize: 10.5,
          },
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: t('news'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="news"
              activeName="newsFilled"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-studio"
        options={{
          title: "AI Studio",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="ai" activeName="aiFilled" color={color} focused={focused} />
          ),
        }}
      />

      {/* These routes remain available from their in-app entry points. */}
      <Tabs.Screen name="notifications" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="profile" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="favorites" options={{ href: null, tabBarStyle: { display: 'none' } }} />

      {/* Pushed routes — reachable by navigation, never shown as a tab */}
      <Tabs.Screen name="property/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="partner-application" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="edit-profile" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
