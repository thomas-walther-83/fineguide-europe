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
};

const FINE_COLUMNS = 'id, country_code, category, description, amount, currency, points';

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

/**
 * Bundled sample fines — mirrors `supabase/seed.sql`.
 * Placeholder values for demo purposes only, NOT legal advice.
 * Every country has an entry for each category so the comparison table lines up.
 */
export const SAMPLE_FINES: Fine[] = [
  // Switzerland (CHF) — no demerit-point system, so points are null.
  { id: 'ch-speeding', country_code: 'ch', category: 'speeding', description: 'Tempo 16–20 km/h zu schnell (innerorts)', amount: 250, currency: 'CHF', points: null },
  { id: 'ch-redlight', country_code: 'ch', category: 'redlight', description: 'Missachten eines Rotlichts', amount: 250, currency: 'CHF', points: null },
  { id: 'ch-phone', country_code: 'ch', category: 'phone', description: 'Telefonieren ohne Freisprechanlage', amount: 100, currency: 'CHF', points: null },
  { id: 'ch-parking', country_code: 'ch', category: 'parking', description: 'Parkieren auf dem Trottoir', amount: 120, currency: 'CHF', points: null },
  { id: 'ch-alcohol', country_code: 'ch', category: 'alcohol', description: 'Fahren mit 0,5–0,79 ‰', amount: 600, currency: 'CHF', points: null },
  { id: 'ch-seatbelt', country_code: 'ch', category: 'seatbelt', description: 'Nicht angegurtet', amount: 60, currency: 'CHF', points: null },

  // Germany (EUR) — points = Punkte in Flensburg.
  { id: 'de-speeding', country_code: 'de', category: 'speeding', description: 'Bis 20 km/h zu schnell (innerorts)', amount: 70, currency: 'EUR', points: 0 },
  { id: 'de-redlight', country_code: 'de', category: 'redlight', description: 'Rote Ampel überfahren', amount: 90, currency: 'EUR', points: 1 },
  { id: 'de-phone', country_code: 'de', category: 'phone', description: 'Handy am Steuer', amount: 100, currency: 'EUR', points: 1 },
  { id: 'de-parking', country_code: 'de', category: 'parking', description: 'Unerlaubtes Parken', amount: 25, currency: 'EUR', points: 0 },
  { id: 'de-alcohol', country_code: 'de', category: 'alcohol', description: '0,5-‰-Grenze (Erstverstoß)', amount: 500, currency: 'EUR', points: 2 },
  { id: 'de-seatbelt', country_code: 'de', category: 'seatbelt', description: 'Nicht angeschnallt', amount: 30, currency: 'EUR', points: 0 },

  // Austria (EUR) — no German-style point system.
  { id: 'at-speeding', country_code: 'at', category: 'speeding', description: 'Bis 30 km/h zu schnell', amount: 45, currency: 'EUR', points: null },
  { id: 'at-redlight', country_code: 'at', category: 'redlight', description: 'Rotlichtmissachtung', amount: 70, currency: 'EUR', points: null },
  { id: 'at-phone', country_code: 'at', category: 'phone', description: 'Handy am Steuer', amount: 100, currency: 'EUR', points: null },
  { id: 'at-parking', country_code: 'at', category: 'parking', description: 'Vorschriftswidriges Parken', amount: 36, currency: 'EUR', points: null },
  { id: 'at-alcohol', country_code: 'at', category: 'alcohol', description: 'Alkohol 0,5–0,79 ‰', amount: 300, currency: 'EUR', points: null },
  { id: 'at-seatbelt', country_code: 'at', category: 'seatbelt', description: 'Gurtpflicht missachtet', amount: 35, currency: 'EUR', points: null },

  // France (EUR) — points = permis à points.
  { id: 'fr-speeding', country_code: 'fr', category: 'speeding', description: 'Excès de vitesse < 20 km/h', amount: 68, currency: 'EUR', points: 1 },
  { id: 'fr-redlight', country_code: 'fr', category: 'redlight', description: 'Non-respect d’un feu rouge', amount: 135, currency: 'EUR', points: 4 },
  { id: 'fr-phone', country_code: 'fr', category: 'phone', description: 'Téléphone tenu en main au volant', amount: 135, currency: 'EUR', points: 3 },
  { id: 'fr-parking', country_code: 'fr', category: 'parking', description: 'Stationnement gênant', amount: 35, currency: 'EUR', points: 0 },
  { id: 'fr-alcohol', country_code: 'fr', category: 'alcohol', description: 'Alcoolémie 0,5–0,8 g/L', amount: 135, currency: 'EUR', points: 6 },
  { id: 'fr-seatbelt', country_code: 'fr', category: 'seatbelt', description: 'Ceinture non bouclée', amount: 135, currency: 'EUR', points: 3 },

  // Italy (EUR) — points = patente a punti.
  { id: 'it-speeding', country_code: 'it', category: 'speeding', description: 'Eccesso di velocità fino a 10 km/h', amount: 42, currency: 'EUR', points: 0 },
  { id: 'it-redlight', country_code: 'it', category: 'redlight', description: 'Passaggio con semaforo rosso', amount: 167, currency: 'EUR', points: 6 },
  { id: 'it-phone', country_code: 'it', category: 'phone', description: 'Uso del cellulare alla guida', amount: 165, currency: 'EUR', points: 5 },
  { id: 'it-parking', country_code: 'it', category: 'parking', description: 'Sosta vietata', amount: 42, currency: 'EUR', points: 0 },
  { id: 'it-alcohol', country_code: 'it', category: 'alcohol', description: 'Tasso alcolemico 0,5–0,8 g/L', amount: 544, currency: 'EUR', points: 10 },
  { id: 'it-seatbelt', country_code: 'it', category: 'seatbelt', description: 'Cintura non allacciata', amount: 83, currency: 'EUR', points: 5 },
];
