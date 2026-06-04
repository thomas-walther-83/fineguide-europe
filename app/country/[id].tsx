import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FineListItem } from '@/components/FineListItem';
import { FlagChip } from '@/components/FlagChip';
import { findCountry } from '@/lib/countries';
import { fetchFinesByCountry, type Fine } from '@/lib/fines';
import { useTheme } from '@/lib/theme';

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
  const maxAmount = fines.reduce((m, f) => Math.max(m, f.amount), 0);
  const source = fines.find((f) => f.source_url)?.source_url ?? null;
  const updated = fines.find((f) => f.updated_at)?.updated_at ?? null;

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
        <FlatList
          data={fines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.muted, { color: theme.text.secondary }]}>{t('detail.empty')}</Text>
            </View>
          }
          renderItem={({ item }) => <FineListItem fine={item} maxAmount={maxAmount} />}
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
  metaRow: { marginTop: 10, marginBottom: 14, alignItems: 'center', gap: 4 },
  disclaimer: { fontSize: 12, textAlign: 'center' },
  sourceLink: { fontSize: 12, fontWeight: '700' },
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
