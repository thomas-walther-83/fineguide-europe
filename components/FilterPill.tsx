import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { tapSelect } from '@/lib/haptics';
import { PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Optional leading element (e.g. a FlagChip). */
  leading?: ReactNode;
  style?: ViewStyle;
};

/**
 * A horizontally-scrolling filter chip used by the Compare / Calculator
 * selectors. Active = filled brand; inactive = soft surface with hairline
 * border. Light haptic on tap (native only).
 */
export function FilterPill({ label, active, onPress, leading, style }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        tapSelect();
        onPress();
      }}
      style={({ pressed }) => [
        styles.pill,
        leading ? styles.withLeading : null,
        {
          backgroundColor: active ? theme.brand.primary : theme.bg.surfaceAlt,
          borderColor: active ? theme.brand.primary : theme.border.subtle,
          transform: [{ scale: pressed && !active ? PRESS_SCALE : 1 }],
        },
        style,
      ]}
    >
      {leading}
      <Text
        style={[
          type.bodyStrong,
          { color: active ? theme.brand.onPrimary : theme.text.secondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 44,
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  withLeading: { gap: space[2], paddingLeft: space[3] },
});
