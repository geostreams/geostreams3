import pandas as pd
import json
import requests
from tqdm import tqdm
import os

tqdm.pandas()

datapath = os.path.join("data", "csv_json")

geostreams_url = "http://localhost/api/"
api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJtcDZAaWxsaW5vaXMuZWR1IiwiYXBpX2tleSI6IlJ0OEIxNWZBdGtCMTFFbDJlTG9oN0dVckJkOGw1VkFLR0xrX3lvdnVkbzgifQ.DiulGxL1b5De1Mb1fAit6svpq2CR4uLETWM-qbdjFco"  # Replace with Geostreams API that you can get from frontend
headers = {"Authorization": api_key, "Content-Type": "application/json"}

# Order of updating- Visualizations, Categories, Parameters, Sensors, Streams, Datapoints


def post_visualizations():
    # Visualizations
    viz_data = [
        {
            "name": "line",
            "title": "Line Chart",
        },
        {
            "name": "stacked-line",
            "title": "Stacked Line Chart",
        },
        {
            "name": "stacked-bar",
            "title": "Stacked Bar Chart",
        },
        {
            "name": "scatter",
            "title": "Scatter Plot",
        },
    ]

    # Post visualizations

    for viz in viz_data:
        response = requests.post(
            geostreams_url + "data/visualizations/", json=viz, headers=headers
        )
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)


def post_categories():
    categories = pd.read_csv(os.path.join(datapath, "categories.csv"))

    def post_category(row):
        data = {"name": row["name"], "description": ""}
        response = requests.post(
            geostreams_url + "data/categories/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)

    categories.progress_apply(post_category, axis=1)


def post_parameters():
    parameters = pd.read_csv(
        os.path.join(datapath, "parameters.csv"), keep_default_na=False
    )

    def post_parameter(row):
        data = {
            "name": row["name"],
            "title": row["title"],
            "unit": row["unit"],
            "category": "Uncategorized",
            "visualization": "line",
        }
        response = requests.post(
            geostreams_url + "data/parameters/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)

    parameters.progress_apply(post_parameter, axis=1)


def post_sensors():
    # sensors = pd.read_csv("data/csv_json/sensors.csv")
    sensors = json.loads(
        open(os.path.join(datapath, "sensors.json")).read()
    )  # Need JSON for easier Geom field parsing

    def post_sensor(sensor):
        data = {
            "name": sensor["name"],
            "geometry": sensor["geometry"],
            "geotype": sensor["geoType"],
            "parameters": sensor["parameters"],
            "properties": sensor["properties"],
        }

        response = requests.post(
            geostreams_url + "data/sensors/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(sensor["name"])

    # sensors.progress_apply(post_sensor, axis=1)
    for sensor in tqdm(sensors["sensors"]):
        post_sensor(sensor)


def post_streams():
    # streams = pd.read_csv("data/csv_json/streams.csv", keep_default_na=False)
    streams = json.loads(open(os.path.join(datapath, "streams.json")).read())

    def post_stream(stream):
        try:
            sensor = requests.get(
                geostreams_url + "data/sensors/?name=" + stream["name"]
            ).json()["sensor"]
        except KeyError:
            # print(f"Sensor {stream['name']} not found")
            return

        data = {
            "name": stream["name"],
            "geotype": stream["geoType"],
            "sensor": sensor["id"],
            "geometry": stream["geometry"],
            "properties": {},
        }
        response = requests.post(
            geostreams_url + "data/streams/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(stream["name"])

    # streams.progress_apply(post_stream, axis=1)
    for stream in tqdm(streams["streams"]):
        post_stream(stream)


def get_stream_id_name_mapping():
    streams = json.loads(open(os.path.join(datapath, "streams.json")).read())
    stream_id_name_mapping = {}
    for stream in streams["streams"]:
        stream_id_name_mapping[stream["id"]] = stream["name"]
    return stream_id_name_mapping


def post_datapoints():
    datapoints = pd.read_csv(os.path.join(datapath, "datapoints.csv"))
    stream_ids = datapoints["stream_id"].unique()
    stream_id_name_mapping = get_stream_id_name_mapping()
    streams = [
        (stream_id_name_mapping[stream_id], stream_id) for stream_id in stream_ids
    ]

    def post_datapoint(datapoint, stream_id):
        data = {
            "time": datapoint["start_time"],
            "data": json.loads(datapoint["data"].replace("'", '"')),
            "stream": stream_id,
        }

        response = requests.post(
            geostreams_url + "data/datapoints/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)

    for stream, old_stream_id in streams:
        try:
            print(f"Working on: {stream} with old id: {old_stream_id}")
            stream_id = requests.get(geostreams_url + "data/streams/?name=" + stream)
            if stream_id.status_code == 404:
                continue
            stream_id = stream_id.json()["stream"]["id"]
        except KeyError:
            continue
        datapoints[datapoints["stream_id"] == old_stream_id].progress_apply(
            post_datapoint, stream_id=stream_id, axis=1
        )


if __name__ == "__main__":
    # post_visualizations()
    # post_categories()
    # post_parameters()
    # post_sensors()
    # post_streams()
    post_datapoints()
