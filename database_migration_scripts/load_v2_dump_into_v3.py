import pandas as pd
from requests import get, post
import json
from tqdm import tqdm
from sqlalchemy import create_engine

root_url = "http://localhost:9007/"

conn_string = "postgresql+psycopg2://postgres:geostreams@localhost:5432/postgres"
engine = create_engine(conn_string)
conn = engine.connect()


# Get all sensors
sensors_df = pd.read_csv("data/sensors.csv")
tqdm.pandas()

# Get all streams
streams_df = pd.read_csv("data/streams.csv")

# Get all datapoints
datapoints_df = pd.read_csv("data/datapoints.csv")


def post_datapoints(datapoint):
    try:
        url = root_url + "api/datapoints/"
        stream_id = get(
            root_url + "api/streams/?name=" + datapoint["sensor_name"]
        ).json()[0]["id"]
        dp_data = {
            "geog": datapoint["geog"],
            "time": datapoint["start_time"],
            "end_time": datapoint["end_time"],
            "data": str(datapoint["data"]),
            "stream": stream_id,
        }
        response = post(url, data=dp_data)
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)
    except Exception as e:
        print(e)
        print(datapoint["sensor_name"])
        print(datapoint["start_time"])
        print(datapoint["end_time"])
        print(datapoint["data"])


def post_sensors():
    #     Rename columns
    sensors_df.rename(columns={"metadata": "properties"}, inplace=True)
    sensors_df.drop(columns=["gid"], inplace=True)
    sensors_df["parameters"] = sensors_df["parameters"].apply(
        lambda x: json.loads(x)[0]
    )
    print(sensors_df["parameters"])
    sensors_df.dropna(subset=["parameters"], inplace=True)
    sensors_df.to_sql("sensors", conn, if_exists="append", index=False)
    print("Sensors posted to database.")


def post_streams():
    def get_params(x):
        # Check if x is a nan
        if x != x:
            return None
        return x.strip("{}").split(",")

    def get_id(name):
        sensor = get(root_url + "api/sensors/?name=" + name).json()
        if len(sensor) == 0:
            return None
        return sensor[0]["id"]

    streams_df["parameters"] = streams_df["params"].apply(get_params)
    streams_df["sensor_id"] = streams_df["sensor_name"].apply(get_id)

    #     Rename columns
    streams_df.rename(columns={"metadata": "properties"}, inplace=True)
    streams_df.drop(columns=["gid", "params", "sensor_name"], inplace=True)
    streams_df.dropna(subset=["sensor_id", "parameters"], inplace=True)
    streams_df.to_sql("streams", conn, if_exists="append", index=False)
    print("Streams posted to database.")


def post_parameters():
    parameters_df = pd.read_csv("data/parameters.csv")
    parameters_df = parameters_df[["name", "title", "unit"]]
    parameters_df.to_sql("parameters", conn, if_exists="append", index=False)
    print("Parameters posted to database.")


def post_categories():
    categories_df = pd.read_csv("data/categories.csv")
    categories_df = categories_df[["name", "detail_type"]]
    categories_df.to_sql("categories", conn, if_exists="append", index=False)
    print("Categories posted to database.")


def post_parameter_categories():
    parameter_categories_df = pd.read_csv("data/parameter_categories.csv")
    parameter_categories_df["parameter_id"] = parameter_categories_df[
        "parameter_name"
    ].apply(
        lambda x: get(root_url + "api/streams/?name=" + x).json()["parameter"["id"]]
    )


# post_sensors()
# post_streams()
# post_parameters()
# post_categories()
datapoints_df[datapoints_df["sensor_name"] == "Rund"].progress_apply(
    post_datapoints, axis=1
)
# datapoints_df[datapoints_df['sensor_name']=='Reinhart'].progress_apply(post_datapoints, axis=1)
