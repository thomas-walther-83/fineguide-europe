import type { Theme } from './theme';

export type Severity = 'low' | 'mid' | 'high';

/**
 * Map a fine amount to a severity bucket relative to a reference maximum
 * (e.g. the largest amount currently shown). Powers the green→amber→red
 * colour-coding that lets users scan severity at a glance.
 */
export function severityForAmount(amount: number, maxRef: number): Severity {
  if (maxRef <= 0) return 'low';
  const ratio = amount / maxRef;
  if (ratio < 0.34) return 'low';
  if (ratio < 0.67) return 'mid';
  return 'high';
}

export function severityColor(theme: Theme, amount: number, maxRef: number): string {
  return theme.severity[severityForAmount(amount, maxRef)];
}
