/**
 * ============================================
 * BOTTOM NAVIGATION COMPONENT
 * ============================================
 *
 * Main app bottom tab navigation.
 * Tabs: Home, Explore, Reels, News, Profile
 *
 * TODO: Implement actual tab navigation
 * TODO: Add badge counts for notifications
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';

// ============================================
// NAV ITEMS CONFIGURATION
// ============================================

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  iconFilled: IconName;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', iconFilled: 'homeFilled' },
  { id: 'explore', label: 'Explore', icon: 'explore', iconFilled: 'exploreFilled' },
  { id: 'reels', label: 'Reels', icon: 'reels', iconFilled: 'reelsFilled' },
  { id: 'news', label: 'News', icon: 'news', iconFilled: 'newsFilled' },
  { id: 'profile', label: 'Profile', icon: 'profile', iconFilled: 'profileFilled' },
];

// ============================================
// TYPES
// ============================================

export interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export function BottomNavigation({ activeTab, onTabPress }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={[styles.blur, { paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.tab}
                onPress={() => onTabPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                  <AppIcon
                    name={isActive ? item.iconFilled : item.icon}
                    size="lg"
                    color={isActive ? theme.colors.accent : theme.colors.textLight}
                  />
                </View>
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: theme.spacing.sm,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.smd,
    minWidth: 56,
  },
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(212, 180, 131, 0.15)',
  },
  label: {
    ...theme.typography.tiny,
    color: theme.colors.textLight,
  },
  activeLabel: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});

export default BottomNavigation;
