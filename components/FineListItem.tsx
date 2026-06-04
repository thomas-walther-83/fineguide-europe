import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { categoryIcon } from '@/lib/categories';
import type { Fine } from '@/lib/fines';
import { severityColor } from '@/lib/severity';
import { useTheme } from '@/lib/theme';

type Props = {
  fine: Fine;
  /** Largest amount in the current list — used to scale the severity colour. */
  maxAmount: number;
};

export function FineListItem({ fine, maxAmount }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const sev = severityColor(theme, fine.amount, maxAmount);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: sev }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[styles.category, { color: theme.brand.primary }]} numberOfLines={1}>
            {categoryIcon(fine.category)}{' '}
            {t(`categories.${fine.category}`, { defaultValue: fine.category })}
          </Text>
          <Text style={[styles.amount, { color: sev }]}>
            <Text style={[styles.currency, { color: theme.text.secondary }]}>
              {fine.currency}{' '}
            </Text>
            {fine.amount}
          </Text>
        </View>
        <Text style={[styles.description, { color: theme.text.primary }]}>
          {fine.description}
        </Text>
        {fine.points != null && fine.points > 0 && (
          <View style={styles.footer}>
            <View style={[styles.pointsPill, { backgroundColor: theme.accent.amberSoft }]}>
              <Text style={[styles.pointsText, { color: theme.accent.amber }]}>
                {t('detail.points', { count: fine.points })}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 12,
  },
  category: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  currency: { fontSize: 13, fontWeight: '600' },
  description: { fontSize: 15, lineHeight: 21 },
  footer: { flexDirection: 'row', marginTop: 10 },
  pointsPill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  pointsText: { fontSize: 12, fontWeight: '700' },
});
