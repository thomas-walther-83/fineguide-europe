import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { elevation, radius, space, useTheme } from '@/lib/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Visual weight: `flat` skips the shadow (e.g. nested surfaces). */
  variant?: 'card' | 'raised' | 'flat';
  /**
   * Drop the default `space[4]` inset — for cards that manage their own
   * internal padding (tables, list rows with full-bleed dividers/accents).
   */
  noPadding?: boolean;
};

/**
 * Surface container and the single source of truth for the app's card look:
 * one corner radius, one hairline border, soft shadow in light mode and a faint
 * top highlight (premium sheen) in dark mode. Every elevated surface in the app
 * (map card, result card, table, trip rows, search rows, hero) routes through
 * this so corners, borders and elevation match everywhere.
 */
export function Card({ children, style, variant = 'card', noPadding = false }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        !noPadding && styles.padded,
        {
          backgroundColor: variant === 'flat' ? theme.bg.surfaceAlt : theme.bg.surface,
          borderColor: theme.border.subtle,
        },
        variant !== 'flat' && elevation(theme, variant === 'raised' ? 'raised' : 'card'),
        style,
      ]}
    >
      {/* faint top highlight — only visible in dark mode (transparent in light) */}
      <CardSheen />
      {children}
    </View>
  );
}

/**
 * The premium top-highlight line. Exported so the few cards that must stay a
 * custom Pressable (tappable search rows) reproduce the exact same sheen
 * instead of hand-rolling it.
 */
export function CardSheen() {
  const theme = useTheme();
  return <View pointerEvents="none" style={[styles.sheen, { backgroundColor: theme.highlight }]} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  padded: {
    padding: space[4],
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
});
