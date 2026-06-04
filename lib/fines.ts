import sampleData from '@/data/fines.json';

import type { CategoryId } from './categories';
import { getItem, setItem } from './storage';
import { getSupabase, isSupabaseConfigured } from './supabase';

/**
 * A single traffic fine ("Verkehrsbusse").
 * NOTE: the text column is called `description` — never `desc`
 * (reserved word in PostgreSQL).
 */
export type Fine = {
  id: string;
  country_code: string;
  category: CategoryId;
  description: string;
  amount: number;
  currency: string;
  points: number | null;
  /** Link to the official source the figure is based on. */
  source_url: string | null;
  /** ISO date the figure was last verified (e.g. "2026-06-01"). */
  updated_at: string | null;
};

const FINE_COLUMNS =
  'id, country_code, category, description, amount, currency, points, source_url, updated_at';

/**
 * Bundled sample fines — the canonical dataset lives in `data/fines.json`
 * (shared with the Supabase sync script). Placeholder values for demo purposes,
 * NOT legal advice. Every country has an entry for each category so the
 * comparison table lines up.
 */
export const SAMPLE_FINES = sampleData as unknown as Fine[];

/**
 * Offline data cache. When Supabase is configured we persist the last
 * successful fetch locally (per query) so the app keeps working offline; on a
 * network/Supabase error we serve the cached copy, falling back to the bundled
 * SAMPLE_FINES. We never throw a network error to the UI when usable data
 * exists. When Supabase is NOT configured the bundled data is already used and
 * nothing is cached.
 */
const CACHE_KEY_ALL = 'fineguide.cache.fines.all.v1';
const cacheKeyCountry = (countryCode: string) => `fineguide.cache.fines.${countryCode}.v1`;

/** Fines plus whether they came from the offline cache/bundle (live fetch failed). */
export type FinesResult = { data: Fine[]; offline: boolean };

const byCountry = (countryCode: string) =>
  SAMPLE_FINES.filter((f) => f.country_code === countryCode).sort((a, b) => a.amount - b.amount);

/**
 * Load every fine with offline metadata. Live Supabase fetch when configured;
 * on failure serves the cached copy, then the bundled sample data — never
 * throwing a network error to the UI when usable data exists.
 */
export async function fetchAllFinesResult(): Promise<FinesResult> {
  if (!isSupabaseConfigured) {
    return { data: [...SAMPLE_FINES], offline: false };
  }

  try {
    const { data, error } = await getSupabase()
      .from('fines')
      .select(FINE_COLUMNS)
      .order('country_code', { ascending: true });

    if (error) throw error;
    const fines = (data ?? []) as Fine[];
    void setItem(CACHE_KEY_ALL, fines);
    return { data: fines, offline: false };
  } catch (error) {
    console.warn('[fines] fetchAllFines failed, serving cached/bundled data:', error);
    const cached = await getItem<Fine[] | null>(CACHE_KEY_ALL, null);
    if (cached && cached.length > 0) return { data: cached, offline: true };
    return { data: [...SAMPLE_FINES], offline: true };
  }
}

/** Load the fines for one country with offline metadata, sorted by amount. */
export async function fetchFinesByCountryResult(countryCode: string): Promise<FinesResult> {
  if (!isSupabaseConfigured) {
    return { data: byCountry(countryCode), offline: false };
  }

  try {
    const { data, error } = await getSupabase()
      .from('fines')
      .select(FINE_COLUMNS)
      .eq('country_code', countryCode)
      .order('amount', { ascending: true });

    if (error) throw error;
    const fines = (data ?? []) as Fine[];
    void setItem(cacheKeyCountry(countryCode), fines);
    return { data: fines, offline: false };
  } catch (error) {
    console.warn(
      `[fines] fetchFinesByCountry(${countryCode}) failed, serving cached/bundled data:`,
      error
    );
    const cached = await getItem<Fine[] | null>(cacheKeyCountry(countryCode), null);
    if (cached && cached.length > 0) return { data: cached, offline: true };
    return { data: byCountry(countryCode), offline: true };
  }
}

/** Load every fine (Supabase when configured, otherwise bundled sample data). */
export async function fetchAllFines(): Promise<Fine[]> {
  return (await fetchAllFinesResult()).data;
}

/** Load the fines for one country, sorted by amount. */
export async function fetchFinesByCountry(countryCode: string): Promise<Fine[]> {
  return (await fetchFinesByCountryResult(countryCode)).data;
}
