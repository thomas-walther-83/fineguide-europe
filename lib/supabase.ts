import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Keys come from environment variables (see .env.example).
// Only the anon / publishable key belongs here — NEVER the service_role key.
// Normalise: trim, drop a pasted "/rest/v1" path and any trailing slash
// (a trailing "/" or path makes Supabase's gateway reject requests with
// "Invalid path specified in request URL"). supabase-js appends the path itself.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
  .replace(/\/+$/, '');
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** True when both Supabase env vars are present, so real queries can run. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

/**
 * Lazily create the Supabase client — only when env vars are configured.
 * Creating it on import (even unused) pulls heavy code into the first render,
 * so callers must guard with `isSupabaseConfigured` first.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      '[supabase] Not configured. Set EXPO_PUBLIC_SUPABASE_URL and ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY (see .env.example).'
    );
  }
  if (!client) {
    // Read-only public data: no auth session to persist.
    client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
