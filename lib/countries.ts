/**
 * Placeholder list of countries shown on the home screen.
 * `nameKey` references a translation key in the locales files.
 */
export type Country = {
  id: string;
  flag: string;
  nameKey: string;
  currency: string;
  /** Whether the country uses a demerit-point system. */
  hasPoints: boolean;
};

export const COUNTRIES: Country[] = [
  { id: 'ch', flag: '🇨🇭', nameKey: 'countries.ch', currency: 'CHF', hasPoints: false },
  { id: 'de', flag: '🇩🇪', nameKey: 'countries.de', currency: 'EUR', hasPoints: true },
  { id: 'at', flag: '🇦🇹', nameKey: 'countries.at', currency: 'EUR', hasPoints: false },
  { id: 'fr', flag: '🇫🇷', nameKey: 'countries.fr', currency: 'EUR', hasPoints: true },
  { id: 'it', flag: '🇮🇹', nameKey: 'countries.it', currency: 'EUR', hasPoints: true },
];

export function findCountry(id: string): Country | undefined {
  return COUNTRIES.find((c) => c.id === id);
}
