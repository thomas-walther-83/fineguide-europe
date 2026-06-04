import { StyleSheet, View, type ViewStyle } from 'react-native';

import { severityColor, severityRatio, severityTintFor } from '@/lib/severity';
import { radius, useTheme } from '@/lib/theme';

type Props = {
  amount: number;
  /** Reference max used to scale both the colour and the fill width. */
  maxRef: number;
  /** Bar thickness. */
  height?: number;
  style?: ViewStyle;
};

/**
 * A thin horizontal severity bar: a soft track with a coloured fill whose
 * width encodes the amount's magnitude and whose colour follows the
 * green→amber→red severity ramp. The visual language for "how big is this".
 */
export function SeverityBar({ amount, maxRef, height = 6, style }: Props) {
  const theme = useTheme();
  const ratio = severityRatio(amount, maxRef);
  const color = severityColor(theme, amount, maxRef);
  const track = severityTintFor(theme, amount, maxRef);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.track, { height, borderRadius: height, backgroundColor: track }, style]}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: radius.pill },
});
