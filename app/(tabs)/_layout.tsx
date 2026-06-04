import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { useTheme } from '@/lib/theme';

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg.canvas },
        headerTitleStyle: { fontWeight: '700', color: theme.text.primary },
        headerTintColor: theme.text.primary,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.bg.surface,
          borderTopColor: theme.border.subtle,
        },
        tabBarActiveTintColor: theme.brand.primary,
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.countries'),
          tabBarIcon: ({ color }) => <TabIcon icon="🌍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: t('tabs.compare'),
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarIcon: ({ color }) => <TabIcon icon="🔍" color={color} />,
        }}
      />
    </Tabs>
  );
}
