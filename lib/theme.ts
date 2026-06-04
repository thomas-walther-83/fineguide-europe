import { useColorScheme } from 'react-native';

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
