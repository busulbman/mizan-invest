import { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLandingRoute } from '@/lib/navigation';

type RequiredRole = 'admin' | 'partner';

interface RoleGateProps extends PropsWithChildren {
  role: RequiredRole;
}

/**
 * UI/deep-link guard. Database RLS remains the authorization boundary; this
 * avoids flashing privileged screens while the central role read is pending.
 */
export function RoleGate({ role, children }: RoleGateProps) {
  const { isAdmin, isPartner, isLoading } = useAuth();
  const { colors } = useTheme();
  // Where a denied caller belongs. This does not relax the check below — it
  // only replaces a blanket redirect to customer Home, which used to strand an
  // admin outside their own workspace. No loop is possible: every landing
  // route is one this identity is permitted to occupy.
  const landing = useLandingRoute();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const allowed = role === 'admin' ? isAdmin : isPartner;
  return allowed ? <>{children}</> : <Redirect href={landing} />;
}
