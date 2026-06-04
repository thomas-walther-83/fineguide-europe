import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { tapSelect } from '@/lib/haptics';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

/**
 * Segmented language control: a single rounded track with a globe affordance
 * and one selected segment filled with the brand colour.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: theme.bg.surfaceAlt, borderColor: theme.border.subtle },
      ]}
    >
      <Icon name="globe" size={16} color={theme.text.tertiary} style={styles.glyph} />
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = current === lng;
        return (
          <Pressable
            key={lng}
            accessibilityRole="button"
            accessibilityLabel={lng.toUpperCase()}
            accessibilityState={{ selected: active }}
            onPress={() => {
              tapSelect();
              i18n.changeLanguage(lng);
            }}
            style={({ pressed }) => [
              styles.segment,
              {
                backgroundColor: active ? theme.brand.primary : 'transparent',
                transform: [{ scale: pressed && !active ? PRESS_SCALE : 1 }],
              },
            ]}
          >
            <Text
              style={[
                type.label,
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
  track: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    padding: space[1],
    paddingLeft: space[2],
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  glyph: { marginRight: space[1] },
  segment: {
    minWidth: 40,
    minHeight: 32,
    paddingHorizontal: space[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  label: { letterSpacing: 0.5 },
});
