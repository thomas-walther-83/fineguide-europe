import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { FlagChip } from '@/components/FlagChip';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { SkeletonList } from '@/components/Skeleton';
import { categoryIcon } from '@/lib/categories';
import { findCountry } from '@/lib/countries';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { severityColor } from '@/lib/severity';
import { elevation, PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

export default function SearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetchAllFines()
      .then((data) => active && setFines(data))
      .catch((e) => console.warn('[search] failed to load fines:', e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const trimmed = query.trim();

  const results = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return [];
    return fines.filter((f) => {
      const country = findCountry(f.country_code);
      const haystack = [f.description, t(`categories.${f.category}`), country ? t(country.nameKey) : '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [fines, trimmed, t]);

  const maxAmount = useMemo(() => results.reduce((m, f) => Math.max(m, f.amount), 0), [results]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['bottom']}>
      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.bg.surfaceAlt, borderColor: theme.border.subtle },
          ]}
        >
          <Icon name="search" size={18} color={theme.text.tertiary} />
          <TextInput
            style={[styles.input, { color: theme.text.primary }]}
            placeholder={t('search.placeholder')}
            placeholderTextColor={theme.text.tertiary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setQuery('')}
              style={[styles.clear, { backgroundColor: theme.text.tertiary }]}
            >
              <Text style={[styles.clearGlyph, { color: theme.bg.surfaceAlt }]}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading && !trimmed ? (
            <View style={styles.skeletonWrap}>
              <SkeletonList count={4} kind="card" />
            </View>
          ) : (
            <EmptyState
              icon="search"
              title={trimmed ? t('search.noResults') : t('search.hint')}
            />
          )
        }
        renderItem={({ item }) => {
          const country = findCountry(item.country_code);
          const severity = severityColor(theme, item.amount, maxAmount);
          return (
            <Link href={{ pathname: '/country/[id]', params: { id: item.country_code } }} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${country ? t(country.nameKey) : item.country_code}, ${item.description}, ${item.currency} ${item.amount}`}
                style={({ pressed }) => [
                  styles.card,
                  elevation(theme, 'card'),
                  {
                    backgroundColor: pressed ? theme.bg.surfaceAlt : theme.bg.surface,
                    borderColor: theme.border.subtle,
                    transform: [{ scale: pressed ? PRESS_SCALE : 1 }],
                  },
                ]}
              >
                <View style={[styles.accent, { backgroundColor: severity }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <View style={styles.countryCell}>
                      <FlagChip flag={country?.flag ?? '🏳️'} size={26} />
                      <Text style={[type.bodyStrong, { color: theme.text.primary }]} numberOfLines={1}>
                        {country ? t(country.nameKey) : item.country_code}
                      </Text>
                    </View>
                    <Text style={[type.amount, { color: severity }]}>
                      {item.currency} {item.amount}
                    </Text>
                  </View>
                  <Text style={[type.label, styles.category, { color: theme.brand.primary }]}>
                    {categoryIcon(item.category)} {t(`categories.${item.category}`)}
                  </Text>
                  <Text style={[type.body, { color: theme.text.primary }]}>{item.description}</Text>
                  {item.points != null && item.points > 0 ? (
                    <View style={styles.footer}>
                      <Pill tone="amber" label={t('detail.points', { count: item.points })} />
                    </View>
                  ) : null}
                </View>
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
  searchWrap: { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[2] },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space[3],
    minHeight: 48,
    gap: space[2],
  },
  input: { flex: 1, paddingVertical: space[3], fontSize: 16 },
  clear: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearGlyph: { fontSize: 15, lineHeight: 18, fontWeight: '700' },
  listContent: { paddingHorizontal: space[4], paddingBottom: space[6] },
  skeletonWrap: { paddingTop: space[2] },
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space[3],
    overflow: 'hidden',
  },
  accent: { width: 3 },
  cardBody: { flex: 1, padding: space[4] },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space[3],
    marginBottom: space[2],
  },
  countryCell: { flexDirection: 'row', alignItems: 'center', gap: space[2], flexShrink: 1 },
  category: { marginBottom: space[1] },
  footer: { flexDirection: 'row', marginTop: space[3] },
});
