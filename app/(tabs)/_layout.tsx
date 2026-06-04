import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { fonts, useTheme } from '@/lib/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const icon =
    (name: IconName) =>
    ({ color, focused }: { color: string; focused: boolean }) => (
      <Icon name={name} size={focused ? 24 : 22} color={color} />
    );

  // Headers are hidden; each screen renders its own compact inline title, which
  // keeps content tight to the top (no oversized nav-bar gap). The tab bar uses
  // the navigator's default height + safe-area inset (no wasted space below it).
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg.surface,
          borderTopColor: theme.border.subtle,
          borderTopWidth: StyleSheet.hairlineWidth,
          // Compact bar + the home-indicator inset so the background fills to the
          // bottom edge while the labels clear the indicator. The root now spans
          // the full dynamic viewport (see scripts/postexport-web.js), so the bar
          // sits flush at the bottom on web and native alike.
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.brand.primary,
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.countries'), tabBarIcon: icon('globe') }} />
      <Tabs.Screen name="compare" options={{ title: t('tabs.compare'), tabBarIcon: icon('compare') }} />
      <Tabs.Screen name="trip" options={{ title: t('tabs.trip'), tabBarIcon: icon('trip') }} />
      <Tabs.Screen name="calc" options={{ title: t('tabs.calculator'), tabBarIcon: icon('calc') }} />
      <Tabs.Screen name="search" options={{ title: t('tabs.search'), tabBarIcon: icon('search') }} />
    </Tabs>
  );
}
