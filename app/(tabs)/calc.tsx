import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlagChip } from '@/components/FlagChip';
import { CATEGORIES, categoryIcon, type CategoryId } from '@/lib/categories';
import { COUNTRIES, findCountry } from '@/lib/countries';
import { type Currency, formatConverted } from '@/lib/currency';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { severityColor } from '@/lib/severity';
import { useTheme } from '@/lib/theme';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{t('calc.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{t('calc.subtitle')}</Text>

        {/* Country */}
        <Text style={[styles.label, { color: theme.text.tertiary }]}>{t('calc.selectCountry')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
          {COUNTRIES.map((c) => {
            const active = c.id === countryId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCountryId(c.id)}
                style={[
                  styles.countryPill,
                  {
                    backgroundColor: active ? theme.brand.primary : theme.bg.surfaceAlt,
                    borderColor: theme.border.subtle,
                  },
                ]}
              >
                <FlagChip flag={c.flag} size={20} />
                <Text
                  style={[
                    styles.pillText,
                    { color: active ? theme.brand.onPrimary : theme.text.secondary },
                  ]}
                >
                  {t(c.nameKey)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Violation */}
        <Text style={[styles.label, { color: theme.text.tertiary }]}>{t('calc.selectViolation')}</Text>
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

        {/* Variant (only when several bands/cases exist) */}
        {variants.length > 1 && (
          <>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>{t('calc.variant')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
              {variants.map((v) => {
                const active = v.id === result?.id;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => setVariantId(v.id)}
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
                      {v.description}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Result */}
        <View style={[styles.resultCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          {result ? (
            <>
              <Text style={[styles.resultCategory, { color: theme.brand.primary }]}>
                {categoryIcon(category)} {findCountry(countryId)?.flag} {t(`categories.${category}`)}
              </Text>
              <Text style={[styles.resultAmount, { color: severityColor(theme, result.amount, categoryMax) }]}>
                {amountText}
              </Text>
              <Text style={[styles.resultDesc, { color: theme.text.primary }]}>{result.description}</Text>
              {result.points != null && result.points > 0 && (
                <View style={[styles.pointsPill, { backgroundColor: theme.accent.amberSoft }]}>
                  <Text style={[styles.pointsText, { color: theme.accent.amber }]}>
                    {t('detail.points', { count: result.points })}
                  </Text>
                </View>
              )}

              {/* Currency toggle */}
              <View style={styles.toggleRow}>
                {(['original', 'EUR', 'CHF'] as Display[]).map((mode) => {
                  const active = display === mode;
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setDisplay(mode)}
                      style={[
                        styles.togglePill,
                        {
                          backgroundColor: active ? theme.brand.primary : theme.bg.surfaceAlt,
                          borderColor: theme.border.subtle,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          { color: active ? theme.brand.onPrimary : theme.text.secondary },
                        ]}
                      >
                        {mode === 'original' ? t('calc.original') : mode}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={[styles.resultDesc, { color: theme.text.secondary }]}>{t('calc.noData')}</Text>
          )}
        </View>

        <Text style={[styles.disclaimer, { color: theme.text.tertiary }]}>
          {t('calc.estimate')} {t('detail.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { marginTop: 4, marginBottom: 8, fontSize: 14 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  pillsRow: { flexGrow: 0 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
  },
  pillText: { fontSize: 14, fontWeight: '600' },
  resultCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  resultCategory: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultAmount: { fontSize: 40, fontWeight: '900', marginTop: 8, fontVariant: ['tabular-nums'] },
  resultDesc: { fontSize: 15, textAlign: 'center', marginTop: 8 },
  pointsPill: { marginTop: 12, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
  pointsText: { fontSize: 13, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  togglePill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleText: { fontSize: 14, fontWeight: '700' },
  disclaimer: { marginTop: 16, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
