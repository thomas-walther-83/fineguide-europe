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

// Accept the bare project URL, and tolerate a pasted "/rest/v1" path or
// trailing slashes (supabase-js appends the path itself).
const url = process.env.SUPABASE_URL?.trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
  .replace(/\/+$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — nothing to sync.');
  process.exit(1);
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  console.error(
    `SUPABASE_URL looks wrong: "${url}". It must be exactly https://<project-ref>.supabase.co ` +
      '(no trailing slash, no path). Find it under Project Settings → Data API → Project URL.'
  );
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const fines = JSON.parse(readFileSync(join(here, '..', 'data', 'fines.json'), 'utf8'));

// Only send columns that exist in the table, so extra/new JSON fields can't
// break the upsert. Rows are matched on the (country_code, description) unique
// key; Postgres keeps/generates the uuid primary key itself.
const COLUMNS = [
  'country_code',
  'category',
  'description',
  'amount',
  'currency',
  'points',
  'source_url',
  'updated_at',
];
const rows = fines.map((f) => Object.fromEntries(COLUMNS.map((c) => [c, f[c] ?? null])));

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// Full replace: the dataset is the single source of truth, so clear the table
// first to drop any renamed/removed rows, then insert the current dataset.
const cleared = await supabase.from('fines').delete().gte('amount', 0);
if (cleared.error) {
  console.error('Sync failed (clearing table):', cleared.error.message);
  process.exit(1);
}

const { error } = await supabase.from('fines').insert(rows);
if (error) {
  console.error('Sync failed (inserting rows):', error.message);
  process.exit(1);
}

console.log(`✓ Synced ${rows.length} fines to Supabase (full replace).`);
