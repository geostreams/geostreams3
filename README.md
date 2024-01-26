# Geostreams

Geostreams API is a RESTful web service to manage data streams in time and space. It relies on
[PostgreSQL](https://www.postgresql.org/), [PostGIS](http://postgis.net/) and [timescale extension](https://www.timescale.com/). The web application is developed
using the [Django Rest Framework](http://www.django-rest-framework.org/)

## Developers

### Docker-compose

The easiest way to set up the stack is to use [docker-compose](https://docs.docker.com/compose/).
```yaml
docker-compose up -d
```

### Django development server

To run the Django development server, you need to install the requirements and run the migrations.

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Swagger documentation

To access the API endpoints access the swagger page by adding the `/swagger` to the base url. For example, if the base url is `http://localhost:8000`, the swagger page is `http://localhost:8000/swagger`.
