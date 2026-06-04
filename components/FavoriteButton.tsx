import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { useFavorites } from '@/lib/favorites';
import { PRESS_SCALE, radius, useTheme } from '@/lib/theme';

type Props = {
  /** Country id to toggle. */
  id: string;
  size?: number;
  style?: ViewStyle;
};

/**
 * Star toggle for marking a country as favorite. Self-contained: reads/writes
 * the favorites store. Has a ≥44pt hit target and stops event propagation so it
 * never triggers a surrounding Link/row navigation.
 */
export function FavoriteButton({ id, size = 22, style }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={active ? t('favorites.remove') : t('favorites.add')}
      hitSlop={8}
      onPress={(e) => {
        // Prevent the parent Link/Pressable (row) from navigating.
        e.stopPropagation?.();
        toggle(id);
      }}
      style={({ pressed }) => [
        styles.button,
        { transform: [{ scale: pressed ? PRESS_SCALE : 1 }] },
        style,
      ]}
    >
      <Icon
        name={active ? 'star-filled' : 'star'}
        size={size}
        color={active ? theme.accent.amber : theme.text.tertiary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
