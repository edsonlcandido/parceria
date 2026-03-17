# Parceria Finance - PocketBase + Vue + Tailwind Monorepo

## Project Overview
A financial tracking web application for couples built as a monorepo with:
- **Backend**: PocketBase (Go-based, provides DB, auth, file storage)
- **Landing Page**: Static Vite + TypeScript + Tailwind CSS app
- **Web App**: Vue 3 + Pinia + Vue Router + Tailwind CSS (mobile-first SPA)

## Architecture

```
apps/
  landing/   # Landing page (Vite, port 5000 in dev)
  web/       # Vue 3 web app (Vite, port 5174 in dev)
pocketbase/  # PocketBase binary + data + hooks + migrations
scripts/     # Utility scripts for PocketBase setup and build copy
```

## Development

### Run all services together
```bash
npm run dev
```
This starts:
- PocketBase backend on `localhost:8090`
- Landing page dev server on `0.0.0.0:5000`
- Web app dev server on `0.0.0.0:5174`

The landing page (port 5000) proxies:
- `/app/*` → Web app (port 5174)
- `/api/*` and `/_/*` → PocketBase (port 8090)

### Build for production
```bash
npm run build
```
Builds both frontends and copies them to `pocketbase/pb_public/`. PocketBase then serves everything:
- `/` → Landing page
- `/app/` → Vue web app
- `/_/` → PocketBase admin dashboard

## Configuration
- PocketBase URL configured via `VITE_POCKETBASE_URL` env var (defaults to `http://localhost:8090`)
- PocketBase binary: `pocketbase/pocketbase` (extracted from zip in pocketbase directory)

## Data Model (PocketBase Collections)
- **couples**: id, name, access_token
- **users** (auth): id, name, couple_id (relation → couples, cascade delete), email (optional)
- **accounts**: id, couple_id (relation → couples), user_id (relation → users, nullable), name, type (conta|cartao)
- **transactions**: id, couple_id (relation → couples), account_id (relation → accounts), user_id (relation → users, nullable), amount, description, type (income|expense), date, consolidated
- **recurring_transactions**: id, couple_id (relation → couples, cascade delete), user_id (relation → users, nullable), description, amount, type (income|expense), day (number 1-31, dia do mês)

V1: No login. Access via URL with secret token. user_id=null means "Casal" (shared). All collection rules are open ('').

## Key Files
- `package.json` - Root monorepo config with workspaces and scripts
- `apps/landing/vite.config.ts` - Landing page Vite config (port 5000, proxies to web app and PocketBase)
- `apps/web/vite.config.ts` - Vue app Vite config (port 5174, base path `/app/`)
- `pocketbase/pb_hooks/main.pb.js` - PocketBase hooks for SPA routing
- `pocketbase/pb_migrations/` - Database schema migrations
- `scripts/pocketbase.js` - Script to download/start PocketBase

## Workflow
- **Start application**: `npm run dev` (port 5000, webview)

## Deployment
- Target: VM (always running, needed for PocketBase persistent storage)
- Run: Build both frontends then serve via PocketBase on port 5000
