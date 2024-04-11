import pandas as pd
import json
import requests
from tqdm import tqdm

tqdm.pandas()

geostreams_url = "http://localhost:9007/"


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
        response = requests.post(geostreams_url + "api/visualizations/", json=viz)
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)


def post_categories():
    categories = pd.read_csv("data/categories.csv")

    def post_category(row):
        data = {"name": row["name"], "description": ""}
        response = requests.post(geostreams_url + "api/categories/", json=data)
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)

    categories.progress_apply(post_category, axis=1)


def post_parameters():
    parameters = pd.read_csv("data/parameters.csv")
    parameters = parameters[-1:]

    def post_parameter(row):
        data = {
            "name": row["name"],
            "title": row["title"],
            "unit": row["unit"],
            "category": "Flux Tower",
            "visualization": "line",
        }
        response = requests.post(geostreams_url + "api/parameters/", json=data)
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)

    parameters.progress_apply(post_parameter, axis=1)


def post_sensors():
    sensors = json.loads(open("data/sensors.json").read())
    sensors_df = pd.read_csv("data/sensors.csv")

    def post_sensor(sensor):
        sensor_row = sensors_df.iloc[
            sensors_df[sensors_df["gid"] == sensor["id"]].index[0]
        ]
        data = {
            "name": sensor["name"],
            "geog": sensor_row["geog"],
            "parameters": sensor["parameters"],
            "properties": sensor["properties"],
            "min_start_time": sensor["min_start_time"],
            "max_end_time": sensor["max_end_time"],
        }

        response = requests.post(geostreams_url + "api/sensors/", json=data)
        if response.status_code != 201:
            print(sensor["name"])

    for sensor in tqdm(sensors["sensors"]):
        post_sensor(sensor)


if __name__ == "__main__":
    post_visualizations()
    post_categories()
    post_parameters()
    post_sensors()
