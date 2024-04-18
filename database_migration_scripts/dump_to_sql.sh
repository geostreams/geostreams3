#!/bin/bash

# Database credentials
DB_NAME="postgres"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5433"

# Prompt user for password
echo "Please enter your database password:"
read -s DB_PASS

# Export the password as an environment variable
export PGPASSWORD="$DB_PASS"


export SOURCE=postgres://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME


pg_dump -d "$SOURCE" \
  --format=plain \
  --quote-all-identifiers \
  --no-tablespaces \
  --no-owner \
  --no-privileges \
  --file=data.sql

echo "Dump completed."

# Unset the password after use
unset PGPASSWORD
