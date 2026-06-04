import { StyleSheet, Text, View } from 'react-native';

import { radius, space, type, useTheme } from '@/lib/theme';

type Tone = 'amber' | 'neutral' | 'low' | 'mid' | 'high' | 'brand';

type Props = {
  label: string;
  /** `amber` for points; severity tones for magnitude; `neutral` for metadata. */
  tone?: Tone;
};

/** Small rounded chip used for points / metadata / severity. */
export function Pill({ label, tone = 'neutral' }: Props) {
  const theme = useTheme();

  const map: Record<Tone, { bg: string; fg: string }> = {
    amber: { bg: theme.accent.amberSoft, fg: theme.accent.amber },
    neutral: { bg: theme.bg.surfaceAlt, fg: theme.text.secondary },
    brand: { bg: theme.bg.surfaceAlt, fg: theme.brand.primary },
    low: { bg: theme.severity.lowSoft, fg: theme.severity.low },
    mid: { bg: theme.severity.midSoft, fg: theme.severity.mid },
    high: { bg: theme.severity.highSoft, fg: theme.severity.high },
  };
  const { bg, fg } = map[tone];

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[type.captionStrong, styles.label, { color: fg }]}>{label}</Text>
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
