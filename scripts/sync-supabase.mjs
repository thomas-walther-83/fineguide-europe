// Upserts the canonical dataset (data/fines.json) into Supabase.
// Runs in CI only — uses the SERVICE ROLE key, which must NEVER ship in the app.
//
// Env:
//   SUPABASE_URL                 your project URL
//   SUPABASE_SERVICE_ROLE_KEY    service_role key (GitHub Actions secret)
//
// Usage: node scripts/sync-supabase.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — nothing to sync.');
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const fines = JSON.parse(readFileSync(join(here, '..', 'data', 'fines.json'), 'utf8'));

// Drop the local string id so Postgres generates/keeps the uuid primary key;
// rows are matched on the (country_code, description) unique key instead.
const rows = fines.map(({ id, ...rest }) => rest);

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const { error } = await supabase
  .from('fines')
  .upsert(rows, { onConflict: 'country_code,description' });

if (error) {
  console.error('Sync failed:', error.message);
  process.exit(1);
}

console.log(`✓ Synced ${rows.length} fines to Supabase.`);
