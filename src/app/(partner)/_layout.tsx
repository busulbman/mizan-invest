/**
 * ============================================
 * PARTNER LAYOUT
 * ============================================
 *
 * Route group for the verified partner area.
 * Kept separate from (auth) so partner screens are no longer part of
 * the sign-in flow, and separate from (main) so the investor tab bar
 * is not shown here.
 *
 * Access is gated by RoleGate (partner role + active membership); the
 * database enforces the same boundary independently through RLS.
 */

import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';

export default function PartnerLayout() {
  return (
    <RoleGate role="partner">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="properties" />
        <Stack.Screen name="add-property" />
        <Stack.Screen name="edit-property" />
        <Stack.Screen name="pending-review" />
        <Stack.Screen name="profile" />
      </Stack>
    </RoleGate>
  );
}
