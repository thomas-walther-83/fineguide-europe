# FineGuide Europe

A cross-platform app (Web, iOS, Android) that shows traffic fines
("Verkehrsbussen") in European countries — built from a single codebase with
**Expo**, **TypeScript** and **react-native-web**.

## 📱 Live web app (install on your phone)
The web build is deployed to GitHub Pages on every push to `main`:

**https://thomas-walther-83.github.io/fineguide-europe/**

To get an app-like icon on your iPhone: open the URL in **Safari** →
**Share** → **Zum Home-Bildschirm**. The app then launches full-screen
(PWA: manifest + icon + standalone display are configured).

> First deploy: the GitHub Actions workflow auto-enables Pages. If Pages is not
> enabled yet, go to **Settings → Pages → Build and deployment → Source:
> GitHub Actions** once.

## Features (scaffold)
- 📱 One codebase for Web + iOS + Android (Expo + react-native-web)
- 🧭 File-based navigation with **Expo Router**
- 🌍 Multi-language ready (DE / EN / FR / IT) via i18next + expo-localization
- 🗄️ Supabase client pre-wired (anon/publishable key via env vars)
- 🏠 Home screen with a placeholder country list
  (Switzerland, Germany, Austria, France, Italy)

## Project structure
```
app/        Screens (Expo Router, file-based routing)
components/ Reusable UI components
lib/        Supabase client, i18n setup, shared data
locales/    Translation files (de, en, fr, it)
supabase/   SQL migrations + seed data
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Create your environment file and fill in your Supabase values:
   ```bash
   cp .env.example .env
   ```
   > Only use the **anon / publishable** key — never the `service_role` key.
   >
   > Without a `.env`, the app runs on **bundled sample data**, so you can try
   > it immediately.
3. Start the app:
   ```bash
   npm run web      # browser
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   ```

## Supabase database
The fines screen reads from a `fines` table. To use real data instead of the
bundled sample:

1. Create a project at [supabase.com](https://supabase.com) and copy its
   **Project URL** and **anon/publishable key** into `.env`.
2. In the Supabase dashboard → **SQL Editor**, run the contents of:
   - [`supabase/migrations/0001_create_fines_table.sql`](./supabase/migrations/0001_create_fines_table.sql)
   - [`supabase/seed.sql`](./supabase/seed.sql)
3. Restart the dev server. The app now queries Supabase automatically.

The table uses Row Level Security with read-only public access, matching the
anon-key-only rule for the client.

## Useful scripts
| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run web` | Run the web build |
| `npm run typecheck` | Run the TypeScript compiler |

See [`CLAUDE.md`](./CLAUDE.md) for project context and development rules.
