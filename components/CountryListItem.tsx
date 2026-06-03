import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Country } from '@/lib/countries';

type Props = {
  country: Country;
};

export function CountryListItem({ country }: Props) {
  const { t } = useTranslation();

  return (
    <Link
      href={{ pathname: '/country/[id]', params: { id: country.id } }}
      asChild
    >
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Text style={styles.flag}>{country.flag}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{t(country.nameKey)}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    gap: 14,
  },
  pressed: {
    opacity: 0.6,
  },
  flag: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#11181C',
  },
  chevron: {
    fontSize: 24,
    color: '#9BA1A6',
  },
});
