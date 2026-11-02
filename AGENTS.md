# Geostreams3 — Agent Context (Root)

## Repo layout

```
geostreams3/
├── frontend/          # React SPA (see frontend/AGENTS.md)
├── backend/           # Django REST API (see backend/AGENTS.md)
├── keycloak/          # Keycloak realm config + themes
├── docker-compose.yml          # Production (Traefik + prebuilt images from NCSA registry)
├── docker-compose.dev.yml      # Local dev infra only (DB, Keycloak, Traefik)
├── database_migration_scripts/ # One-off DB migration helpers
├── bruno_api_requests/         # Bruno HTTP request collections
└── .pre-commit-config.yaml     # Shared pre-commit hooks (black, flake8, eslint, prettier)
```

Sub-project details live in [frontend/AGENTS.md](frontend/AGENTS.md) and [backend/AGENTS.md](backend/AGENTS.md) — read the relevant one before editing either area.

## Architecture

- **Frontend** — React 18 + TypeScript SPA (Vite, Tailwind, shadcn/ui) served under `/geostreams/`.
- **Backend** — Django REST Framework API at `/geostreams/api/`.
- **Database** — TimescaleDB + PostGIS for time-series/geospatial; a separate PostgreSQL backs Keycloak.
- **Auth** — Keycloak OIDC (frontend tokens) plus backend API-key auth (`DISABLE_AUTH=True` in `backend/.env` skips auth for local dev).
- **Proxy** — Traefik reverse-proxies all services behind a single origin.

## URL prefixes

Every route starts with `/geostreams/`:

| Path | Service |
|---|---|
| `/geostreams/` | Frontend SPA |
| `/geostreams/api/data/` | Sensor data REST API |
| `/geostreams/api/auth/` | Authentication endpoints |
| `/geostreams/api/swagger/` | Swagger UI |
| `/geostreams/keycloak/` | Keycloak admin UI |

## Dev workflow

`docker-compose.dev.yml` brings up **infra only** — TimescaleDB, Keycloak, Traefik — not backend or frontend:

```bash
docker-compose -f docker-compose.dev.yml up -d
# TimescaleDB on :5433, Keycloak via Traefik on http://localhost/geostreams/keycloak, Traefik dashboard on :8081
```

Backend and frontend run locally (full setup in `README.md`):

```bash
cd backend  && python manage.py migrate && python manage.py runserver   # README uses port 9007; Docker/entrypoint use 8000
cd frontend && npm install && npm start                                 # Vite dev server on :3000
```

Gotchas:
- Backend needs Python 3.11 (per `Dockerfile` and `backend/AGENTS.md`), `pip install -r requirements.txt`, and GDAL/GEOS system libs for PostGIS. Note: README suggests 3.12 and CI uses 3.10 — prefer 3.11.
- Frontend dev proxy (`server.proxy` in `frontend/vite.config.ts`) targets `http://localhost` (Traefik :80). Traefik only has a backend route in the **production** compose, not dev compose — so `/api` requests from the Vite dev server won't reach a locally-run backend without adjusting the proxy target.
- Env templates use inconsistent names: root is `.env.example` (dot), sub-projects are `.env-example` (hyphen). Copy all three before first run.
- Several dev-compose services pin `platform: linux/amd64` for Apple Silicon compatibility — expect slower startup on M-series Macs.

## Code quality

Pre-commit hooks (`.pre-commit-config.yaml`) enforce formatting on commit — install once with `pre-commit install`:

| Language | Tools |
|---|---|
| Python | black (default line length), flake8 (max-line-length 120, excludes `migrations/`) |
| TS/TSX | eslint `--fix` then prettier `--write`, run on `frontend/src` |

## CI / testing

- `django_tests.yml` runs `python manage.py migrate` then `python manage.py test` on PRs to `main` touching `backend/**`. The CI TimescaleDB service uses `pg14-latest` while dev compose uses `pg17` — a version mismatch that can mask or cause flakiness.
- CI writes `.env` at the **repo root** (not `backend/`); Django's `load_dotenv()` finds it by searching upward from `backend/`.
- `backend-docker.yaml` / `frontend-docker.yaml` build multi-arch (amd64 + arm64) images and push to `hub.ncsa.illinois.edu/geostreams3/{backend,frontend}` after tests pass on `main` and on `v*` tags.
- Targeted backend test commands (single test class per changed area) are in [backend/AGENTS.md](backend/AGENTS.md).

## PR norms

1. Run backend tests before pushing: `cd backend && python manage.py test`.
2. Run frontend checks before pushing: `cd frontend && npm run lint && npm run typecheck && npm run build`.
3. Never commit `.env` files — use the `*.env-example` templates (root: `.env.example`; backend/frontend: `.env-example`).
4. Keep pre-commit hooks enabled (`pre-commit install`).

## Sub-project agents

- [frontend/AGENTS.md](frontend/AGENTS.md) — React/TypeScript/Tailwind/shadcn stack, commands, routing, constraints.
- [backend/AGENTS.md](backend/AGENTS.md) — Django apps, API style, targeted testing, migration rules, constraints.
