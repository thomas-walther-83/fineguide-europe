import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/FavoriteButton';
import { FlagChip } from '@/components/FlagChip';
import { Icon } from '@/components/Icon';
import type { Country } from '@/lib/countries';
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
        <FlagChip flag={country.flag} />
        <View style={styles.textContainer}>
          <Text style={[type.h2, { color: theme.text.primary }]}>{t(country.nameKey)}</Text>
          <Text style={[type.caption, styles.subtitle, { color: theme.text.secondary }]}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.trailing}>
          <FavoriteButton id={country.id} />
          <Icon name="chevron-right" size={20} color={theme.text.tertiary} />
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
    minHeight: 68,
  },
  textContainer: { flex: 1 },
  subtitle: { marginTop: 2 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
});
