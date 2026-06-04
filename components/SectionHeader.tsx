import { StyleSheet, Text, View } from 'react-native';

import { space, type, useTheme } from '@/lib/theme';

type Props = {
  title: string;
  /** Optional trailing element (e.g. a count or action). */
  trailing?: React.ReactNode;
};

/** Uppercase eyebrow used above lists/sections. */
export function SectionHeader({ title, trailing }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, type.label, { color: theme.text.tertiary }]}>{title}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  title: {},
});
