import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterPill } from '@/components/FilterPill';
import { FlagChip } from '@/components/FlagChip';
import { Pill } from '@/components/Pill';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { COUNTRIES, findCountry, type Country } from '@/lib/countries';
import { convert, type Currency } from '@/lib/currency';
import { fetchAllFines, type Fine } from '@/lib/fines';
import { elevation, radius, space, type, useTheme } from '@/lib/theme';

/** Common currency used to compare across CHF/EUR. */
const COMPARE_CURRENCY: Currency = 'EUR';
/** Below this EUR delta two fines count as "about the same". */
const SIMILAR_THRESHOLD = 10;

type Verdict = 'more' | 'less' | 'similar';

type Row = {
  category: CategoryId;
  icon: string;
  homeFine?: Fine;
  destFine?: Fine;
  /** Representative amounts converted to the compare currency. */
  homeEur: number;
  destEur: number;
  /** destEur - homeEur (positive = more expensive at the destination). */
  deltaEur: number;
  verdict: Verdict;
  /** Extra demerit points at the destination vs home (>0 only). */
  extraPoints: number;
  pointsNew: boolean;
};

/** Lowest-band fine for a country+category (the comparable "entry-level" fine). */
function representative(fines: Fine[], countryId: string, category: CategoryId): Fine | undefined {
  return fines
    .filter((f) => f.country_code === countryId && f.category === category)
    .sort((a, b) => a.amount - b.amount)[0];
}

