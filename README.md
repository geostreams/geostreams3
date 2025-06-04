
# Geostreams3 [Development]

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

[![Tests](https://github.com/geostreams/geostreams3/actions/workflows/django_tests.yml/badge.svg)](https://github.com/geostreams/geostreams3/actions/workflows/django_tests.yml)

Geostreams3  is a RESTful web service to manage geospatial data streams. It integrates multiple tools and frameworks for
seamless data handling, processing and binning.

## Features
- User authentication and API key management and Django REST framework
- Geospatial data processing with TimescaleDB and PostGIS
- Continuous aggregates for optimized querying of large datasets.
- Frontend to allow users to register, login and procure API keys.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tools and Frameworks](#tools-and-frameworks)
3. [Setup Guide for Developers](#setup-guide-for-developers)
4. [API Testing with Bruno](#api-testing-with-bruno)

## Architecture Overview

The system is divided into 4 main components:

1. **API Layer**:
    - Django REST framework for the backend API.
    - Handles user authentication, API key management, and data processing.
    - Levarages TimescaleDB and PostGIS for geospatial data processing.
    - Provides endpoints for data ingestion, querying, and management.
    - Swagger documentation for API reference.

2. **Frontend**:
    - React frontend for user registration, login, and API key management.
    - Allows users to register, login, and manage their API keys.

3. **Databases**:
    - PostgreSQL database with TimescaleDB and PostGIS extensions.
    - Stores user data, API keys, and geospatial data streams.
    - Continuous aggregates for optimized querying of large datasets.
    - Used by Keycloak for store and persist user data.

4. **Keycloak**:
    - Open-source identity and access management for user authentication.
    - Provides user registration, login, and API key management.
    - Used to secure the API endpoints and manage user permissions.


## Tools and Frameworks
- Django REST framework: A powerful and flexible python toolkit for building Web APIs.
- Keycloak: An open-source identity and access management for user authentication.
- React: A JavaScript library for building user interfaces.
- TimescaleDB: An open-source time-series database optimized for fast ingest and complex queries.
- PostGIS: An open-source software program that adds support for geographic objects to the PostgreSQL object-relational database.
- Docker: A platform for developing, shipping, and running applications in containers.
- Docker Compose: A tool for defining and running multi-container Docker applications.
- Swagger: API documentation tool for RESTful web services.
- NGINX: Server for reverse proxy and load balancing.

## Setup Guide for Developers
### Prerequisites
- Docker and Docker Compose installed
- Node.js and npm installed for the frontend
- Python 3.10 or higher for the backend


### 1. Clone the Repository

```bash
git clone https://github.com/geostreams/geostreams3.git
cd geostreams3
```

### 2. Setup Environment Variables
Create .env files for the backend and frontend by copying the provided .env-example files:

    ```bash
    cp backend/geostreams3/.env_example backend/geostreams3/.env
    cp frontend/.env_example frontend/.env
    ```

Update the values in the .env files to match your environment setup, including API URLs,
database settings, and Keycloak configurations and secrets.

### 3. Start the




### Docker-compose

The easiest way to set up the stack is to use [docker-compose](https://docs.docker.com/compose/).

```bash
docker-compose up -d
```

This will start the PostgreSQL and Keycloak. Make sure Keycloak is running on port 8080.

### Keycloak Configuration

1. Access the Keycloak admin console at `http://localhost:8080` to configure the realm and client if necessary.

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
python manage.py runserver 8000
```

The backend will be running at `http://localhost:8000`. This port number can be modified but make sure to update keycloak and other required configurations accordingly.

### Pre-commit Setup

To ensure code style consistency, install pre-commit hooks by running:

```bash
pre-commit install
```

This will automatically run checks such as Black formatting on every commit.

### Swagger Documentation

To access the API documentation, open the Swagger page by appending `/swagger` to the base URL. For example, if the backend is running on `http://localhost:8000`, access the Swagger UI at:

```
http://localhost:8000/swagger
```

## API Testing with Bruno
We use Bruno to manage and test our API requests.
Bruno is a modern, lightweight, and open-source API client designed to simplify API development and testing. It also
allows you to save and share API requests, collaborate with your team, and automate API testing.
All our API requests are saved in the collection `Geostreams3` inside the folder `bruno_api_requests`

Getting Started
	1.	Download Bruno
Download the Bruno API client from [here](https://www.usebruno.com/downloads.
	2.	Import Requests
Once installed, import the saved requests from the bruno_api_requests folder.
	3.	Set the Base URL
Make sure to configure the Base URL in Bruno’s environment settings to match your API environment (e.g., development, staging, production).
    4.	Run Requests
      Run the requests to test the API endpoints and verify the responses.
