import { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const allowed = role === 'admin' ? isAdmin : isPartner;
  return allowed ? <>{children}</> : <Redirect href="/(main)/home" />;
}
