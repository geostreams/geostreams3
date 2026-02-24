# Geostreams3 — Agent Context (Root)

## Repo layout

```
geostreams3/
├── frontend/          # React SPA (see frontend/AGENTS.md)
├── backend/           # Django REST API (see backend/AGENTS.md)
├── keycloak/          # Keycloak realm config
├── docker-compose.yml          # Production (Traefik + prebuilt images)
├── docker-compose.dev.yml      # Local dev (all services, hot-reload)
├── database_migration_scripts/ # One-off DB migration helpers
├── bruno_api_requests/         # Bruno HTTP request collections
└── .pre-commit-config.yaml     # Shared pre-commit hooks
```

## Architecture

- **Frontend** — React 18 SPA served under `/geostreams/`.
- **Backend** — Django REST Framework API at `/geostreams/api/`.
- **Database** — TimescaleDB with PostGIS for time-series + geospatial and PostgreSQL as Keycloak database.
- **Auth** — Keycloak OIDC (frontend tokens + backend API-key auth).
- **Proxy** — Traefik reverse-proxies all services behind a single origin.

## URL prefix

Every route starts with `/geostreams/`:

| Path | Service |
|---|---|
| `/geostreams/` | Frontend SPA |
| `/geostreams/api/data/` | Sensor data REST API |
| `/geostreams/api/auth/` | Authentication endpoints |
| `/geostreams/api/swagger/` | Swagger UI |
| `/geostreams/keycloak/` | Keycloak admin UI |

## Dev workflow

```bash
# Start all services required for dev environment (DB, Keycloak, Traefik)
docker-compose -f docker-compose.dev.yml up

# To run frontend/backend individually:
cd frontend && npm start        # CRA dev server, proxies /api to backend
cd backend  && python manage.py runserver
```

## Code quality

Pre-commit hooks enforce formatting on every commit:

| Language | Tools |
|---|---|
| Python | black, flake8 (max-line-length 120) |
| JS/JSX | eslint, prettier |

CI (GitHub Actions) runs Django tests on every PR targeting `main` when `backend/` files change.

## PR norms

1. Run backend tests before pushing (`cd backend && python manage.py test`).
2. Run frontend lint before pushing (`cd frontend && npx eslint src`).
3. Never commit `.env` files — use `.env-example` as the template.
4. Keep pre-commit hooks enabled (`pre-commit install`).

## Sub-project agents

- [frontend/AGENTS.md](frontend/AGENTS.md) — React/MUI stack, commands, constraints.
- [backend/AGENTS.md](backend/AGENTS.md) — Django apps, API style, testing, constraints.
