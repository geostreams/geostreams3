from django.test import TestCase
from rest_framework.test import APIClient

from sensordata.models import Datapoint, Sensor, Stream, Parameter, Category


class ParameterApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_parameter(self):
        data = {
            'name': 'temperature',
            'title': 'Temperature',
            'unit': 'Celsius',
            'search_view': True,
            'explore_view': False,
            'scale_names': ['Low', 'Medium', 'High'],
            'scale_colors': ['#FF0000', '#00FF00', '#0000FF']
        }

        response = self.client.post('/sensordata/parameters/', data=data, format='json')
        self.assertEqual(response.status_code, 201)  # Expecting a successful creation status code
        parameter_id = response.json().get('id')

        # Verify the created parameter by fetching its details
        get_response = self.client.get(f'/sensordata/parameters/{parameter_id}/')
        self.assertEqual(get_response.status_code, 200)  # Expecting a successful retrieval status code
        parameter = get_response.json()
        self.assertEqual(parameter['name'], 'temperature')
        self.assertEqual(parameter['title'], 'Temperature')
        self.assertEqual(parameter['unit'], 'Celsius')
        self.assertEqual(parameter['search_view'], True)
        self.assertEqual(parameter['explore_view'], False)
        self.assertEqual(parameter['scale_names'], ['Low', 'Medium', 'High'])
        self.assertEqual(parameter['scale_colors'], ['#FF0000', '#00FF00', '#0000FF'])

    def test_get_all_parameters(self):
        response = self.client.get('/sensordata/parameters/')
        self.assertEqual(response.status_code, 200)  # Expecting a successful retrieval status code
        parameters = response.json()
        self.assertIsInstance(parameters, list)

    def test_update_parameter(self):
        # Create a parameter first
        data = {
            'name': 'pressure',
            'title': 'Pressure',
            'unit': 'Pascal',
            'search_view': False,
            'explore_view': True,
            'scale_names': ['Low', 'Medium', 'High'],
            'scale_colors': ['#FF0000', '#00FF00', '#0000FF']
        }

        create_response = self.client.post('/sensordata/parameters/', data=data, format='json')
        self.assertEqual(create_response.status_code, 201)

        parameter_id = create_response.json().get('id')

        # Update the parameter
        updated_data = {
            'name': 'pressure',
            'title': 'Pressure Level',
            'unit': 'Pa',
            'search_view': False,
            'explore_view': True,
            'scale_names': ['Low', 'Medium', 'High'],
            'scale_colors': ['#FF0000', '#00FF00', '#0000FF']
        }

        update_response = self.client.put(f'/sensordata/parameters/{parameter_id}/', data=updated_data, format='json')
        self.assertEqual(update_response.status_code, 200)  # Expecting a successful update status code

        # Verify the updated parameter
        get_response = self.client.get(f'/sensordata/parameters/{parameter_id}/')
        self.assertEqual(get_response.status_code, 200)
        parameter = get_response.json()
        self.assertEqual(parameter['title'], 'Pressure Level')
        self.assertEqual(parameter['unit'], 'Pa')

    def test_delete_parameter(self):
        # Create a parameter first
        data = {
            'name': 'weight',
            'title': 'Weight',
            'unit': 'kg',
            'search_view': True,
            'explore_view': True,
            'scale_names': ['Low', 'Medium', 'High'],
            'scale_colors': ['#FF0000', '#00FF00', '#0000FF']
        }

        create_response = self.client.post('/sensordata/parameters/', data=data, format='json')
        self.assertEqual(create_response.status_code, 201)

        parameter_id = create_response.json().get('id')

        # Delete the parameter
        delete_response = self.client.delete(f'/sensordata/parameters/{parameter_id}/')
        self.assertEqual(delete_response.status_code, 204)  # Expecting a successful delete status code

        # Verify the parameter is deleted
        get_response = self.client.get(f'/sensordata/parameters/{parameter_id}/')
        self.assertEqual(get_response.status_code, 404)  # Expecting a not found status code


class CategoryApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_category(self):
        data = {
            'name': 'Temperature',
            'detail_type': 'time',
        }

        response = self.client.post('/sensordata/categories/', data=data, format='json')
        self.assertEqual(response.status_code, 201)  # Expecting a successful creation status code
        category_id = response.json().get('id')

        # Verify the created category by fetching its details
        get_response = self.client.get(f'/sensordata/categories/{category_id}/')
        self.assertEqual(get_response.status_code, 200)  # Expecting a successful retrieval status code
        category = get_response.json()
        self.assertEqual(category['name'], 'Temperature')
        self.assertEqual(category['detail_type'], 'time')

    def test_get_all_categories(self):
        response = self.client.get('/sensordata/categories/')
        self.assertEqual(response.status_code, 200)  # Expecting a successful retrieval status code
        categories = response.json()
        self.assertIsInstance(categories, list)

    def test_update_category(self):
        # Create a category first
        data = {
            'name': 'Pressure',
            'detail_type': 'stacked-line',
        }

        create_response = self.client.post('/sensordata/categories/', data=data, format='json')
        self.assertEqual(create_response.status_code, 201)

        category_id = create_response.json().get('id')

        # Update the category
        updated_data = {
            'name': 'Pressure Level',
            'detail_type': 'stacked-bar',
        }

        update_response = self.client.put(f'/sensordata/categories/{category_id}/', data=updated_data, format='json')
        self.assertEqual(update_response.status_code, 200)  # Expecting a successful update status code

        # Verify the updated category
        get_response = self.client.get(f'/sensordata/categories/{category_id}/')
        self.assertEqual(get_response.status_code, 200)
        category = get_response.json()
        self.assertEqual(category['name'], 'Pressure Level')
        self.assertEqual(category['detail_type'], 'stacked-bar')

    def test_delete_category(self):
        # Create a category first
        data = {
            'name': 'Weight',
            'detail_type': 'time',
        }

        create_response = self.client.post('/sensordata/categories/', data=data, format='json')
        self.assertEqual(create_response.status_code, 201)

        category_id = create_response.json().get('id')

        # Delete the category
        delete_response = self.client.delete(f'/sensordata/categories/{category_id}/')
        self.assertEqual(delete_response.status_code, 204)  # Expecting a successful delete status code

        # Verify the category is deleted
        get_response = self.client.get(f'/sensordata/categories/{category_id}/')
        self.assertEqual(get_response.status_code, 404)  # Expecting a not found status code


class SensorStreamDatapointApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.sensor_data = {
          "name": "Reifsteck",
          "geog": "POINT(35.6895 139.6917)",
          "created": "2023-07-24T17:14:47.783Z",
          "parameters": [
            "nitrogen",
            "phosphorus"
          ],
          "properties": {},
          "min_start_time": "2023-04-24T17:14:47.783Z",
          "max_end_time": "2024-04-24T17:14:47.783Z"
}
        self.stream_data = {
          "name": "RS-2",
          "geog": "POINT(35.6895 139.6917)",
          "created": "2023-07-24T17:14:47.783Z",
          "parameters": [
            "nitrogen",
            "phosphorus"
          ],
          "properties": {},
          "min_start_time": "2023-04-24T17:14:47.783Z",
          "max_end_time": "2024-04-24T17:14:47.783Z",
          "sensor": 1
        }
        self.datapoint_data = {
            "stream": 1,  # Assuming you have a stream with ID 1 in the database
            "geog": "POINT(40.7128 -74.0060)",
            "time": "2023-06-01 09:00:00+00",
            "data": {"nitrogen": 1.23, "phosphorus": 0.45},
        }

    def create_sensor_via_api(self):
        url = '/sensordata/sensors/'
        response = self.client.post(url, data=self.sensor_data, format="json")
        print(response)
        self.assertEqual(response.status_code, 201)
        return response.json()

    def test_create_sensor(self):
        sensor_data = self.create_sensor_via_api()
        sensor_id = sensor_data["id"]
        url = f'/sensordata/sensors/{sensor_id}'
        response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], self.sensor_data["name"])

    def test_delete_sensor(self):
        sensor_data = self.create_sensor_via_api()
        sensor_id = sensor_data["id"]
        url = url = f'/sensordata/sensors/{sensor_id}/'
        response = self.client.delete(url, follow=True)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Sensor.objects.count(), 0)

    def create_stream_via_api(self):
        sensor_data = self.create_sensor_via_api()
        self.stream_data["sensor"] = sensor_data["id"]
        url = '/sensordata/streams/'
        response = self.client.post(url, data=self.stream_data, format="json")
        self.assertEqual(response.status_code, 201)
        return response.json()

    def test_create_stream(self):
        stream_data = self.create_stream_via_api()
        stream_id = stream_data["id"]
        url = f'/sensordata/streams/{stream_id}'
        response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], self.stream_data["name"])

    def test_delete_stream(self):
        stream_data = self.create_stream_via_api()
        stream_id = stream_data["id"]
        url = f'/sensordata/streams/{stream_id}/'
        response = self.client.delete(url, follow=True)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Stream.objects.count(), 0)

    def create_datapoint_via_api(self):
        stream_data = self.create_stream_via_api()
        self.datapoint_data["stream"] = stream_data["id"]
        url = '/sensordata/datapoints/'
        response = self.client.post(url, data=self.datapoint_data, format="json")
        self.assertEqual(response.status_code, 201)
        return response.json()

    def test_create_datapoint(self):
        datapoint_data = self.create_datapoint_via_api()
        datapoint_id = datapoint_data["id"]
        url = f'/sensordata/datapoints/{datapoint_id}'
        response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["data"], self.datapoint_data["data"])

    def test_delete_datapoint(self):
        datapoint_data = self.create_datapoint_via_api()
        datapoint_id = datapoint_data["id"]
        url = f'/sensordata/datapoints/{datapoint_id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Datapoint.objects.count(), 0)
