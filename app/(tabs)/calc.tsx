import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Disclaimer } from '@/components/Disclaimer';
import { FilterPill } from '@/components/FilterPill';
import { FlagChip } from '@/components/FlagChip';
import { Pill } from '@/components/Pill';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Selector } from '@/components/Selector';
import { SeverityBar } from '@/components/SeverityBar';
import { CATEGORIES, categoryIcon, type CategoryId } from '@/lib/categories';
import { COUNTRIES, findCountry } from '@/lib/countries';
import { type Currency, formatConverted } from '@/lib/currency';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { severityColor, severityForAmount } from '@/lib/severity';
import { layout, radius, space, type, useTheme } from '@/lib/theme';

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
        <Selector
          label={t('calc.selectCountry')}
          options={COUNTRIES.map((c) => ({
            id: c.id,
            label: t(c.nameKey),
            leading: <FlagChip flag={c.flag} size={20} />,
          }))}
          selectedId={countryId}
          onSelect={setCountryId}
        />

        <Selector
          label={t('calc.selectViolation')}
          options={CATEGORIES.map((cat) => ({
            id: cat.id,
            label: `${cat.icon}  ${t(`categories.${cat.id}`)}`,
          }))}
          selectedId={category}
          onSelect={(id) => setCategory(id as CategoryId)}
        />

        {/* Variant (only when several bands/cases exist) */}
        {variants.length > 1 && (
          <Selector
            label={t('calc.variant')}
            options={variants.map((v) => ({ id: v.id, label: v.description }))}
            selectedId={result?.id ?? ''}
            onSelect={setVariantId}
          />
        )}

        {/* Result — the hero */}
        <Card variant="raised" style={styles.resultCard}>
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
        </Card>

        <Disclaimer>{`${t('calc.estimate')} ${t('detail.disclaimer')}`}</Disclaimer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenX,
    paddingTop: layout.topGap,
    paddingBottom: layout.bottomGap,
  },
  resultCard: {
    marginTop: space[2],
    padding: space[6],
    alignItems: 'center',
  },
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
});
