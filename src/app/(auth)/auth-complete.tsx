import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

/** Email-confirmation deep-link landing page. */
export default function AuthCompleteScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isAuthenticated) return <Redirect href="/(main)/home" />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundDark, alignItems: 'center', justifyContent: 'center' }}>
      {isLoading && <ActivityIndicator color={colors.accent} />}
    </View>
  );
}
