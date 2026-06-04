import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FineListItem } from '@/components/FineListItem';
import { FlagChip } from '@/components/FlagChip';
import { CATEGORIES, categoryIcon, type CategoryId } from '@/lib/categories';
import { findCountry } from '@/lib/countries';
import { fetchFinesByCountry, type Fine } from '@/lib/fines';
import { useTheme } from '@/lib/theme';

type Section = { category: CategoryId; max: number; data: Fine[] };

export default function CountryDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const countryCode = String(id);
  const country = findCountry(countryCode);

  const [fines, setFines] = useState<Fine[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(() => {
    let active = true;
    setStatus('loading');
    fetchFinesByCountry(countryCode)
      .then((data) => {
        if (!active) return;
        setFines(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        console.warn('[country detail] failed to load fines:', error);
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [countryCode]);

  useEffect(() => load(), [load]);

  const title = country ? t(country.nameKey) : countryCode.toUpperCase();
  const source = fines.find((f) => f.source_url)?.source_url ?? null;
  const updated = fines.find((f) => f.updated_at)?.updated_at ?? null;

  // Group fines by category (in canonical order); each category becomes a
  // section so multiple variants (e.g. speeding bands) read cleanly.
  const sections = useMemo<Section[]>(() => {
    const groups = new Map<CategoryId, Fine[]>();
    for (const f of fines) {
      const list = groups.get(f.category) ?? [];
      list.push(f);
      groups.set(f.category, list);
    }
    return CATEGORIES.filter((c) => groups.has(c.id)).map((c) => {
      const data = (groups.get(c.id) ?? []).sort((a, b) => a.amount - b.amount);
      return { category: c.id, data, max: data.reduce((m, f) => Math.max(m, f.amount), 0) };
    });
  }, [fines]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['bottom']}>
      <Stack.Screen options={{ title }} />

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.brand.primary} />
          <Text style={[styles.muted, { color: theme.text.secondary }]}>{t('detail.loading')}</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.muted, { color: theme.text.secondary }]}>{t('detail.error')}</Text>
          <Pressable
            onPress={load}
            style={[styles.retry, { borderColor: theme.border.subtle, backgroundColor: theme.bg.surfaceAlt }]}
          >
            <Text style={[styles.retryText, { color: theme.brand.primary }]}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      )}

      {status === 'ready' && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View>
              <View style={[styles.hero, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                <FlagChip flag={country?.flag ?? '🏳️'} size={40} />
                <View style={styles.heroText}>
                  <Text style={[styles.heroTitle, { color: theme.text.primary }]}>{title}</Text>
                  {country && (
                    <Text style={[styles.heroSubtitle, { color: theme.text.secondary }]}>
                      {country.currency} · {country.hasPoints ? t('meta.withPoints') : t('meta.noPoints')}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.disclaimer, { color: theme.text.tertiary }]}>
                  {t('detail.disclaimer')}
                  {updated ? ` · ${t('meta.updated')} ${updated}` : ''}
                </Text>
                {source && (
                  <Text
                    onPress={() => Linking.openURL(source)}
                    style={[styles.sourceLink, { color: theme.brand.primary }]}
                  >
                    {t('meta.source')} ↗
                  </Text>
                )}
              </View>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: theme.text.tertiary }]}>
              {categoryIcon((section as Section).category)}{' '}
              {t(`categories.${(section as Section).category}`)}
            </Text>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.muted, { color: theme.text.secondary }]}>{t('detail.empty')}</Text>
            </View>
          }
          renderItem={({ item, section }) => (
            <FineListItem fine={item} maxAmount={(section as Section).max} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: '800' },
  heroSubtitle: { marginTop: 2, fontSize: 14 },
  metaRow: { marginTop: 10, marginBottom: 8, alignItems: 'center', gap: 4 },
  disclaimer: { fontSize: 12, textAlign: 'center' },
  sourceLink: { fontSize: 12, fontWeight: '700' },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  muted: { fontSize: 15, textAlign: 'center' },
  errorIcon: { fontSize: 32 },
  retry: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  retryText: { fontSize: 15, fontWeight: '700' },
});
