import pandas as pd
from sqlalchemy import create_engine

conn_string = "postgresql+psycopg2://postgres:geostreams@0.0.0.0:5433/geostreams"
engine = create_engine(conn_string)
conn = engine.connect()

for t in [
    "sensors",
    "streams",
    "datapoints",
    "parameters",
    "categories",
    "parameter_categories",
]:
    df = pd.read_sql_query(f'select * from "{t}";', conn)
    df.to_csv(f"{t}.csv", index=False)
