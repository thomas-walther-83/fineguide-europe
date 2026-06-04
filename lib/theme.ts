import { Platform, useColorScheme, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens (see docs/design-system.md). Every token has a light and dark
 * value; components read them via useTheme() so the whole app supports dark mode.
 */
export type Theme = {
  mode: 'light' | 'dark';
  brand: { primary: string; primaryPressed: string; onPrimary: string };
  accent: { amber: string; amberSoft: string };
  severity: { low: string; mid: string; high: string };
  bg: { canvas: string; surface: string; surfaceAlt: string };
  border: { subtle: string };
  text: { primary: string; secondary: string; tertiary: string };
};

const light: Theme = {
  mode: 'light',
  brand: { primary: '#1B5FCC', primaryPressed: '#1748A0', onPrimary: '#FFFFFF' },
  accent: { amber: '#F5A524', amberSoft: 'rgba(245,165,36,0.16)' },
  severity: { low: '#1FA971', mid: '#E08600', high: '#E5484D' },
  bg: { canvas: '#F7F8FA', surface: '#FFFFFF', surfaceAlt: '#EFF2F6' },
  border: { subtle: '#E3E8EE' },
  text: { primary: '#0B1B2B', secondary: '#5A6776', tertiary: '#8A97A6' },
};

const dark: Theme = {
  mode: 'dark',
  brand: { primary: '#5B8DEF', primaryPressed: '#3F73D6', onPrimary: '#0B1B2B' },
  accent: { amber: '#F7B955', amberSoft: 'rgba(247,185,85,0.16)' },
  severity: { low: '#2FBF86', mid: '#F7B955', high: '#F16A6F' },
  bg: { canvas: '#0E1620', surface: '#16212E', surfaceAlt: '#1E2B3A' },
  border: { subtle: '#26323F' },
  text: { primary: '#F2F5F9', secondary: '#9FB0C0', tertiary: '#6B7B8C' },
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/* ------------------------------------------------------------------ *
 * Additive design tokens (per docs/design-system.md §3–4). These do not
 * depend on light/dark mode and are safe to use as raw constants. The
 * existing `Theme` tokens above are unchanged.
 * ------------------------------------------------------------------ */

/** 4-pt spacing scale. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
} as const;

/** Corner radii. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

/** Press-feedback scale used for tappable cards/rows/buttons. */
export const PRESS_SCALE = 0.98;

/**
 * Typography scale (docs/design-system.md §4). Amounts use tabular figures so
 * numeric columns align. Spread these into a Text style.
 */
export const type = {
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
  },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' as TextStyle['fontWeight'] },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as TextStyle['fontWeight'] },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as TextStyle['fontWeight'] },
  amount: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800' as TextStyle['fontWeight'],
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as TextStyle['fontWeight'] },
} as const;

/**
 * Elevation. Light mode uses soft shadows; dark mode relies on borders and
 * skips shadows (per the design system). Spread the result into a View style.
 */
export function elevation(theme: Theme, level: 'card' | 'raised' = 'card'): ViewStyle {
  if (theme.mode === 'dark') return {};
  const card: ViewStyle = {
    shadowColor: '#0B1B2B',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    ...Platform.select({ android: { elevation: 2 }, default: {} }),
  };
  const raised: ViewStyle = {
    shadowColor: '#0B1B2B',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    ...Platform.select({ android: { elevation: 6 }, default: {} }),
  };
  return level === 'raised' ? raised : card;
}
