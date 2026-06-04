import { StyleSheet, Text, View } from 'react-native';

import { radius, useTheme } from '@/lib/theme';

type Props = {
  flag: string;
  size?: number;
};

/** A country flag rendered as a rounded-rectangle chip with a subtle border. */
export function FlagChip({ flag, size = 32 }: Props) {
  const theme = useTheme();
  const height = Math.round(size * 0.74);
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
      <Text style={[styles.flag, { fontSize: size * 0.64, lineHeight: height }]}>{flag}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    textAlign: 'center',
  },
});
