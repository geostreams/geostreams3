
# Geostreams [Development]

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

[![Tests](https://github.com/geostreams/geostreams3/actions/workflows/django_tests.yml/badge.svg)](https://github.com/geostreams/geostreams3/actions/workflows/django_tests.yml)

Geostreams API is a RESTful web service to manage data streams in time and space. It relies on
[PostgreSQL](https://www.postgresql.org/), [PostGIS](http://postgis.net/), and the [Timescale](https://www.timescale.com/) extension. The application stack includes a [Django Rest Framework](http://www.django-rest-framework.org/) backend, a React frontend, and [Keycloak](https://www.keycloak.org/) for authentication.



## For Developers
### Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed for the frontend
- Python 3.10 or higher for the backend

### Docker-compose

The easiest way to set up the stack is to use [docker-compose](https://docs.docker.com/compose/).

```bash
docker-compose up -d
```

This will start the PostgreSQL and Keycloak. Make sure Keycloak is running on port 8080.

### Keycloak Configuration

1. Access the Keycloak admin console at `http://localhost:8080`.
2. Import the `realm-settings.json` file to create the realm.
3. Import the `geostreams.json` file to create the Geostreams client configuration in the imported realm.

### Environment Setup

Make a copy of `.env_example` in both the frontend and `backend/geostreams3` directories and update them with appropriate values:

```bash
cp frontend/.env_example frontend/.env
cp backend/geostreams3/.env_example backend/geostreams3/.env
```

Update the values to match your environment setup, including API URLs, database settings, and Keycloak configurations and secrets.

### Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
npm run start
```

This will start the React frontend server, accessible at `http://localhost:3000`.

### Backend Setup

For the backend, change to the `backend` directory, install the requirements, and run the migrations if necessary:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 9007
```

The backend will be running at `http://localhost:9007`. This port number can be modified but make sure to update keycloak and other required configurations accordingly.

### Pre-commit Setup

To ensure code style consistency, install pre-commit hooks by running:

```bash
pre-commit install
```

This will automatically run checks such as Black formatting on every commit.

### Swagger Documentation

To access the API documentation, open the Swagger page by appending `/swagger` to the base URL. For example, if the backend is running on `http://localhost:9007`, access the Swagger UI at:

```
http://localhost:9007/swagger
```
