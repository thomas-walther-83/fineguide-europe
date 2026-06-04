import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterPill } from '@/components/FilterPill';
import { FlagChip } from '@/components/FlagChip';
import { Pill } from '@/components/Pill';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SeverityBar } from '@/components/SeverityBar';
import { CATEGORIES, categoryIcon, type CategoryId } from '@/lib/categories';
import { COUNTRIES, findCountry } from '@/lib/countries';
import { type Currency, formatConverted } from '@/lib/currency';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { severityColor, severityForAmount } from '@/lib/severity';
import { elevation, radius, space, type, useTheme } from '@/lib/theme';

type Display = 'original' | 'EUR' | 'CHF';

export default function CalculatorScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [fines, setFines] = useState<Fine[]>([]);
  const [countryId, setCountryId] = useState('ch');
  const [category, setCategory] = useState<CategoryId>('speeding');
  const [variantId, setVariantId] = useState<string | null>(null);
  const [display, setDisplay] = useState<Display>('original');

  useEffect(() => {
    let active = true;
    fetchAllFines()
      .then((data) => active && setFines(data))
      .catch((e) => console.warn('[calc] failed to load fines:', e));
    return () => {
      active = false;
    };
  }, []);

  // All rows for the selected country + violation (e.g. speeding bands).
  const variants = useMemo(
    () =>
      fines
        .filter((f) => f.country_code === countryId && f.category === category)
        .sort((a, b) => a.amount - b.amount),
    [fines, countryId, category]
  );

  // The chosen row: the selected variant if still applicable, else the lowest.
  const result = variants.find((f) => f.id === variantId) ?? variants[0];

  // Reference for severity colour: the biggest fine for this category anywhere.
  const categoryMax = useMemo(
    () => fines.filter((f) => f.category === category).reduce((m, f) => Math.max(m, f.amount), 0),
    [fines, category]
  );

  const amountText = useMemo(() => {
    if (!result) return '–';
    const from = result.currency as Currency;
    if (display === 'original') return `${from} ${result.amount}`;
    return formatConverted(result.amount, from, display);
  }, [result, display]);

  const sev = result ? severityColor(theme, result.amount, categoryMax) : theme.text.tertiary;
  const sevKey = result ? severityForAmount(result.amount, categoryMax) : 'low';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['top']}>
      <ScreenHeader title={t('calc.title')} subtitle={t('calc.subtitle')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Country */}
        <Text style={[type.label, styles.label, { color: theme.text.tertiary }]}>
          {t('calc.selectCountry')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
          contentContainerStyle={styles.pillsContent}
        >
          {COUNTRIES.map((c) => (
            <FilterPill
              key={c.id}
              label={t(c.nameKey)}
              active={c.id === countryId}
              onPress={() => setCountryId(c.id)}
              leading={<FlagChip flag={c.flag} size={20} />}
            />
          ))}
        </ScrollView>

        {/* Violation */}
        <Text style={[type.label, styles.label, { color: theme.text.tertiary }]}>
          {t('calc.selectViolation')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
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

        {/* Variant (only when several bands/cases exist) */}
        {variants.length > 1 && (
          <>
            <Text style={[type.label, styles.label, { color: theme.text.tertiary }]}>
              {t('calc.variant')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillsRow}
              contentContainerStyle={styles.pillsContent}
            >
              {variants.map((v) => (
                <FilterPill
                  key={v.id}
                  label={v.description}
                  active={v.id === result?.id}
                  onPress={() => setVariantId(v.id)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Result — the hero */}
        <View
          style={[
            styles.resultCard,
            elevation(theme, 'raised'),
            { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
          ]}
        >
          <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
          {result ? (
            <>
              <Text style={[type.label, styles.resultCategory, { color: theme.brand.primary }]}>
                {categoryIcon(category)} {findCountry(countryId)?.flag} {t(`categories.${category}`)}
              </Text>
              <Text style={[type.amountHero, styles.resultAmount, { color: sev }]}>{amountText}</Text>
              <SeverityBar
                amount={result.amount}
                maxRef={categoryMax}
                height={8}
                style={styles.heroBar}
              />
              <Text style={[type.body, styles.resultDesc, { color: theme.text.primary }]}>
                {result.description}
              </Text>
              {result.points != null && result.points > 0 && (
                <View style={styles.pointsWrap}>
                  <Pill tone={sevKey} label={t('detail.points', { count: result.points })} />
                </View>
              )}

              {/* Currency toggle */}
              <View style={[styles.toggleTrack, { backgroundColor: theme.bg.surfaceAlt }]}>
                {(['original', 'EUR', 'CHF'] as Display[]).map((mode) => {
                  const active = display === mode;
                  return (
                    <FilterPill
                      key={mode}
                      label={mode === 'original' ? t('calc.original') : mode}
                      active={active}
                      onPress={() => setDisplay(mode)}
                      style={styles.toggleSegment}
                    />
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={[type.body, styles.resultDesc, { color: theme.text.secondary }]}>
              {t('calc.noData')}
            </Text>
          )}
        </View>

        <Text style={[type.caption, styles.disclaimer, { color: theme.text.tertiary }]}>
          {t('calc.estimate')} {t('detail.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: space[4], paddingBottom: space[10] },
  subtitle: { marginTop: space[1] },
  label: { marginTop: space[5], marginBottom: space[3] },
  pillsRow: { flexGrow: 0, marginHorizontal: -space[4] },
  pillsContent: { paddingHorizontal: space[4] },
  resultCard: {
    marginTop: space[6],
    padding: space[6],
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  resultCategory: { textAlign: 'center' },
  resultAmount: { marginTop: space[3], textAlign: 'center' },
  heroBar: { marginTop: space[4], maxWidth: 260 },
  resultDesc: { textAlign: 'center', marginTop: space[4] },
  pointsWrap: { marginTop: space[3] },
  toggleTrack: {
    flexDirection: 'row',
    marginTop: space[6],
    padding: space[1],
    borderRadius: radius.pill,
    gap: space[1],
  },
  toggleSegment: { marginRight: 0, borderWidth: 0, minHeight: 40, paddingHorizontal: space[4] },
  disclaimer: { marginTop: space[4], textAlign: 'center' },
});
