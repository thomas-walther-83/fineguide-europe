import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { type, useTheme } from '@/lib/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  const icon = (name: IconName) =>
    ({ color }: { color: string }) => <Icon name={name} size={22} color={color} />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg.canvas },
        headerTitleStyle: { ...type.h1, color: theme.text.primary },
        headerTintColor: theme.brand.primary,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.bg.surface,
          borderTopColor: theme.border.subtle,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.select({ ios: 84, default: 64 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 28, default: 10 }),
        },
        tabBarActiveTintColor: theme.brand.primary,
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.countries'), tabBarIcon: icon('globe') }}
      />
      <Tabs.Screen
        name="compare"
        options={{ title: t('tabs.compare'), tabBarIcon: icon('compare') }}
      />
      <Tabs.Screen
        name="calc"
        options={{ title: t('tabs.calculator'), tabBarIcon: icon('calc') }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: t('tabs.search'), tabBarIcon: icon('search') }}
      />
    </Tabs>
  );
}
