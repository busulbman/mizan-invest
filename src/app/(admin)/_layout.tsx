import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';

export default function AdminLayout() {
  return (
    <RoleGate role="admin">
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="partners" />
        <Stack.Screen name="properties" />
        <Stack.Screen name="activity" />
      </Stack>
    </RoleGate>
  );
}
