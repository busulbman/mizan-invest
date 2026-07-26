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
 * TODO: Guard this group once real partner authentication exists.
 */

import { Stack } from 'expo-router';

export default function PartnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
