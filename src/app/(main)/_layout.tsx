/**
 * ============================================
 * MAIN TAB LAYOUT
 * ============================================
 *
 * Real Expo Router tab navigation for the investor area.
 *
 * Demo tabs: Home · Explore · Favorites · Profile
 * Reels and News are intentionally not part of the tab bar in this
 * phase; their screens will be added later.
 *
 * property/[id] lives inside this group but is hidden from the tab bar
 * (href: null) and hides the bar while open, so the detail screen is
 * full-screen and the back button returns to the tab that opened it.
 */

import { Tabs } from 'expo-router';
import { ColorValue, Platform, StyleSheet } from 'react-native';

import { theme } from '@/theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';
import { useLanguage } from '@/context/LanguageContext';

interface TabIconProps {
  name: IconName;
  activeName: IconName;
  color: ColorValue;
  focused: boolean;
}

function TabIcon({ name, activeName, color, focused }: TabIconProps) {
  return <AppIcon name={focused ? activeName : name} size="lg" color={color} />;
}

export default function MainTabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        sceneStyle: styles.scene,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" activeName="homeFilled" color={color} focused={focused} />
          ),
        }}
      />
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
        name="favorites"
        options={{
          title: t('favorites'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="favorite" activeName="favoriteFilled" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" activeName="profileFilled" color={color} focused={focused} />
          ),
        }}
      />

      {/* Detail route — reachable by push, never shown as a tab */}
      <Tabs.Screen
        name="property/[id]"
        options={{ href: null, tabBarStyle: styles.hiddenTabBar }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    height: Platform.select({ ios: 88, default: 64 }),
    paddingTop: 8,
  },
  hiddenTabBar: {
    display: 'none',
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarLabel: {
    ...theme.typography.tiny,
    marginTop: 2,
  },
  scene: {
    backgroundColor: theme.colors.background,
  },
});
