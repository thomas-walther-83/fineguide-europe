import { StyleSheet, Text, View } from 'react-native';

import { radius, space, type, useTheme } from '@/lib/theme';

type Props = {
  label: string;
  /** `amber` for points; `neutral` for generic metadata. */
  tone?: 'amber' | 'neutral';
};

/** Small rounded chip used for points / metadata. */
export function Pill({ label, tone = 'neutral' }: Props) {
  const theme = useTheme();
  const bg = tone === 'amber' ? theme.accent.amberSoft : theme.bg.surfaceAlt;
  const fg = tone === 'amber' ? theme.accent.amber : theme.text.secondary;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[type.caption, styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[3],
    minHeight: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontWeight: '700' },
});
