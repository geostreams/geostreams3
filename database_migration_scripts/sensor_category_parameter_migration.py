import pandas as pd
from requests import get, post
import json


root_url = 'http://localhost:9007/'

# Get all sensors
sensors_df = pd.read_csv('data/sensors.csv')

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
    else:
        print('Success!')

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

# sensors_df.apply(post_sensor, axis=1)
streams_df.apply(post_stream, axis=1)