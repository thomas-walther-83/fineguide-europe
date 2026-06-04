import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/FavoriteButton';
import { FineListItem } from '@/components/FineListItem';
import { FlagChip } from '@/components/FlagChip';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Pill } from '@/components/Pill';
import { CATEGORIES, categoryIcon, type CategoryId } from '@/lib/categories';
import { findCountry } from '@/lib/countries';
import { fetchFinesByCountryResult, type Fine } from '@/lib/fines';
import { elevation, radius, space, type, useTheme } from '@/lib/theme';

type Section = { category: CategoryId; max: number; data: Fine[] };

export default function CountryDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const countryCode = String(id);
  const country = findCountry(countryCode);

  const [fines, setFines] = useState<Fine[]>([]);
  const [offline, setOffline] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(() => {
    let active = true;
    setStatus('loading');
    fetchFinesByCountryResult(countryCode)
      .then((result) => {
        if (!active) return;
        setFines(result.data);
        setOffline(result.offline);
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
      <Stack.Screen
        options={{
          title,
          headerRight: () => <FavoriteButton id={countryCode} />,
        }}
      />

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.brand.primary} />
          <Text style={[type.body, styles.muted, { color: theme.text.secondary }]}>
            {t('detail.loading')}
          </Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[type.body, styles.muted, { color: theme.text.secondary }]}>
            {t('detail.error')}
          </Text>
          <Pressable
            onPress={load}
            style={[styles.retry, { borderColor: theme.border.subtle, backgroundColor: theme.bg.surfaceAlt }]}
          >
            <Text style={[type.bodyStrong, { color: theme.brand.primary }]}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      )}

      {status === 'ready' && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <OfflineBanner visible={offline} />
              <View
                style={[
                  styles.hero,
                  elevation(theme, 'raised'),
                  { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
                ]}
              >
                <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
                <FlagChip flag={country?.flag ?? '🏳️'} size={48} />
                <View style={styles.heroText}>
                  <Text style={[type.h1, { color: theme.text.primary }]}>{title}</Text>
                  {country && (
                    <View style={styles.heroMeta}>
                      <Pill tone="neutral" label={country.currency} />
                      <Pill
                        tone={country.hasPoints ? 'brand' : 'neutral'}
                        label={country.hasPoints ? t('meta.withPoints') : t('meta.noPoints')}
                      />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={[type.caption, styles.disclaimer, { color: theme.text.tertiary }]}>
                  {t('detail.disclaimer')}
                  {updated ? ` · ${t('meta.updated')} ${updated}` : ''}
                </Text>
                {source && (
                  <Text
                    onPress={() => Linking.openURL(source)}
                    style={[type.captionStrong, styles.sourceLink, { color: theme.brand.primary }]}
                  >
                    {t('meta.source')} ↗
                  </Text>
                )}
              </View>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text style={[type.label, styles.sectionHeader, { color: theme.text.tertiary }]}>
              {categoryIcon((section as Section).category)}{' '}
              {t(`categories.${(section as Section).category}`)}
            </Text>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[type.body, styles.muted, { color: theme.text.secondary }]}>
                {t('detail.empty')}
              </Text>
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
  listContent: { padding: space[4], paddingBottom: space[10] },
  headerWrap: { gap: space[3], marginBottom: space[2] },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[4],
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  heroText: { flex: 1, gap: space[2] },
  heroMeta: { flexDirection: 'row', gap: space[2], flexWrap: 'wrap' },
  metaRow: { alignItems: 'center', gap: space[1] },
  disclaimer: { textAlign: 'center' },
  sourceLink: {},
  sectionHeader: { marginTop: space[5], marginBottom: space[3] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[8], gap: space[3] },
  muted: { textAlign: 'center' },
  errorIcon: { fontSize: 32 },
  retry: {
    marginTop: space[1],
    paddingVertical: space[3],
    paddingHorizontal: space[5],
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
