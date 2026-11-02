# Geostreams3 Frontend — Agent Context

## Stack

- React 18 (Vite via `@vitejs/plugin-react`)
- MUI v5 (`@mui/material`, `@mui/icons-material`) — **no Tailwind**
- React Router v6 (basename `/geostreams`)
- Axios for HTTP
- Keycloak OIDC via `react-oidc-context` / `oidc-client-ts`

## Directory structure

```
src/
├── App.jsx             # Router setup, auth-gated routes
├── index.jsx           # Entry: AuthProvider, ThemeProvider
├── pages/              # Route-level components (Home, UserProfile)
├── components/
│   ├── common/         # Shared layout (PageLayout)
│   └── ui/             # Reusable presentational (Card, LoadingSpinner, …)
├── features/           # Feature modules (auth, dashboard, data, map, sensors, settings) — scaffolded, mostly empty
├── theme/              # MUI theme config (theme.js)
├── services/           # API service layer (empty, to be built)
├── contexts/           # React contexts (empty)
├── layouts/            # Layout wrappers (empty)
└── utils/              # Helpers (empty)
```

## Commands

```bash
npm start        # Dev server (port 3000), proxies /api → http://localhost via vite.config.js
npm run build    # Production build → build/
npm run preview  # Serve the production build locally
```

## Auth

`AuthProvider` in `src/index.jsx` wraps the app with OIDC config pointing at Keycloak.

Env vars are read as `import.meta.env.VITE_*` (see `.env-example`):

| Variable | Purpose |
|---|---|
| `VITE_KEYCLOAK_AUTH_URL` | Keycloak realm URL |
| `VITE_KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `VITE_BACKEND_URL` | Backend origin for API calls |
| `VITE_KEYCLOAK_CLIENT_SECRET` | OIDC client secret (if required) |

## Routing

All routes use basename `/geostreams` (set as `base` in `vite.config.js` and in the Router config).
Routes are defined in `App.jsx`. Protected routes check OIDC auth state before rendering.

## Constraints

- Use MUI components for all UI — do not introduce Tailwind or other CSS frameworks.
- New JSX component files should use the `.jsx` extension (the entry files are `App.jsx` and `index.jsx`).
- Functional components only — no class components.
- ESLint rules enforced: `no-var` (error), `no-console` (warn), `prefer-const` (warn).
- Prettier formats on commit via pre-commit hook.
- Proxy config lives in `vite.config.js` (`server.proxy`).
