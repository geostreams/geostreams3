import pandas as pd
from sqlalchemy import create_engine

# POSTGRES_SERVER = "localhost"
# POSTGRES_USER = "rmp6"
# POSTGRES_PASSWORD = ""
# POSTGRES_DB = "direct4ag"
# POSTGRES_PORT = 5432

POSTGRES_SERVER = "141.142.219.10"
POSTGRES_USER = "geostreams"
POSTGRES_PASSWORD = "geostreams"
POSTGRES_DB = "geostreams"
POSTGRES_PORT = 5432

# url="jdbc:postgresql://141.142.219.10:5432/geostreams?user=geostreams&password=geostreams"
# make connection string
conn_string = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
# conn_string = "postgresql+psycopg2://postgres:geostreams@0.0.0.0:5433/geostreams"
engine = create_engine(conn_string)
conn = engine.connect()

import os

data_path = os.path.join("data", "csv_json")
os.makedirs(data_path, exist_ok=True)

for t in [
    "datapoints",
    "parameters",
    "categories",
    "parameter_categories",
]:
    df = pd.read_sql_query(f'select * from "{t}";', conn)
    df.to_csv(os.path.join(data_path, f"{t}.csv"), index=False)
