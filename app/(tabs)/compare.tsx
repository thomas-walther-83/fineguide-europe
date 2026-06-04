import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlagChip } from '@/components/FlagChip';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { COUNTRIES } from '@/lib/countries';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { severityColor } from '@/lib/severity';
import { useTheme } from '@/lib/theme';

export default function CompareScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
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

  // A category can now have several rows (e.g. speeding bands). Use the lowest
  // amount as the comparable representative ("entry-level" fine) per country.
  const rows = useMemo(
    () =>
      COUNTRIES.map((country) => ({
        country,
        fine: fines
          .filter((f) => f.country_code === country.id && f.category === category)
          .sort((a, b) => a.amount - b.amount)[0],
      })),
    [fines, category]
  );

  const maxAmount = useMemo(
    () => rows.reduce((m, r) => Math.max(m, r.fine?.amount ?? 0), 0),
    [rows]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{t('compare.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{t('compare.subtitle')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
          {CATEGORIES.map((cat) => {
            const active = cat.id === category;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? theme.brand.primary : theme.bg.surfaceAlt,
                    borderColor: theme.border.subtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: active ? theme.brand.onPrimary : theme.text.secondary },
                  ]}
                >
                  {cat.icon} {t(`categories.${cat.id}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.table, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <View style={[styles.tr, { backgroundColor: theme.bg.surfaceAlt, borderBottomColor: theme.border.subtle }]}>
            <Text style={[styles.th, styles.colCountry, { color: theme.text.tertiary }]}>{t('compare.country')}</Text>
            <Text style={[styles.th, styles.colAmount, { color: theme.text.tertiary }]}>{t('compare.amount')}</Text>
            <Text style={[styles.th, styles.colPoints, { color: theme.text.tertiary }]}>{t('compare.points')}</Text>
          </View>
          {rows.map(({ country, fine }, i) => (
            <View
              key={country.id}
              style={[
                styles.tr,
                {
                  borderBottomColor: theme.border.subtle,
                  backgroundColor: i % 2 ? theme.bg.surfaceAlt : 'transparent',
                },
              ]}
            >
              <View style={[styles.colCountry, styles.countryCell]}>
                <FlagChip flag={country.flag} size={24} />
                <Text style={[styles.countryName, { color: theme.text.primary }]} numberOfLines={1}>
                  {t(country.nameKey)}
                </Text>
              </View>
              <Text
                style={[
                  styles.td,
                  styles.colAmount,
                  styles.amount,
                  { color: fine ? severityColor(theme, fine.amount, maxAmount) : theme.text.tertiary },
                ]}
              >
                {fine ? `${fine.currency} ${fine.amount}` : '–'}
              </Text>
              <Text style={[styles.td, styles.colPoints, { color: theme.text.secondary }]}>
                {fine && fine.points != null ? fine.points : '–'}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.disclaimer, { color: theme.text.tertiary }]}>{t('detail.disclaimer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { marginTop: 4, marginBottom: 14, fontSize: 14 },
  pillsRow: { flexGrow: 0, marginBottom: 16 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
  },
  pillText: { fontSize: 14, fontWeight: '600' },
  table: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  th: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { fontSize: 15 },
  colCountry: { flex: 1 },
  countryCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countryName: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  colAmount: { width: 110, textAlign: 'right' },
  colPoints: { width: 60, textAlign: 'right' },
  amount: { fontWeight: '800', fontVariant: ['tabular-nums'] },
  disclaimer: { marginTop: 12, fontSize: 12, textAlign: 'center' },
});
