# Geostreams3 Frontend — Agent Context

## Stack

- React 18 (CRA via `react-scripts`)
- MUI v5 (`@mui/material`, `@mui/icons-material`) — **no Tailwind**
- React Router v6 (basename `/geostreams`)
- Axios for HTTP
- Keycloak OIDC via `react-oidc-context` / `oidc-client-ts`

## Directory structure

```
src/
├── App.js              # Router setup, auth-gated routes
├── index.js            # Entry: AuthProvider, ThemeProvider
├── pages/              # Route-level components (Home, UserProfile)
├── components/
│   ├── common/         # Shared layout (PageLayout)
│   └── ui/             # Reusable presentational (Card, LoadingSpinner, …)
└── theme/              # MUI theme config (theme.js)
```

## Commands

```bash
npm start        # Dev server (port 3000), proxies /api → backend via setupProxy.js
npm run build    # Production build → build/
```

## Auth

`AuthProvider` in `src/index.js` wraps the app with OIDC config pointing at Keycloak.

Env vars (see `.env-example`):

| Variable | Purpose |
|---|---|
| `REACT_APP_KEYCLOAK_AUTH_URL` | Keycloak realm URL |
| `REACT_APP_KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `REACT_APP_BACKEND_URL` | Backend origin for API calls |

## Routing

All routes use basename `/geostreams` (set in `package.json` `homepage` and Router config).
Routes are defined in `App.js`. Protected routes check OIDC auth state before rendering.

## Constraints

- Use MUI components for all UI — do not introduce Tailwind or other CSS frameworks.
- JSX files use the `.jsx` extension.
- Functional components only — no class components.
- ESLint rules enforced: `no-var` (error), `no-console` (warn), `prefer-const` (warn).
- Prettier formats on commit via pre-commit hook.
- Proxy config lives in `setupProxy.js` (not in `package.json`).
