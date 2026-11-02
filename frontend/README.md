# Geostreams3 Frontend Portal

This app is the frontend portal for Geostreams3. It provides the user interface for browsing sensors, streams, parameters, and visualizations, and for interacting with the Geostreams3 APIs.

Built with Vite, React 18, TypeScript, Tailwind CSS and shadcn/ui.

## Run Locally

1. From `frontend/`, install dependencies:
   - `npm install`
2. Create a local env file:
   - `cp .env-example .env`
   - Update values as needed for your backend.
3. Start the dev server:
   - `npm start`

The app will be available at `http://localhost:3000`.

## Commands

| Command | Purpose |
|---|---|
| `npm start` | Vite dev server |
| `npm run build` | Production build to `build/` |
| `npm run typecheck` | Type-check with `tsc --noEmit` (strict) |
| `npm run lint` | Lint `src` with ESLint |

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_KEYCLOAK_AUTH_URL` | Keycloak realm URL |
| `VITE_KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `VITE_BACKEND_URL` | Backend origin for API calls |
| `VITE_KEYCLOAK_CLIENT_SECRET` | OIDC client secret (if required) |
