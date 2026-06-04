import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { space, type, useTheme } from '@/lib/theme';

type Props = {
  title: string;
  /** Optional one–two line subtitle shown under the title. */
  subtitle?: string;
  /** Optional trailing control (e.g. the language switcher) aligned right. */
  right?: ReactNode;
};

/**
 * Consistent inline screen header used at the top of every tab screen, so all
 * views share the same title size and a short subtitle.
 */
export function ScreenHeader({ title, subtitle, right }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[type.display, styles.title, { color: theme.text.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {right}
      </View>
      {subtitle ? (
        <Text style={[type.caption, styles.subtitle, { color: theme.text.secondary }]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space[4], paddingTop: space[2], paddingBottom: space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  title: { flex: 1 },
  subtitle: { marginTop: space[1] },
});
