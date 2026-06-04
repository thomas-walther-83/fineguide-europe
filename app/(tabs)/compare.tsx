import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EuropeMap } from '@/components/EuropeMap';
import { FilterPill } from '@/components/FilterPill';
import { FlagChip } from '@/components/FlagChip';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { COUNTRIES } from '@/lib/countries';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { severityColor } from '@/lib/severity';
import { elevation, radius, space, type, useTheme } from '@/lib/theme';

export default function CompareScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
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

  // A category can have several rows (e.g. speeding bands). Use the lowest
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

  // Severity-coloured fill per country for the map hero.
  const fillFor = useMemo(() => {
    const byId = new Map(rows.map((r) => [r.country.id, r.fine] as const));
    return (id: string) => {
      const fine = byId.get(id);
      if (!fine || maxAmount <= 0) return undefined;
      return severityColor(theme, fine.amount, maxAmount);
    };
  }, [rows, maxAmount, theme]);

  const openCountry = (id: string) =>
    router.push({ pathname: '/country/[id]', params: { id } });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['top']}>
      <View style={styles.head}>
        <Text style={[type.h1, { color: theme.text.primary }]}>{t('compare.title')}</Text>
      </View>

      {/* Sticky violation selector — stays put while the map/table scroll. */}
      <View style={[styles.stickyBar, { backgroundColor: theme.bg.canvas, borderBottomColor: theme.border.subtle }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
        >
          {CATEGORIES.map((cat) => (
            <FilterPill
              key={cat.id}
              label={`${cat.icon}  ${t(`categories.${cat.id}`)}`}
              active={cat.id === category}
              onPress={() => setCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map hero: countries coloured by their representative fine. */}
        <View
          style={[
            styles.mapCard,
            elevation(theme, 'card'),
            { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
          ]}
        >
          <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
          <EuropeMap onSelectCountry={openCountry} fillFor={fillFor} maxHeight={300} />
          <View style={styles.legend}>
            <Text style={[type.caption, { color: theme.text.tertiary }]}>
              {t('compare.legendLow')}
            </Text>
            <View style={styles.ramp}>
              <View style={[styles.rampSeg, { backgroundColor: theme.severity.low }]} />
              <View style={[styles.rampSeg, { backgroundColor: theme.severity.mid }]} />
              <View style={[styles.rampSeg, { backgroundColor: theme.severity.high }]} />
            </View>
            <Text style={[type.caption, { color: theme.text.tertiary }]}>
              {t('compare.legendHigh')}
            </Text>
          </View>
        </View>

        {/* Compact figures below the hero. */}
        <View
          style={[
            styles.table,
            elevation(theme, 'card'),
            { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
          ]}
        >
          <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
          <View style={styles.headRow}>
            <Text style={[type.label, styles.colCountry, { color: theme.text.tertiary }]}>
              {t('compare.country')}
            </Text>
            <Text style={[type.label, styles.colAmount, { color: theme.text.tertiary }]}>
              {t('compare.amount')}
            </Text>
            <Text style={[type.label, styles.colPoints, { color: theme.text.tertiary }]}>
              {t('compare.points')}
            </Text>
          </View>

          {rows.map(({ country, fine }, i) => {
            const sev = fine ? severityColor(theme, fine.amount, maxAmount) : theme.text.tertiary;
            return (
              <View
                key={country.id}
                style={[
                  styles.tr,
                  {
                    borderTopColor: theme.border.subtle,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={[styles.colCountry, styles.countryCell]}>
                  <FlagChip flag={country.flag} size={26} />
                  <Text
                    style={[type.bodyStrong, styles.countryName, { color: theme.text.primary }]}
                    numberOfLines={1}
                  >
                    {t(country.nameKey)}
                  </Text>
                </View>
                <Text style={[type.amount, styles.colAmount, { color: sev }]}>
                  {fine ? `${fine.currency} ${fine.amount}` : '–'}
                </Text>
                <Text style={[type.bodyStrong, styles.colPoints, { color: theme.text.secondary }]}>
                  {fine && fine.points != null ? fine.points : '–'}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={[type.caption, styles.disclaimer, { color: theme.text.tertiary }]}>
          {t('detail.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  head: { paddingHorizontal: space[4], paddingTop: space[2], paddingBottom: space[1] },
  stickyBar: {
    paddingTop: space[2],
    paddingBottom: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: { paddingHorizontal: space[4], paddingTop: space[4], paddingBottom: space[10] },
  pillsContent: { paddingHorizontal: space[4] },
  mapCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    marginBottom: space[4],
    minHeight: 300,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    marginTop: space[2],
  },
  ramp: { flexDirection: 'row', height: 8, width: 120, borderRadius: radius.pill, overflow: 'hidden' },
  rampSeg: { flex: 1 },
  table: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: space[4],
  },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: space[4],
    paddingBottom: space[3],
  },
  tr: { paddingVertical: space[3], flexDirection: 'row', alignItems: 'center' },
  countryCell: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  countryName: { flexShrink: 1 },
  colCountry: { flex: 1 },
  colAmount: { width: 104, textAlign: 'right' },
  colPoints: { width: 56, textAlign: 'right' },
  disclaimer: { marginTop: space[4], textAlign: 'center' },
});
