import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { elevation, radius, space, useTheme } from '@/lib/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Visual weight: `flat` skips the shadow (e.g. nested surfaces). */
  variant?: 'card' | 'raised' | 'flat';
};

/**
 * Surface container: generously rounded, hairline border, soft shadow in light
 * mode and a faint top highlight (premium sheen) in dark mode.
 */
export function Card({ children, style, variant = 'card' }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variant === 'flat' ? theme.bg.surfaceAlt : theme.bg.surface,
          borderColor: theme.border.subtle,
        },
        variant !== 'flat' && elevation(theme, variant === 'raised' ? 'raised' : 'card'),
        style,
      ]}
    >
      {/* faint top highlight — only visible in dark mode (transparent in light) */}
      <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space[4],
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
