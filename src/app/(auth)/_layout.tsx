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
      <Stack.Screen name="market" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="investor-login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="partner-login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="reset-password" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="auth-complete" options={{ animation: 'fade' }} />
    </Stack>
  );
}
