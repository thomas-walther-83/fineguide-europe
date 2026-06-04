import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlagChip } from '@/components/FlagChip';
import { categoryIcon } from '@/lib/categories';
import { findCountry } from '@/lib/countries';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { severityColor } from '@/lib/severity';
import { useTheme } from '@/lib/theme';

export default function SearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [fines, setFines] = useState<Fine[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetchAllFines()
      .then((data) => active && setFines(data))
      .catch((e) => console.warn('[search] failed to load fines:', e));
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return fines.filter((f) => {
      const country = findCountry(f.country_code);
      const haystack = [f.description, t(`categories.${f.category}`), country ? t(country.nameKey) : '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [fines, query, t]);

  const maxAmount = useMemo(() => results.reduce((m, f) => Math.max(m, f.amount), 0), [results]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['bottom']}>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.bg.surfaceAlt, borderColor: theme.border.subtle },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.input, { color: theme.text.primary }]}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.text.tertiary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.text.secondary }]}>
            {query.trim() ? t('search.noResults') : t('search.hint')}
          </Text>
        }
        renderItem={({ item }) => {
          const country = findCountry(item.country_code);
          return (
            <Link href={{ pathname: '/country/[id]', params: { id: item.country_code } }} asChild>
              <Pressable
                accessibilityRole="link"
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: pressed ? theme.bg.surfaceAlt : theme.bg.surface,
                    borderColor: theme.border.subtle,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.countryCell}>
                    <FlagChip flag={country?.flag ?? '🏳️'} size={22} />
                    <Text style={[styles.country, { color: theme.text.primary }]}>
                      {country ? t(country.nameKey) : item.country_code}
                    </Text>
                  </View>
                  <Text style={[styles.amount, { color: severityColor(theme, item.amount, maxAmount) }]}>
                    {item.currency} {item.amount}
                  </Text>
                </View>
                <Text style={[styles.description, { color: theme.text.secondary }]}>
                  {categoryIcon(item.category)} {item.description}
                </Text>
              </Pressable>
            </Link>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  countryCell: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  country: { fontSize: 15, fontWeight: '700' },
  amount: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  description: { fontSize: 15 },
  empty: { textAlign: 'center', fontSize: 15, marginTop: 40, paddingHorizontal: 24, lineHeight: 22 },
});
