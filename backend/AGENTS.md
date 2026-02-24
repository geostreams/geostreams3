# Geostreams3 Backend — Agent Context

## Stack

- Python 3.11, Django + Django REST Framework
- TimescaleDB with PostGIS (`timescale.db.backends.postgis`)
- Keycloak for OIDC + API-key auth (`python-keycloak`, `pyjwt`)
- Swagger/OpenAPI via `drf-yasg`

## App layout

```
backend/
├── geostreams3/        # Django project (settings, urls, wsgi/asgi)
├── sensordata/         # Core app: sensors, streams, datapoints, parameters, categories
│   ├── models.py       # Sensor, Stream, Datapoint (TimescaleModel), Parameter, Category, Region, Visualization
│   ├── serializers.py  # DRF serializers for all models + GeoJSON support
│   ├── views/          # One file per resource (sensors.py, streams.py, datapoints.py, …)
│   ├── urls.py         # DefaultRouter registration + custom aggregate endpoints
│   ├── migrations/     # Database migrations; includes TimescaleDB continuous aggregates
│   └── sql/            # Raw SQL for continuous aggregate create/delete
├── authentication/     # Auth app: Keycloak login, user profile, API key generation
│   ├── authentication.py  # APIKeyAuthentication, KeycloakAuthentication classes
│   ├── models.py       # APIKey model (OneToOne with User)
│   └── views.py        # KeycloakLoginView, UserProfileView, GenerateAPIKeyView
├── requirements.txt
└── entrypoint.sh       # Shell script to run migrations and start the server, used in Dockerfile
```

## API style

- ViewSets registered on a `DefaultRouter` at `/geostreams/api/data/`.
- Auth endpoints at `/geostreams/api/auth/` (standard `path()` views).
- GET endpoints are open; POST/DELETE require auth (`AuthEnforcedModelViewSet`).
- JSON-only — no browsable API renderer.
- All input/output goes through `serializers.py`.
- New views go in `sensordata/views/` as separate files and get registered in `sensordata/urls.py`.

## Auth

Dual authentication: Keycloak JWT tokens **or** hashed API keys (JWT-wrapped).
Set `DISABLE_AUTH=True` in `.env` to skip auth during local development.

## Commands

```bash
python manage.py runserver          # Dev server on :8000
python manage.py migrate            # Apply migrations
python manage.py makemigrations     # Generate new migrations
python manage.py test               # Full test suite
```

## Targeted testing

All tests live in `sensordata/tests.py`. When changes touch a specific area, run only the corresponding test class(es):

| Changed files | Command |
|---|---|
| `views/sensors.py`, Sensor model | `python manage.py test sensordata.tests.SensorApiTest sensordata.tests.SensorInShapeTestCase` |
| `views/streams.py`, Stream model | `python manage.py test sensordata.tests.StreamApiTest` |
| `views/datapoints.py`, Datapoint model | `python manage.py test sensordata.tests.DatapointsViewSetTestCase sensordata.tests.EdgeCaseDatapointTestCase` |
| `views/parameters.py`, Parameter model | `python manage.py test sensordata.tests.ParameterApiTest` |
| `views/categories.py`, Category model | `python manage.py test sensordata.tests.CategoryApiTest` |
| `views/visualizations.py`, Visualization model | `python manage.py test sensordata.tests.VisualizationApiTest` |
| `authentication/` changes | `python manage.py test` (full suite — auth is a dependency for all tests) |
| `serializers.py` or broad model changes | `python manage.py test` (full suite) |

## Migrations

- Never hand-edit existing migration files.
- Always use `makemigrations` to generate new ones.
- `sensordata/sql/` contains raw SQL for TimescaleDB continuous aggregates — referenced by migration `0002`.

## Linting

- **black** — default line length. **flake8** — max-line-length 120.
- Pre-commit hooks enforce both on every commit.

## Constraints

- JSON-only renderer — do not add the browsable API renderer.
- All serialization through `serializers.py` — no inline dict responses from views.
- New resources: create a view file in `sensordata/views/`, export from `__init__.py`, register in `sensordata/urls.py`.
- Database engine is `timescale.db.backends.postgis` — requires GDAL/GEOS system libraries.
