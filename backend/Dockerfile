FROM python:3.11-slim

# In Docker containers or environments where you want to see logs in real-time,
# disabling buffering ensures that logs are printed immediately to the terminal or log monitoring system.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies, including GDAL
RUN apt-get update && apt-get install -y \
    libpq-dev gcc gdal-bin libgdal-dev && \
    rm -rf /var/lib/apt/lists/*

# Set GDAL_LIBRARY_PATH environment variable
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt


# Copy the source code
COPY . .

EXPOSE 8000
# CMD ["python", "manage.py", "makemigrations", "&&", "python", "manage.py", "migrate", "&&", "python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
