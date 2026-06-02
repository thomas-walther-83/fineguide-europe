/**
 * Placeholder list of countries shown on the home screen.
 * `nameKey` references a translation key in the locales files.
 */
export type Country = {
  id: string;
  flag: string;
  nameKey: string;
};

export const COUNTRIES: Country[] = [
  { id: 'ch', flag: '🇨🇭', nameKey: 'countries.ch' },
  { id: 'de', flag: '🇩🇪', nameKey: 'countries.de' },
  { id: 'at', flag: '🇦🇹', nameKey: 'countries.at' },
  { id: 'fr', flag: '🇫🇷', nameKey: 'countries.fr' },
  { id: 'it', flag: '🇮🇹', nameKey: 'countries.it' },
];
