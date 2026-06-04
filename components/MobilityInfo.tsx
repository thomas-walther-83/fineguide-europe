import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { SectionHeader } from '@/components/SectionHeader';
import { getMobility, localizedNote, type Mobility } from '@/lib/mobility';
import { radius, space, type, useTheme } from '@/lib/theme';

type Props = {
  /** Country id (e.g. "ch", "de") to show mobility costs for. */
  countryCode: string;
};

type Row = {
  key: 'vignette' | 'toll' | 'zones';
  glyph: string;
  /** Short value/headline shown on the right of the row. */
  value: string;
  /** Tone of the value pill. */
  tone: 'low' | 'mid' | 'brand' | 'neutral';
  /** Explanatory note for the active language. */
  note: string;
};

/** Format the vignette headline value (price + period, or "no vignette"). */
function vignetteValue(m: Mobility, t: ReturnType<typeof useTranslation>['t']): string {
  const v = m.vignette;
  if (!v.required || v.price == null) return t('mobility.vignette.none');
  const price =
    v.currency === 'CHF'
      ? `CHF ${v.price.toFixed(0)}`
      : `€${v.price.toFixed(2).replace(/\.00$/, '')}`;
  return `${price} / ${t('mobility.period.year')}`;
}

/**
 * "Mobility costs" card for a country: vignette, tolls and low-emission /
 * restricted zones. Three icon + label + value + note rows, plus a source
 * link and "Stand" date. Renders nothing when no data is bundled.
 */
export function MobilityInfo({ countryCode }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const m = getMobility(countryCode);
  if (!m) return null;

  const lang = i18n.language;

  const tollValue =
    m.toll.system === 'none' ? t('mobility.toll.none') : t(`mobility.toll.system.${m.toll.system}`);
  const tollTone = m.toll.system === 'none' ? 'low' : 'mid';

  const zonesValue =
    m.lowEmissionZones.scheme === 'none'
      ? t('mobility.zones.none')
      : m.lowEmissionZones.scheme;
  const zonesTone = m.lowEmissionZones.scheme === 'none' ? 'low' : 'brand';

  const rows: Row[] = [
    {
      key: 'vignette',
      glyph: '🛣️',
      value: vignetteValue(m, t),
      tone: m.vignette.required ? 'mid' : 'low',
      note: localizedNote(m.vignette, lang),
    },
    {
      key: 'toll',
      glyph: '🎫',
      value: tollValue,
      tone: tollTone,
      note: localizedNote(m.toll, lang),
    },
    {
      key: 'zones',
      glyph: '🌿',
      value: zonesValue,
      tone: zonesTone,
      note: localizedNote(m.lowEmissionZones, lang),
    },
  ];

  return (
    <View style={styles.wrap}>
      <SectionHeader title={t('mobility.title')} />
      <Card>
        <Text style={[type.caption, styles.intro, { color: theme.text.secondary }]}>
          {t('mobility.subtitle')}
        </Text>

        {rows.map((row, i) => (
          <View
            key={row.key}
            style={[
              styles.row,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: theme.bg.surfaceAlt }]}>
              <Text style={styles.glyph}>{row.glyph}</Text>
            </View>
            <View style={styles.rowBody}>
              <View style={styles.rowHeader}>
                <Text style={[type.bodyStrong, styles.rowLabel, { color: theme.text.primary }]}>
                  {t(`mobility.${row.key}.label`)}
                </Text>
                <Pill tone={row.tone} label={row.value} />
              </View>
              <Text style={[type.caption, { color: theme.text.secondary }]}>{row.note}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.metaRow, { borderTopColor: theme.border.subtle }]}>
          <Text style={[type.caption, styles.disclaimer, { color: theme.text.tertiary }]}>
            {t('mobility.disclaimer')} · {t('meta.updated')} {m.updated_at}
          </Text>
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL(m.source_url)}
            style={[type.captionStrong, styles.sourceLink, { color: theme.brand.primary }]}
          >
            {t('meta.source')} ↗
          </Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space[2] },
  intro: { marginBottom: space[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
    paddingVertical: space[3],
    minHeight: 56,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 20, lineHeight: 26 },
  rowBody: { flex: 1, gap: space[1] },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    flexWrap: 'wrap',
  },
  rowLabel: { flexShrink: 1 },
  metaRow: {
    marginTop: space[2],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  disclaimer: { flex: 1 },
  sourceLink: {},
});
