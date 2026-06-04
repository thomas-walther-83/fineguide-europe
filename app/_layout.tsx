import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';

// Initialise i18next as early as possible.
import '@/lib/i18n';

export default function RootLayout() {
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg.canvas },
          headerTintColor: theme.brand.primary,
          headerTitleStyle: { fontWeight: '700', color: theme.text.primary },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.bg.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="country/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
