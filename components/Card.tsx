import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { elevation, radius, space, useTheme } from '@/lib/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Visual weight: `flat` skips the shadow (e.g. nested surfaces). */
  variant?: 'card' | 'raised' | 'flat';
};

/** Surface container: rounded, hairline border, soft shadow in light mode. */
export function Card({ children, style, variant = 'card' }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.subtle,
        },
        variant !== 'flat' && elevation(theme, variant === 'raised' ? 'raised' : 'card'),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space[4],
  },
});
