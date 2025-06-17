#!/bin/bash

# Exit on any error
set -e

echo "Starting Django application..."

# Wait for database to be ready
echo "Waiting for database..."
python manage.py wait_for_db || {
    echo "Database connection failed, but continuing..."
}

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput


# Start the Django development server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
