import { Platform, useColorScheme, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens — "Premium Data" aesthetic (inspired by Apple Design Award
 * data apps like Flighty). Every token has a light and dark value; components
 * read them via useTheme() so the whole app supports system light + dark.
 *
 * Dark is the premium star: a deep near-black navy canvas, layered elevated
 * surfaces, hairline borders + a faint top highlight instead of shadows.
 */
export type Theme = {
  mode: 'light' | 'dark';
  brand: { primary: string; primaryPressed: string; onPrimary: string };
  accent: { amber: string; amberSoft: string };
  /** Severity ramp green→amber→red plus soft tints for bars/backgrounds. */
  severity: {
    low: string;
    mid: string;
    high: string;
    lowSoft: string;
    midSoft: string;
    highSoft: string;
  };
  bg: { canvas: string; surface: string; surfaceAlt: string; elevated: string };
  border: { subtle: string; strong: string };
  /** Faint top highlight used on dark elevated surfaces (premium sheen). */
  highlight: string;
  text: { primary: string; secondary: string; tertiary: string };
};

const light: Theme = {
  mode: 'light',
  brand: { primary: '#2563E6', primaryPressed: '#1B4FCC', onPrimary: '#FFFFFF' },
  accent: { amber: '#E08600', amberSoft: 'rgba(245,165,36,0.16)' },
  severity: {
    low: '#0E9F6E',
    mid: '#D97706',
    high: '#E0353B',
    lowSoft: 'rgba(14,159,110,0.14)',
    midSoft: 'rgba(217,119,6,0.14)',
    highSoft: 'rgba(224,53,59,0.14)',
  },
  // Softer, calmer light mode: a cool grey canvas (less glare) with white cards
  // for clearer canvas↔surface separation and more contrast.
  bg: { canvas: '#E7ECF3', surface: '#FFFFFF', surfaceAlt: '#EDF1F7', elevated: '#FFFFFF' },
  border: { subtle: '#DCE3EC', strong: '#C7D1DD' },
  highlight: 'transparent',
  text: { primary: '#0B1220', secondary: '#56657A', tertiary: '#8A97A9' },
};

const dark: Theme = {
  mode: 'dark',
  brand: { primary: '#5B8DEF', primaryPressed: '#4C7BE0', onPrimary: '#06101F' },
  accent: { amber: '#F7B955', amberSoft: 'rgba(247,185,85,0.18)' },
  severity: {
    low: '#34D399',
    mid: '#FBBF55',
    high: '#FB7185',
    lowSoft: 'rgba(52,211,153,0.16)',
    midSoft: 'rgba(251,191,85,0.16)',
    highSoft: 'rgba(251,113,133,0.16)',
  },
  // Softer navy canvas (less inky), clearly layered elevated surfaces.
  bg: { canvas: '#151D2C', surface: '#1F2A3E', surfaceAlt: '#28344B', elevated: '#232F45' },
  border: { subtle: '#2E3C54', strong: '#3C4E6A' },
  highlight: 'rgba(255,255,255,0.07)',
  text: { primary: '#F3F6FB', secondary: '#A4B4C8', tertiary: '#6C7E94' },
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/* ------------------------------------------------------------------ *
 * Additive design tokens. These do not depend on light/dark mode and are
 * safe to use as raw constants.
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
  12: 48,
} as const;

/**
 * Layout rhythm. One horizontal inset for all screen content, one top gap under
 * the shared header, and one vertical gap between content blocks. Screens read
 * these instead of inventing their own paddings so every view lines up.
 */
export const layout = {
  /** Horizontal content inset — the single padding used on every screen. */
  screenX: space[4],
  /** Gap between the header and the first content block. */
  topGap: space[4],
  /** Vertical rhythm between stacked content blocks (selectors, cards). */
  gap: space[4],
  /** Bottom padding so content clears the tab bar / safe area. */
  bottomGap: space[10],
} as const;

/** Corner radii — generous, continuous-feeling rounding. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
} as const;

/** Press-feedback scale used for tappable cards/rows/buttons. */
export const PRESS_SCALE = 0.97;

/* ------------------------------------------------------------------ *
 * Typography. A characterful display family (Sora) for titles + amounts and
 * a clean body family (Inter). Font families are loaded in app/_layout.tsx;
 * if loading fails the platform default is used (names degrade gracefully).
 * ------------------------------------------------------------------ */

export const fonts = {
  display: 'Sora_700Bold',
  displaySemi: 'Sora_600SemiBold',
  displayExtra: 'Sora_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Tabular figures so numeric columns align — used on every amount. */
export const TABULAR = ['tabular-nums'] as TextStyle['fontVariant'];

/**
 * Typography scale. Amounts use tabular figures. Spread these into a Text
 * style. `fontFamily` carries the weight, so we keep `fontWeight` as a hint
 * for the platform-default fallback before fonts finish loading.
 */
export const type = {
  hero: {
    fontFamily: fonts.displayExtra,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -0.8,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.6,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyStrong: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  amount: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800' as TextStyle['fontWeight'],
    fontVariant: TABULAR,
  },
  /** The hero amount on the calculator — big, bold, tabular. */
  amountHero: {
    fontFamily: fonts.displayExtra,
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -1,
    fontVariant: TABULAR,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.6,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  captionStrong: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
} as const;

/**
 * Elevation. Light mode uses soft shadows; dark mode relies on borders + a
 * faint top highlight (applied separately via the `highlight` token) plus a
 * subtle ambient shadow for depth. Spread the result into a View style.
 */
export function elevation(theme: Theme, level: 'card' | 'raised' = 'card'): ViewStyle {
  if (theme.mode === 'dark') {
    return {
      shadowColor: '#000000',
      shadowOpacity: level === 'raised' ? 0.45 : 0.3,
      shadowOffset: { width: 0, height: level === 'raised' ? 10 : 4 },
      shadowRadius: level === 'raised' ? 24 : 12,
      ...Platform.select({ android: { elevation: level === 'raised' ? 6 : 2 }, default: {} }),
    };
  }
  const card: ViewStyle = {
    shadowColor: '#0B1220',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    ...Platform.select({ android: { elevation: 2 }, default: {} }),
  };
  const raised: ViewStyle = {
    shadowColor: '#0B1220',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 22,
    ...Platform.select({ android: { elevation: 8 }, default: {} }),
  };
  return level === 'raised' ? raised : card;
}

/** Soft severity tint matching a severity color key. */
export function severityTint(theme: Theme, key: 'low' | 'mid' | 'high'): string {
  return theme.severity[`${key}Soft` as const];
}
