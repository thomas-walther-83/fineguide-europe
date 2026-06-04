import mobilityData from '@/data/mobility.json';

/**
 * "Mobility costs" — the *other* costs of driving in a country besides fines:
 * the motorway vignette, road tolls, and low-emission / restricted zones.
 *
 * Bundled-only dataset (no Supabase needed): the canonical data lives in
 * `data/mobility.json`, keyed by country id. Values are illustrative
 * orientation figures, NOT legal advice — every entry carries a `source_url`
 * and `updated_at`.
 */

/** Supported note languages — must match the i18n locales (de/en/fr/it). */
export type MobilityLang = 'de' | 'en' | 'fr' | 'it';

/** A field whose explanatory note is provided per language. */
type LocalizedNote = {
  note_de: string;
  note_en: string;
  note_fr: string;
  note_it: string;
};

export type Vignette = LocalizedNote & {
  /** Whether a national vignette is required to use motorways. */
  required: boolean;
  /** Annual price, or null when there is no national vignette. */
  price: number | null;
  currency: string;
  /** Billing period the price refers to (currently always "year"). */
  period: 'year';
};

export type Toll = LocalizedNote & {
  /** Toll system: none, distance-based, or vignette plus special sections. */
  system: 'none' | 'distance' | 'vignette-plus-special';
};

export type LowEmissionZones = LocalizedNote & {
  /** Scheme name (e.g. "Umweltzone", "Crit'Air / ZFE", "ZTL", "IG-L", "none"). */
  scheme: string;
};

export type Mobility = {
  country_code: string;
  vignette: Vignette;
  toll: Toll;
  lowEmissionZones: LowEmissionZones;
  /** Link to the official / reference source the figures are based on. */
  source_url: string;
  /** ISO date the figures were last verified (e.g. "2026-06-04"). */
  updated_at: string;
};

const MOBILITY = mobilityData as unknown as Record<string, Mobility>;

/** Mobility costs for one country, or undefined when none are bundled. */
export function getMobility(countryCode: string): Mobility | undefined {
  return MOBILITY[countryCode];
}

/** Pick the note for the active language, falling back to English. */
export function localizedNote(field: LocalizedNote, lang: string): string {
  const key = `note_${normalizeLang(lang)}` as keyof LocalizedNote;
  return field[key] ?? field.note_en;
}

/** Map an i18next language tag (e.g. "de-CH") to a supported note language. */
function normalizeLang(lang: string): MobilityLang {
  const base = lang.toLowerCase().split('-')[0];
  return base === 'de' || base === 'fr' || base === 'it' ? base : 'en';
}
