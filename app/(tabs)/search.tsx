import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { FlagChip } from '@/components/FlagChip';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SeverityBar } from '@/components/SeverityBar';
import { SkeletonList } from '@/components/Skeleton';
import { categoryIcon } from '@/lib/categories';
import { findCountry } from '@/lib/countries';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { tapImpact } from '@/lib/haptics';
import { severityColor, severityForAmount } from '@/lib/severity';
import { elevation, PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

export default function SearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['top']}>
      <ScreenHeader title={t('tabs.search')} subtitle={t('search.hint')} />
      <View style={styles.searchWrap}>
        <Text style={[type.display, styles.heading, { color: theme.text.primary }]}>
          {t('tabs.search')}
        </Text>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.bg.surface,
              borderColor: focused ? theme.brand.primary : theme.border.subtle,
              borderWidth: focused ? 1.5 : StyleSheet.hairlineWidth,
            },
            elevation(theme, 'card'),
          ]}
        >
          <Icon name="search" size={18} color={focused ? theme.brand.primary : theme.text.tertiary} />
          <TextInput
            style={[styles.input, type.body, { color: theme.text.primary }]}
            placeholder={t('search.placeholder')}
            placeholderTextColor={theme.text.tertiary}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
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
              <Text style={[styles.clearGlyph, { color: theme.bg.surface }]}>×</Text>
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
            <EmptyState icon="search" title={trimmed ? t('search.noResults') : t('search.hint')} />
          )
        }
        renderItem={({ item }) => {
          const country = findCountry(item.country_code);
          const severity = severityColor(theme, item.amount, maxAmount);
          const sevKey = severityForAmount(item.amount, maxAmount);
          return (
            <Link href={{ pathname: '/country/[id]', params: { id: item.country_code } }} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${country ? t(country.nameKey) : item.country_code}, ${item.description}, ${item.currency} ${item.amount}`}
                onPress={tapImpact}
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
                <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
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
                  <SeverityBar amount={item.amount} maxRef={maxAmount} style={styles.bar} />
                  {item.points != null && item.points > 0 ? (
                    <View style={styles.footer}>
                      <Pill tone={sevKey} label={t('detail.points', { count: item.points })} />
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
  searchWrap: { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[3], gap: space[3] },
  heading: {},
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    minHeight: 52,
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
  listContent: { paddingHorizontal: space[4], paddingBottom: space[10] },
  skeletonWrap: { paddingTop: space[2] },
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space[3],
    overflow: 'hidden',
  },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 1 },
  accent: { width: 5 },
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
  bar: { marginTop: space[3] },
  footer: { flexDirection: 'row', marginTop: space[3] },
});
