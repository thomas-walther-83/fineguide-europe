import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { SeverityBar } from '@/components/SeverityBar';
import { categoryIcon } from '@/lib/categories';
import type { Fine } from '@/lib/fines';
import { severityColor, severityForAmount } from '@/lib/severity';
import { space, type, useTheme } from '@/lib/theme';

type Props = {
  fine: Fine;
  /** Largest amount in the current list — used to scale the severity colour. */
  maxAmount: number;
};

export function FineListItem({ fine, maxAmount }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const sev = severityColor(theme, fine.amount, maxAmount);
  const sevKey = severityForAmount(fine.amount, maxAmount);

  return (
    <Card noPadding style={styles.card}>
      {/* severity accent bar */}
      <View style={[styles.accent, { backgroundColor: sev }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[type.label, styles.category, { color: theme.brand.primary }]} numberOfLines={1}>
            {categoryIcon(fine.category)}{' '}
            {t(`categories.${fine.category}`, { defaultValue: fine.category })}
          </Text>
          <Text style={[type.amount, { color: sev }]}>
            <Text style={[styles.currency, { color: theme.text.secondary }]}>{fine.currency} </Text>
            {fine.amount}
          </Text>
        </View>
        <Text style={[type.body, styles.description, { color: theme.text.primary }]}>
          {fine.description}
        </Text>
        <SeverityBar amount={fine.amount} maxRef={maxAmount} style={styles.bar} />
        {fine.points != null && fine.points > 0 && (
          <View style={styles.footer}>
            <Pill tone={sevKey} label={t('detail.points', { count: fine.points })} />
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: space[3],
  },
  accent: { width: 5 },
  body: { flex: 1, padding: space[4] },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
    gap: space[3],
  },
  category: { flex: 1 },
  currency: { ...type.captionStrong, fontWeight: '600' },
  description: { marginBottom: space[3] },
  bar: {},
  footer: { flexDirection: 'row', marginTop: space[3] },
});
