# CLAUDE.md — FineGuide Europe

## Project context
FineGuide Europe is a sellable cross-platform app that shows traffic fines
("Verkehrsbussen") in European countries. A single codebase targets Web, iOS
and Android.

## Stack
- **Expo** (managed) + **TypeScript**
- **react-native-web** for the web target
- **Expo Router** for navigation (file-based, in `app/`)
- **i18next** + **react-i18next** + **expo-localization** for i18n (DE/EN/FR/IT)
- **Supabase** (`@supabase/supabase-js`) as the backend

## Folder structure
```
app/        Expo Router screens (file-based routing)
components/ Reusable UI components
lib/        Shared logic (supabase client, i18n setup, data)
locales/    Translation files: de, en, fr, it
```

## Project rules (IMPORTANT)
1. **Never use `desc` as a column name** — it is a reserved word in
   PostgreSQL. Use `description` instead.
2. **Never put the `service_role` key in the frontend.** The client app may
   only ever use the **anon / publishable** key.
3. **Never hardcode API keys.** Always read them from environment variables
   and document them in `.env.example`. Client-exposed vars must be prefixed
   `EXPO_PUBLIC_`.
4. **Supabase upserts:** send the header `Prefer: resolution=merge-duplicates`
   together with an `on_conflict` target so duplicates merge instead of error.
   With `supabase-js`: `supabase.from('table').upsert(rows, { onConflict: 'col' })`.

## Workflow
- After pushing changes to a feature branch, **always open a pull request
  automatically** — do not ask first.
- Once CI on the PR is green, **merge it into `main` right away** (squash) —
  do not ask first. If CI is red, fix it first; never merge a failing PR.

## Commands
- `npm run web` — run in the browser
- `npm run ios` / `npm run android` — run on a device/simulator
- `npm run typecheck` — TypeScript check
