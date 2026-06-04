import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  flag: string;
  size?: number;
};

/** A country flag rendered as a rounded-rectangle chip with a subtle border. */
export function FlagChip({ flag, size = 30 }: Props) {
  const theme = useTheme();
  const height = Math.round(size * 0.72);
  return (
    <View
      style={[
        styles.chip,
        {
          width: size,
          height,
          borderColor: theme.border.subtle,
          backgroundColor: theme.bg.surfaceAlt,
        },
      ]}
    >
      <Text style={[styles.flag, { fontSize: size * 0.62, lineHeight: height }]}>{flag}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    textAlign: 'center',
  },
});
