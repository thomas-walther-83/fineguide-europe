import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { categoryIcon } from '@/lib/categories';
import type { Fine } from '@/lib/fines';

type Props = {
  fine: Fine;
};

export function FineListItem({ fine }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.category}>
          {categoryIcon(fine.category)}{' '}
          {t(`categories.${fine.category}`, { defaultValue: fine.category })}
        </Text>
        <Text style={styles.amount}>
          {fine.currency} {fine.amount}
        </Text>
      </View>
      <Text style={styles.description}>{fine.description}</Text>
      {fine.points != null && fine.points > 0 && (
        <Text style={styles.points}>{t('detail.points', { count: fine.points })}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#0a7ea4',
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#11181C',
  },
  description: {
    fontSize: 15,
    color: '#11181C',
  },
  points: {
    marginTop: 6,
    fontSize: 13,
    color: '#687076',
  },
});
