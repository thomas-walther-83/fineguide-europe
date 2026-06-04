import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FavoritesProvider } from '@/lib/favorites';
import { fonts, type, useTheme } from '@/lib/theme';

// Initialise i18next as early as possible.
import '@/lib/i18n';

export default function RootLayout() {
  const theme = useTheme();

  // Splash-safe font loading: render a plain canvas-coloured view until the
  // display + body families are ready, then mount the app. If a font fails to
  // load we still mount (useFonts surfaces an error and falls back gracefully).
  //
  // On web the fonts are delivered via @font-face injected at export time
  // (see scripts/postexport-web.js) with font-display:swap, so we never gate
  // first paint on the network there — only native blocks until fonts resolve.
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const gateOnFonts = Platform.OS !== 'web';
  if (gateOnFonts && !fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: theme.bg.canvas }} />;
  }

  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.bg.canvas },
            headerTintColor: theme.brand.primary,
            headerLargeTitle: true,
            headerLargeTitleStyle: {
              fontFamily: fonts.display,
              fontSize: 30,
              color: theme.text.primary,
            },
            headerLargeStyle: { backgroundColor: theme.bg.canvas },
            headerTitleStyle: { ...type.h1, color: theme.text.primary },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.bg.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="country/[id]" options={{ headerLargeTitle: false }} />
        </Stack>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}
