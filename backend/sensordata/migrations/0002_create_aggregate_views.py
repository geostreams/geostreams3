# This migration is used to create the continuous aggregate views in the database.

from django.db import migrations
import os


def create_aggregate_views(apps, schema_editor):
    filename = os.path.join("sensordata", "sql", "create_continuous_aggregates.sql")
    sql = open(filename, "r").read()

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(sql)


def delete_aggregate_views(apps, schema_editor):
    filename = os.path.join("sensordata", "sql", "delete_continuous_aggregates.sql")
    sql = open(filename, "r").read()
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
