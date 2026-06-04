import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <View style={styles.container}>
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = current === lng;
        return (
          <Pressable
            key={lng}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => i18n.changeLanguage(lng)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? theme.brand.primary : theme.bg.surfaceAlt,
                borderColor: theme.border.subtle,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? theme.brand.onPrimary : theme.text.secondary },
              ]}
            >
              {lng.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 13, fontWeight: '700' },
});
