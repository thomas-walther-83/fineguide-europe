import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { COUNTRIES } from '@/lib/countries';
import { fetchAllFines, type Fine } from '@/lib/fines';

export default function CompareScreen() {
  const { t } = useTranslation();
  const [fines, setFines] = useState<Fine[]>([]);
  const [category, setCategory] = useState<CategoryId>('speeding');

  useEffect(() => {
    let active = true;
    fetchAllFines()
      .then((data) => active && setFines(data))
      .catch((e) => console.warn('[compare] failed to load fines:', e));
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    return COUNTRIES.map((country) => ({
      country,
      fine: fines.find((f) => f.country_code === country.id && f.category === category),
    }));
  }, [fines, category]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('compare.title')}</Text>
        <Text style={styles.subtitle}>{t('compare.subtitle')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
          {CATEGORIES.map((cat) => {
            const active = cat.id === category;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {cat.icon} {t(`categories.${cat.id}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.table}>
          <View style={[styles.tr, styles.thead]}>
            <Text style={[styles.th, styles.colCountry]}>{t('compare.country')}</Text>
            <Text style={[styles.th, styles.colAmount]}>{t('compare.amount')}</Text>
            <Text style={[styles.th, styles.colPoints]}>{t('compare.points')}</Text>
          </View>
          {rows.map(({ country, fine }) => (
            <View key={country.id} style={styles.tr}>
              <Text style={[styles.td, styles.colCountry]}>
                {country.flag} {t(country.nameKey)}
              </Text>
              <Text style={[styles.td, styles.colAmount, styles.amount]}>
                {fine ? `${fine.currency} ${fine.amount}` : '–'}
              </Text>
              <Text style={[styles.td, styles.colPoints]}>
                {fine && fine.points != null ? fine.points : '–'}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>{t('detail.disclaimer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f5' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#11181C' },
  subtitle: { marginTop: 4, marginBottom: 12, fontSize: 14, color: '#687076' },
  pillsRow: { flexGrow: 0, marginBottom: 16 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#e6e8eb',
    marginRight: 8,
  },
  pillActive: { backgroundColor: '#0a7ea4' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#11181C' },
  pillTextActive: { color: '#ffffff' },
  table: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e6e8eb',
  },
  thead: { backgroundColor: '#f2f3f5' },
  th: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', color: '#687076' },
  td: { fontSize: 15, color: '#11181C' },
  colCountry: { flex: 1 },
  colAmount: { width: 100, textAlign: 'right' },
  colPoints: { width: 64, textAlign: 'right' },
  amount: { fontWeight: '800' },
  disclaimer: { marginTop: 12, fontSize: 12, color: '#9BA1A6', textAlign: 'center' },
});
