import { StyleSheet, Text, type TextStyle } from 'react-native';

import { space, type, useTheme } from '@/lib/theme';

type Props = {
  children: string;
  /** Extra style (e.g. a custom top margin where rhythm differs). */
  style?: TextStyle;
};

/**
 * The one disclaimer treatment used app-wide (Compare / Calc / Trip / Detail):
 * a centred `type.caption` line in `text.tertiary`. Keeping it in one place
 * means every "estimates only / not legal advice" footer reads identically.
 */
export function Disclaimer({ children, style }: Props) {
  const theme = useTheme();
  return (
    <Text style={[type.caption, styles.text, { color: theme.text.tertiary }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { textAlign: 'center', marginTop: space[4] },
});
