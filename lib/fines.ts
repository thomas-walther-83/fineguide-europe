import { getSupabase, isSupabaseConfigured } from './supabase';

/**
 * A single traffic fine ("Verkehrsbusse").
 * NOTE: the text column is called `description` — never `desc`
 * (reserved word in PostgreSQL).
 */
export type Fine = {
  id: string;
  country_code: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  points: number | null;
};

const FINE_COLUMNS = 'id, country_code, category, description, amount, currency, points';

/**
 * Load the fines for one country.
 * Uses Supabase when configured, otherwise falls back to bundled sample data
 * so the app stays runnable during development.
 */
export async function fetchFinesByCountry(countryCode: string): Promise<Fine[]> {
  if (!isSupabaseConfigured) {
    return sampleFinesByCountry(countryCode);
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

function sampleFinesByCountry(countryCode: string): Fine[] {
  return SAMPLE_FINES.filter((fine) => fine.country_code === countryCode).sort(
    (a, b) => a.amount - b.amount
  );
}

/**
 * Bundled sample fines — mirrors `supabase/seed.sql`.
 * Placeholder values for demo purposes only, NOT legal advice.
 */
export const SAMPLE_FINES: Fine[] = [
  // Switzerland (CHF)
  { id: 'ch-1', country_code: 'ch', category: 'speeding', description: 'Tempo 16–20 km/h zu schnell (innerorts)', amount: 250, currency: 'CHF', points: null },
  { id: 'ch-2', country_code: 'ch', category: 'redlight', description: 'Missachten eines Rotlichts', amount: 250, currency: 'CHF', points: null },
  { id: 'ch-3', country_code: 'ch', category: 'phone', description: 'Telefonieren ohne Freisprechanlage', amount: 100, currency: 'CHF', points: null },
  { id: 'ch-4', country_code: 'ch', category: 'parking', description: 'Parkieren auf dem Trottoir', amount: 120, currency: 'CHF', points: null },

  // Germany (EUR)
  { id: 'de-1', country_code: 'de', category: 'speeding', description: 'Bis 20 km/h zu schnell (innerorts)', amount: 70, currency: 'EUR', points: 0 },
  { id: 'de-2', country_code: 'de', category: 'phone', description: 'Handy am Steuer', amount: 100, currency: 'EUR', points: 1 },
  { id: 'de-3', country_code: 'de', category: 'redlight', description: 'Rote Ampel überfahren', amount: 90, currency: 'EUR', points: 1 },
  { id: 'de-4', country_code: 'de', category: 'parking', description: 'Unerlaubtes Parken', amount: 25, currency: 'EUR', points: 0 },

  // Austria (EUR)
  { id: 'at-1', country_code: 'at', category: 'speeding', description: 'Bis 30 km/h zu schnell', amount: 45, currency: 'EUR', points: null },
  { id: 'at-2', country_code: 'at', category: 'phone', description: 'Handy am Steuer', amount: 100, currency: 'EUR', points: null },
  { id: 'at-3', country_code: 'at', category: 'alcohol', description: 'Alkohol am Steuer (0,5–0,8 ‰)', amount: 300, currency: 'EUR', points: null },

  // France (EUR)
  { id: 'fr-1', country_code: 'fr', category: 'speeding', description: 'Excès de vitesse < 20 km/h', amount: 68, currency: 'EUR', points: 1 },
  { id: 'fr-2', country_code: 'fr', category: 'phone', description: 'Téléphone tenu en main au volant', amount: 135, currency: 'EUR', points: 3 },
  { id: 'fr-3', country_code: 'fr', category: 'redlight', description: 'Non-respect d’un feu rouge', amount: 135, currency: 'EUR', points: 4 },

  // Italy (EUR)
  { id: 'it-1', country_code: 'it', category: 'speeding', description: 'Eccesso di velocità fino a 10 km/h', amount: 42, currency: 'EUR', points: null },
  { id: 'it-2', country_code: 'it', category: 'phone', description: 'Uso del cellulare alla guida', amount: 165, currency: 'EUR', points: null },
  { id: 'it-3', country_code: 'it', category: 'redlight', description: 'Passaggio con semaforo rosso', amount: 167, currency: 'EUR', points: null },
];
