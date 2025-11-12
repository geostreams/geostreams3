import pandas as pd
import json
import requests
from tqdm import tqdm

tqdm.pandas()

geostreams_url = "http://localhost:8000/"
api_key = "your_api_key"  # Replace with Geostreams API that you can get from frontend
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
    categories = pd.read_csv("data/csv_json/categories.csv")

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
    parameters = pd.read_csv("data/csv_json/parameters.csv")

    def post_parameter(row):
        data = {
            "name": row["name"],
            "title": row["title"],
            "unit": row["unit"],
            "category": "Flux Tower",
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
    sensors = json.loads(open("data/csv_json/sensors.json").read())

    def post_sensor(sensor):
        data = {
            "name": sensor["name"],
            "geometry": sensor["geometry"],
            "geoType": sensor["geoType"],
            "parameters": sensor["parameters"],
            "properties": sensor["properties"],
        }

        response = requests.post(
            geostreams_url + "data/sensors/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(sensor["name"])

    for sensor in tqdm(sensors["sensors"]):
        post_sensor(sensor)


def post_streams():
    streams = json.loads(open("data/csv_json/streams.json").read())

    def post_stream(stream):
        sensor = requests.get(
            geostreams_url + "data/sensors/?name=" + stream["name"]
        ).json()["sensor"]

        data = {
            "name": stream["name"],
            "geoType": stream["geoType"],
            "sensor": sensor["id"],
            "geometry": stream["geometry"],
            "properties": {},
        }
        response = requests.post(
            geostreams_url + "data/streams/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(stream["name"])

    for stream in tqdm(streams["streams"]):
        post_stream(stream)


def post_datapoints():
    datapoints = pd.read_csv("data/csv_json/datapoints.csv")
    streams = datapoints["stream_name"].unique()

    def post_datapoint(datapoint, stream_id):
        data = {
            "time": datapoint["time"],
            "data": datapoint["data"],
            "stream": stream_id,
        }
        response = requests.post(
            geostreams_url + "data/datapoints/", json=data, headers=headers
        )
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)

    for stream in tqdm(streams):
        stream_id = requests.get(
            geostreams_url + "data/streams/?name=" + stream
        ).json()["stream"]["id"]
        datapoints[datapoints["stream_name"] == stream].progress_apply(
            post_datapoint, stream_id=stream_id, axis=1
        )


if __name__ == "__main__":
    # post_visualizations()
    # post_categories()
    # post_parameters()
    # post_sensors()
    # post_streams()
    post_datapoints()
