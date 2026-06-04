import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlagChip } from '@/components/FlagChip';
import { Icon } from '@/components/Icon';
import type { Country } from '@/lib/countries';
import { tapImpact } from '@/lib/haptics';
import { elevation, PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

type Props = {
  country: Country;
};

export function CountryListItem({ country }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const subtitle = `${country.currency} · ${
    country.hasPoints ? t('meta.withPoints') : t('meta.noPoints')
  }`;

  return (
    <Link href={{ pathname: '/country/[id]', params: { id: country.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${t(country.nameKey)}, ${subtitle}`}
        onPress={tapImpact}
        style={({ pressed }) => [
          styles.row,
          elevation(theme, 'card'),
          {
            backgroundColor: pressed ? theme.bg.surfaceAlt : theme.bg.surface,
            borderColor: theme.border.subtle,
            transform: [{ scale: pressed ? PRESS_SCALE : 1 }],
          },
        ]}
      >
        <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
        <FlagChip flag={country.flag} size={36} />
        <View style={styles.textContainer}>
          <Text style={[type.h2, { color: theme.text.primary }]}>{t(country.nameKey)}</Text>
          <Text style={[type.caption, styles.subtitle, { color: theme.text.secondary }]}>
            {subtitle}
          </Text>
        </View>
        <View style={[styles.chev, { backgroundColor: theme.bg.surfaceAlt }]}>
          <Icon name="chevron-right" size={18} color={theme.text.tertiary} />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space[3],
    gap: space[4],
    minHeight: 72,
    overflow: 'hidden',
  },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  textContainer: { flex: 1 },
  subtitle: { marginTop: 2 },
  chev: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
