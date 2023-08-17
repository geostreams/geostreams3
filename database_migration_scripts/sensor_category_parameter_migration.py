import pandas as pd
from requests import get, post
import json
from tqdm import tqdm
import concurrent.futures

root_url = 'http://localhost:9007/'

# Get all sensors
sensors_df = pd.read_csv('data/sensors.csv')
tqdm.pandas()


def post_sensor(sensor):
    """Post a sensor to the database."""
    url = root_url + 'sensordata/sensors/'
    data = {
        'name': sensor['name'],
        'geog': sensor['geog'],
        'created': sensor['created'],
        'parameters': json.loads(sensor['parameters'])[0],
        'properties': sensor['metadata']
    }
    # print(data['parameters'])
    response = post(url, data=data)
    if response.status_code != 201:
        print(response.status_code)
        print(response.text)


streams_df = pd.read_csv('data/streams.csv')


def post_stream(stream):
    """Post a stream to the database."""
    try:
        url = root_url + 'sensordata/streams/'
        params = stream['params'].strip("{}").split(',')
        sensor_id = get(root_url + 'sensordata/sensors/?name=' + stream['sensor_name']).json()[0]['id']
        data = {
            "name": stream['name'],
            "geog": stream['geog'],
            "created": stream['created'],
            "parameters": params,
            "properties": stream['metadata'],
            "sensor": sensor_id
        }
        # print(data)
        response = post(url, data=data)
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)
        else:
            print('Success!')
    except Exception as e:
        print(e)
        print(stream['name'])
        print(stream['params'])


parameters_df = pd.read_csv('data/parameters.csv')


def post_parameter(parameter):
    """Post a parameter to the database."""
    url = root_url + 'sensordata/parameters/'
    data = {
        'name': parameter['name'],
        'title': parameter['title'],
        'unit': parameter['unit']
    }
    response = post(url, data=data)
    if response.status_code != 201:
        print(response.status_code)
        print(response.text)


categories_df = pd.read_csv('data/categories.csv')


def post_categories(category):
    """Post a category to the database."""
    url = root_url + 'sensordata/categories/'
    data = {
        'name': category['name'],
        'detail_type': category['detail_type'],
    }
    response = post(url, data=data)
    if response.status_code != 201:
        print(response.status_code)
        print(response.text)



datapoints_df = pd.read_csv('data/datapoints.csv')


def post_datapoints(datapoint):
    try:
        url = root_url + 'sensordata/datapoints/'
        stream_id = get(root_url + 'sensordata/streams/?name=' + datapoint['sensor_name']).json()[0]['id']
        dp_data = {
            'geog': datapoint['geog'],
            'time': datapoint['start_time'],
            'end_time': datapoint['end_time'],
            'data': str(datapoint['data']),
            'stream': stream_id
        }
        response = post(url, data=dp_data)
        if response.status_code != 201:
            print(response.status_code)
            print(response.text)
    except Exception as e:
        print(e)
        print(datapoint['sensor_name'])
        print(datapoint['start_time'])
        print(datapoint['end_time'])
        print(datapoint['data'])


# parameters_df.progress_apply(post_parameter, axis=1)
# categories_df.progress_apply(post_categories, axis=1)
# sensors_df.progress_apply(post_sensor, axis=1)
# streams_df.progress_apply(post_stream, axis=1)
datapoints_df[datapoints_df['sensor_name']=='Reinhart'].progress_apply(post_datapoints, axis=1)
# datapoints_df[datapoints_df['sensor_name']=='Reinhart'].progress_apply(post_datapoints, axis=1)

