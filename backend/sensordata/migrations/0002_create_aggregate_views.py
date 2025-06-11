# This migration is used to create the continuous aggregate views in the database.

from django.db import migrations
import os


def create_aggregate_views(apps, schema_editor):
    # Get the directory where this migration file is located
    migration_dir = os.path.dirname(__file__)
    # Go up one level to the app directory, then into sql
    sql_dir = os.path.join(os.path.dirname(migration_dir), "sql")
    filename = os.path.join(sql_dir, "create_continuous_aggregates.sql")

    with open(filename, "r") as f:
        sql = f.read()

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(sql)


def delete_aggregate_views(apps, schema_editor):
    # Get the directory where this migration file is located
    migration_dir = os.path.dirname(__file__)
    # Go up one level to the app directory, then into sql
    sql_dir = os.path.join(os.path.dirname(migration_dir), "sql")
    filename = os.path.join(sql_dir, "delete_continuous_aggregates.sql")

    with open(filename, "r") as f:
        sql = f.read()

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(sql)


class Migration(migrations.Migration):
    dependencies = [
        ("sensordata", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            create_aggregate_views, reverse_code=delete_aggregate_views
        ),
    ]
