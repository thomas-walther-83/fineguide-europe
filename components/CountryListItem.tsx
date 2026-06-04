import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlagChip } from '@/components/FlagChip';
import type { Country } from '@/lib/countries';
import { useTheme } from '@/lib/theme';

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
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: pressed ? theme.bg.surfaceAlt : theme.bg.surface,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <FlagChip flag={country.flag} />
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: theme.text.primary }]}>{t(country.nameKey)}</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.text.tertiary }]}>›</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    gap: 14,
    minHeight: 64,
  },
  textContainer: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700' },
  subtitle: { marginTop: 2, fontSize: 13 },
  chevron: { fontSize: 26, fontWeight: '300' },
});
