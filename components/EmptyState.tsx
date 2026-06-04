import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { radius, space, type, useTheme } from '@/lib/theme';

type Props = {
  /** Short headline (already-translated string). */
  title: string;
  /** Optional supporting line (already-translated string). */
  subtitle?: string;
  /** Icon shown in the circular badge. */
  icon?: IconName;
};

/**
 * Centered empty / hint state with a soft circular icon badge. Used for
 * search hints and no-result states (copy comes from existing i18n keys).
 */
export function EmptyState({ title, subtitle, icon = 'search' }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.bg.surfaceAlt, borderColor: theme.border.subtle },
        ]}
      >
        <Icon name={icon} size={30} color={theme.text.tertiary} />
      </View>
      <Text style={[type.h2, styles.title, { color: theme.text.primary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[type.body, styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[6],
    paddingTop: space[10],
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[4],
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: space[2] },
});
