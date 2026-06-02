# FineGuide Europe

A cross-platform app (Web, iOS, Android) that shows traffic fines
("Verkehrsbussen") in European countries — built from a single codebase with
**Expo**, **TypeScript** and **react-native-web**.

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
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your environment file and fill in your Supabase values:
   ```bash
   cp .env.example .env
   ```
   > Only use the **anon / publishable** key — never the `service_role` key.
3. Start the app:
   ```bash
   npm run web      # browser
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   ```

## Useful scripts
| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run web` | Run the web build |
| `npm run typecheck` | Run the TypeScript compiler |

See [`CLAUDE.md`](./CLAUDE.md) for project context and development rules.
