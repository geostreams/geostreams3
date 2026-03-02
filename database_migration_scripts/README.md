## Developer Set Up Instructions

Pre-requisites:
You will require a dump of the database to run the migration scripts. To obtain the dump,
please contact the Geostreams team at mohanar2@illinois.edu.

Step 1: Clone the repository

```bash
git clone https://github.com/geostreams/geostreams3.git
```

Step 2: Set up the docker containers

```bash
cd geostreams3
docker-compose up
```

Step 3: Move the database dump to the database_migration_scripts directory, then run the following command to load from dump

```bash
cd database_migration_scripts
./load_from_dump.sh
```

Step 4: Go back to the root directory and install the dependencies, please ensure you have a .env file in the geostreams3 directory. Refer to the .env.example file for the required environment variables.

```bash
python manage.py runserver
```
