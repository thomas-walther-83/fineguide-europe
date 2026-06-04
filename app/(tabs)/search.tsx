import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryIcon } from '@/lib/categories';
import { COUNTRIES } from '@/lib/countries';
import { fetchAllFines, type Fine } from '@/lib/fines';

export default function SearchScreen() {
  const { t } = useTranslation();
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
      const country = COUNTRIES.find((c) => c.id === f.country_code);
      const haystack = [
        f.description,
        t(`categories.${f.category}`),
        country ? t(country.nameKey) : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [fines, query, t]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={t('search.placeholder')}
          placeholderTextColor="#9BA1A6"
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
          <Text style={styles.empty}>
            {query.trim() ? t('search.noResults') : t('search.hint')}
          </Text>
        }
        renderItem={({ item }) => {
          const country = COUNTRIES.find((c) => c.id === item.country_code);
          return (
            <Link
              href={{ pathname: '/country/[id]', params: { id: item.country_code } }}
              asChild
            >
              <Pressable
                accessibilityRole="link"
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.country}>
                    {country?.flag} {country ? t(country.nameKey) : item.country_code}
                  </Text>
                  <Text style={styles.amount}>
                    {item.currency} {item.amount}
                  </Text>
                </View>
                <Text style={styles.description}>
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
  container: { flex: 1, backgroundColor: '#f2f3f5' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#11181C' },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 10 },
  pressed: { opacity: 0.6 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  country: { fontSize: 15, fontWeight: '700', color: '#0a7ea4' },
  amount: { fontSize: 16, fontWeight: '800', color: '#11181C' },
  description: { fontSize: 15, color: '#11181C' },
  empty: { textAlign: 'center', color: '#687076', fontSize: 15, marginTop: 40, paddingHorizontal: 24 },
});
