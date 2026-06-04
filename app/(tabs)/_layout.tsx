import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { fonts, useTheme } from '@/lib/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  const icon = (name: IconName) =>
    ({ color, focused }: { color: string; focused: boolean }) => (
      <Icon name={name} size={focused ? 24 : 22} color={color} />
    );

  // On iOS, float a translucent blurred bar; elsewhere use a solid surface.
  const useBlur = Platform.OS === 'ios';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg.canvas },
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 22, color: theme.text.primary },
        headerTintColor: theme.brand.primary,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: useBlur ? 'transparent' : theme.bg.surface,
          borderTopColor: theme.border.subtle,
          borderTopWidth: StyleSheet.hairlineWidth,
          position: useBlur ? 'absolute' : 'relative',
          height: Platform.select({ ios: 88, default: 66 }),
          paddingTop: 10,
          paddingBottom: Platform.select({ ios: 30, default: 12 }),
          elevation: 0,
        },
        tabBarBackground: useBlur
          ? () => (
              <BlurView
                tint={theme.mode === 'dark' ? 'dark' : 'light'}
                intensity={80}
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
        tabBarActiveTintColor: theme.brand.primary,
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarLabelStyle: {
          fontFamily: fonts.bodySemi,
          fontSize: 11,
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.countries'), tabBarIcon: icon('globe'), headerShown: false }}
      />
      <Tabs.Screen
        name="compare"
        options={{ title: t('tabs.compare'), tabBarIcon: icon('compare') }}
      />
      <Tabs.Screen
        name="trip"
        options={{ title: t('tabs.trip'), tabBarIcon: icon('trip') }}
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
