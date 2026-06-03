import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FineListItem } from '@/components/FineListItem';
import { COUNTRIES } from '@/lib/countries';
import { fetchFinesByCountry, type Fine } from '@/lib/fines';

export default function CountryDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const countryCode = String(id);
  const country = COUNTRIES.find((c) => c.id === countryCode);

  const [fines, setFines] = useState<Fine[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
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

  const title = country ? t(country.nameKey) : countryCode.toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title }} />

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator color="#0a7ea4" />
          <Text style={styles.muted}>{t('detail.loading')}</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.muted}>{t('detail.error')}</Text>
        </View>
      )}

      {status === 'ready' && (
        <FlatList
          data={fines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.heading}>
              {country?.flag} {title}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>{t('detail.empty')}</Text>
            </View>
          }
          ListFooterComponent={<Text style={styles.disclaimer}>{t('detail.disclaimer')}</Text>}
          renderItem={({ item }) => <FineListItem fine={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f3f5',
  },
  listContent: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#11181C',
    marginBottom: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  muted: {
    fontSize: 15,
    color: '#687076',
    textAlign: 'center',
  },
  disclaimer: {
    marginTop: 12,
    fontSize: 12,
    color: '#9BA1A6',
    textAlign: 'center',
  },
});
