import { severityTint, type Theme } from './theme';

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

/** Soft background tint for the given amount's severity bucket. */
export function severityTintFor(theme: Theme, amount: number, maxRef: number): string {
  return severityTint(theme, severityForAmount(amount, maxRef));
}

/**
 * Fraction (0..1) of the reference max an amount represents — used to size the
 * thin severity bars that encode magnitude visually. Clamped and floored so an
 * existing fine always shows at least a sliver.
 */
export function severityRatio(amount: number, maxRef: number): number {
  if (maxRef <= 0 || amount <= 0) return 0;
  return Math.max(0.08, Math.min(1, amount / maxRef));
}
