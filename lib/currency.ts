/**
 * Lightweight, bundled currency conversion for orientation only.
 * The rate is approximate and illustrative — not a live FX feed.
 */
export type Currency = 'CHF' | 'EUR';

/** 1 CHF ≈ this many EUR (illustrative). */
export const EUR_PER_CHF = 1.05;

export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  if (from === 'CHF' && to === 'EUR') return amount * EUR_PER_CHF;
  if (from === 'EUR' && to === 'CHF') return amount / EUR_PER_CHF;
  return amount;
}

/** Format a converted amount; prefixes "≈" when the value was converted. */
export function formatConverted(amount: number, from: Currency, to: Currency): string {
  const value = Math.round(convert(amount, from, to));
  const prefix = from === to ? '' : '≈ ';
  return `${prefix}${to} ${value}`;
}
