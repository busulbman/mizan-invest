import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="investor-login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="partner-login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="partner-dashboard" options={{ animation: 'fade' }} />
    </Stack>
  );
}