export default function TripScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [fines, setFines] = useState<Fine[]>([]);
  const [homeId, setHomeId] = useState<string>('ch');
  const [destId, setDestId] = useState<string>(
    COUNTRIES.find((c) => c.id !== 'ch')?.id ?? COUNTRIES[0].id
  );

  useEffect(() => {
    let active = true;
    fetchAllFines()
      .then((data) => active && setFines(data))
      .catch((e) => console.warn('[trip] failed to load fines:', e));
    return () => {
      active = false;
    };
  }, []);

  const home = findCountry(homeId) ?? COUNTRIES[0];
  const dest = findCountry(destId) ?? COUNTRIES[0];

  // Picking a home that equals the destination would be meaningless; bounce the
  // other selector to a different country so home !== destination always holds.
  const selectHome = (id: string) => {
    setHomeId(id);
    if (id === destId) {
      setDestId(COUNTRIES.find((c) => c.id !== id)?.id ?? destId);
    }
  };
  const selectDest = (id: string) => {
    setDestId(id);
    if (id === homeId) {
      setHomeId(COUNTRIES.find((c) => c.id !== id)?.id ?? homeId);
    }
  };

  const rows = useMemo<Row[]>(() => {
    if (fines.length === 0) return [];
    const built = CATEGORIES.map(({ id, icon }) => {
      const homeFine = representative(fines, home.id, id);
      const destFine = representative(fines, dest.id, id);
      const homeEur = homeFine
        ? convert(homeFine.amount, homeFine.currency as Currency, COMPARE_CURRENCY)
        : 0;
      const destEur = destFine
        ? convert(destFine.amount, destFine.currency as Currency, COMPARE_CURRENCY)
        : 0;
      const deltaEur = destEur - homeEur;
      const verdict: Verdict =
        Math.abs(deltaEur) < SIMILAR_THRESHOLD ? 'similar' : deltaEur > 0 ? 'more' : 'less';
      const homePoints = homeFine?.points ?? 0;
      const destPoints = destFine?.points ?? 0;
      const extraPoints = Math.max(0, destPoints - homePoints);
      return {
        category: id,
        icon,
        homeFine,
        destFine,
        homeEur,
        destEur,
        deltaEur,
        verdict,
        extraPoints,
        pointsNew: homePoints === 0 && destPoints > 0,
      } satisfies Row;
    }).filter((r) => r.homeFine && r.destFine);
    // Biggest "more expensive at the destination" deltas first — the most
    // useful "watch out, it's pricier there" rows surface at the top.
    return built.sort((a, b) => b.deltaEur - a.deltaEur);
  }, [fines, home.id, dest.id]);

  const renderSelector = (
    label: string,
    selectedId: string,
    onSelect: (id: string) => void
  ) => (
    <View style={styles.selectorBlock}>
      <Text style={[type.label, { color: theme.text.tertiary }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsRow}
        contentContainerStyle={styles.pillsContent}
      >
        {COUNTRIES.map((c: Country) => (
          <FilterPill
            key={c.id}
            label={t(c.nameKey)}
            active={c.id === selectedId}
            onPress={() => onSelect(c.id)}
            leading={<FlagChip flag={c.flag} size={22} />}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg.canvas }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[type.display, { color: theme.text.primary }]}>{t('trip.title')}</Text>
        <Text style={[type.body, styles.subtitle, { color: theme.text.secondary }]}>
          {t('trip.subtitle')}
        </Text>

        {renderSelector(t('trip.home'), home.id, selectHome)}
        {renderSelector(t('trip.destination'), dest.id, selectDest)}

        {/* Route summary chip: home → destination, compared in EUR. */}
        <View style={styles.routeRow}>
          <View style={styles.routeEnd}>
            <FlagChip flag={home.flag} size={28} />
            <Text style={[type.bodyStrong, { color: theme.text.primary }]} numberOfLines={1}>
              {t(home.nameKey)}
            </Text>
          </View>
          <Text style={[type.h2, styles.arrow, { color: theme.brand.primary }]}>→</Text>
          <View style={[styles.routeEnd, styles.routeEndRight]}>
            <FlagChip flag={dest.flag} size={28} />
            <Text style={[type.bodyStrong, { color: theme.text.primary }]} numberOfLines={1}>
              {t(dest.nameKey)}
            </Text>
          </View>
        </View>
        <Text style={[type.caption, styles.summary, { color: theme.text.tertiary }]}>
          {t('trip.summary', { currency: COMPARE_CURRENCY })}
        </Text>

        {rows.length === 0 ? (
          <View
            style={[
              styles.card,
              elevation(theme, 'card'),
              { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
            ]}
          >
            <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
            <Text style={[type.body, { color: theme.text.secondary }]}>{t('trip.noData')}</Text>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              elevation(theme, 'card'),
              { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
            ]}
          >
            <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
            {rows.map((row, i) => {
              const tone =
                row.verdict === 'more'
                  ? theme.severity.high
                  : row.verdict === 'less'
                    ? theme.severity.low
                    : theme.text.secondary;
              const verdictLabel =
                row.verdict === 'more'
                  ? t('trip.moreExpensive')
                  : row.verdict === 'less'
                    ? t('trip.cheaper')
                    : t('trip.similar');
              const deltaAbs = Math.round(Math.abs(row.deltaEur));
              const arrow = row.verdict === 'more' ? '▲' : row.verdict === 'less' ? '▼' : '≈';
              return (
                <View
                  key={row.category}
                  style={[
                    styles.tr,
                    {
                      borderTopColor: theme.border.subtle,
                      borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  {/* Category */}
                  <View style={styles.catCell}>
                    <Text style={styles.catIcon}>{row.icon}</Text>
                    <Text
                      style={[type.bodyStrong, styles.catLabel, { color: theme.text.primary }]}
                      numberOfLines={1}
                    >
                      {t(`categories.${row.category}`)}
                    </Text>
                  </View>

                  {/* Home vs destination originals + delta verdict */}
                  <View style={styles.compareCell}>
                    <View style={styles.amounts}>
                      <View style={styles.amountCol}>
                        <Text style={[type.label, { color: theme.text.tertiary }]}>
                          {t('trip.homeShort')}
                        </Text>
                        <Text style={[type.amount, { color: theme.text.secondary }]}>
                          {row.homeFine
                            ? `${row.homeFine.currency} ${row.homeFine.amount}`
                            : '–'}
                        </Text>
                      </View>
                      <View style={[styles.amountCol, styles.amountColRight]}>
                        <Text style={[type.label, { color: theme.text.tertiary }]}>
                          {t('trip.destShort')}
                        </Text>
                        <Text style={[type.amount, { color: theme.text.primary }]}>
                          {row.destFine
                            ? `${row.destFine.currency} ${row.destFine.amount}`
                            : '–'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.verdictRow}>
                      <Text style={[type.captionStrong, { color: tone }]}>
                        {arrow} {verdictLabel}
                        {row.verdict !== 'similar'
                          ? `  ${t('trip.approxLabel')} ${COMPARE_CURRENCY} ${deltaAbs}`
                          : ''}
                      </Text>
                    </View>

                    {(row.pointsNew || row.extraPoints > 0) && (
                      <View style={styles.pointsRow}>
                        <Pill label={t('trip.pointsBadge', { count: row.extraPoints })} tone="amber" />
                        <Text style={[type.caption, styles.pointsHint, { color: theme.accent.amber }]}>
                          {row.pointsNew ? t('trip.pointsHint') : t('trip.morePointsHint')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={[type.caption, styles.note, { color: theme.text.tertiary }]}>
          {t('trip.approxNote', { currency: COMPARE_CURRENCY })}
        </Text>
        <Text style={[type.caption, styles.disclaimer, { color: theme.text.tertiary }]}>
          {t('detail.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: space[4], paddingBottom: space[10] },
  subtitle: { marginTop: space[1], marginBottom: space[4] },
  selectorBlock: { marginBottom: space[3] },
  pillsRow: { flexGrow: 0, marginTop: space[2], marginHorizontal: -space[4] },
  pillsContent: { paddingHorizontal: space[4] },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space[2],
    marginBottom: space[1],
  },
  routeEnd: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  routeEndRight: { justifyContent: 'flex-end' },
  arrow: { marginHorizontal: space[2] },
  summary: { marginBottom: space[4] },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: space[4],
    paddingVertical: space[1],
  },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  tr: { paddingVertical: space[4] },
  catCell: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[3] },
  catIcon: { fontSize: 20 },
  catLabel: { flexShrink: 1 },
  compareCell: { gap: space[2] },
  amounts: { flexDirection: 'row', alignItems: 'flex-start' },
  amountCol: { flex: 1, gap: space[1] },
  amountColRight: { alignItems: 'flex-end' },
  verdictRow: { marginTop: space[1] },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[1] },
  pointsHint: { flexShrink: 1 },
  note: { marginTop: space[4], textAlign: 'center' },
  disclaimer: { marginTop: space[2], textAlign: 'center' },
});
