# Geostreams3 Frontend — Agent Context

## Stack

- React 18 + TypeScript (`strict`), built with Vite (`@vitejs/plugin-react`)
- Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui primitives in `src/components/ui` (Radix, lucide-react icons)
- React Router v6 (basename `/geostreams`)
- Axios for HTTP
- Keycloak OIDC via `react-oidc-context` / `oidc-client-ts`

## Directory structure

```
src/
├── App.tsx             # Router setup, auth-gated routes
├── index.tsx           # Entry: AuthProvider, providers
├── config.ts           # Typed env access (`VITE_*`)
├── pages/              # Route-level components
├── components/
│   └── ui/             # shadcn/ui primitives (`@/components/ui`)
├── api/, hooks/, types/, contexts/, lib/   # Typed data layer and helpers
└── ...                 # Feature components alongside pages
```

Run `ls src` for the current layout. The `@/` alias maps to `src/`.

## Commands

```bash
npm start          # Dev server (port 3000), proxies /api → http://localhost via vite.config.ts
npm run build      # Production build → build/
npm run preview    # Serve the production build locally
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # eslint src
```

## Auth

`AuthProvider` in the entry file wraps the app with OIDC config pointing at Keycloak.

Env vars are read as `import.meta.env.VITE_*` (see `.env-example`):

| Variable | Purpose |
|---|---|
| `VITE_KEYCLOAK_AUTH_URL` | Keycloak realm URL |
| `VITE_KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `VITE_BACKEND_URL` | Backend origin for API calls |
| `VITE_KEYCLOAK_CLIENT_SECRET` | OIDC client secret (if required) |

## Routing

All routes use basename `/geostreams` (set as `base` in `vite.config.ts` and in the Router config).
Routes are defined in `App.tsx`. Protected routes check OIDC auth state before rendering.

## Constraints

- Use shadcn primitives from `@/components/ui` and Tailwind utilities for all UI; do not add other UI/CSS frameworks.
- New files are `.ts`/`.tsx`; `allowJs` is off.
- Functional components only — no class components.
- ESLint rules enforced: `no-var` (error), `no-console` (warn), `prefer-const` (warn).
- Prettier formats on commit via pre-commit hook.
- Proxy config lives in `vite.config.ts` (`server.proxy`).
