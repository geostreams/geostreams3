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

export TARGET=postgres://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME


psql $TARGET -v ON_ERROR_STOP=1 --echo-errors \
    -c "SELECT public.timescaledb_pre_restore();" \
    -f data.sql \
    -c "SELECT public.timescaledb_post_restore();"

echo "Load completed."

# Unset the password after use
unset PGPASSWORD
