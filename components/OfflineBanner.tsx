import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { radius, space, type, useTheme } from '@/lib/theme';

/**
 * Subtle banner shown when the screen is serving saved (offline) data because a
 * live fetch failed. Uses the amber accent so it reads as informational, not an
 * error. Renders nothing when `visible` is false.
 */
export function OfflineBanner({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!visible) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.accent.amberSoft, borderColor: theme.accent.amber }]}
    >
      <Text style={[type.caption, styles.text, { color: theme.text.secondary }]}>
        {t('offline.banner')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space[3],
  },
  text: { textAlign: 'center' },
});
