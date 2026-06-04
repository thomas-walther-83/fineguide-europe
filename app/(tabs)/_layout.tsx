import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0a7ea4' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: '#9BA1A6',
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
