# Supabase backend setup

The app works offline on bundled sample data (`data/fines.json`). To serve data
from Supabase — editable without an app release and kept in sync automatically —
do the one-time setup below.

> **Key rules** (see `CLAUDE.md`): the app only ever uses the **anon /
> publishable** key. The **service_role** key is used *only* by CI (the sync
> workflow) and must never be committed or shipped in the app.

## 1. Create the project & schema
1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migrations in order:
   - `supabase/migrations/0001_create_fines_table.sql`
   - `supabase/migrations/0002_add_source_columns.sql`

## 2. Get your keys
From **Project Settings → API**:
- **Project URL** (e.g. `https://xxxx.supabase.co`)
- **anon / publishable** key
- **service_role** key (keep secret)

## 3. Add them to GitHub
Repo → **Settings → Secrets and variables → Actions**:

**Variables** (public, baked into the web build):
| Name | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | your Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | your anon/publishable key |

**Secrets** (private, used only by the sync job):
| Name | Value |
|---|---|
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |

## 4. Populate & go live
1. Run **Actions → “Sync fine data to Supabase” → Run workflow** to upsert the
   dataset (`data/fines.json`) into the `fines` table.
2. Re-run **Actions → “Deploy web to GitHub Pages”** (or push any commit). The
   live app now reads from Supabase instead of the bundled sample.

For local development, copy `.env.example` to `.env` and fill in the two
`EXPO_PUBLIC_` values.

## Automatic refresh
The **“Sync fine data to Supabase”** workflow runs:
- **quarterly** (1 Jan / 1 Apr / 1 Jul / 1 Oct), and
- whenever `data/fines.json` changes on `main`, and
- on demand (Run workflow).

So the maintained dataset in the repo is the single source of truth, and the
database is kept in sync automatically. Updating the figures is done by editing
`data/fines.json` (with `source_url` + `updated_at` per row) — see the research
process in `docs/feature-roadmap.md`.
