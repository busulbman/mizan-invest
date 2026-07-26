import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="property/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
