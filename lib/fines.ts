import sampleData from '@/data/fines.json';

import type { CategoryId } from './categories';
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

/** Load every fine (Supabase when configured, otherwise bundled sample data). */
export async function fetchAllFines(): Promise<Fine[]> {
  if (!isSupabaseConfigured) {
    return [...SAMPLE_FINES];
  }

  const { data, error } = await getSupabase()
    .from('fines')
    .select(FINE_COLUMNS)
    .order('country_code', { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as Fine[];
}

/** Load the fines for one country, sorted by amount. */
export async function fetchFinesByCountry(countryCode: string): Promise<Fine[]> {
  if (!isSupabaseConfigured) {
    return SAMPLE_FINES.filter((f) => f.country_code === countryCode).sort(
      (a, b) => a.amount - b.amount
    );
  }

  const { data, error } = await getSupabase()
    .from('fines')
    .select(FINE_COLUMNS)
    .eq('country_code', countryCode)
    .order('amount', { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as Fine[];
}
