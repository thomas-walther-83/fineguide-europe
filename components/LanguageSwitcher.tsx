import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
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
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {lng.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#e6e8eb',
  },
  pillActive: {
    backgroundColor: '#0a7ea4',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#687076',
  },
  labelActive: {
    color: '#ffffff',
  },
});
