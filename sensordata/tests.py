import random

from django.test import TestCase
from rest_framework.test import APIClient


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

        response = self.client.post('/api/parameters/', data=data, format='json')
        self.assertEqual(response.status_code, 201)  # Expecting a successful creation status code
        parameter_id = response.json().get('id')

        # Verify the created parameter by fetching its details
        get_response = self.client.get(f'/api/parameters/{parameter_id}/')
        self.assertEqual(get_response.status_code, 200)  # Expecting a successful retrieval status code
        parameter = get_response.json()
        self.assertEqual(parameter['name'], 'temperature')
        self.assertEqual(parameter['title'], 'Temperature')
        self.assertEqual(parameter['unit'], 'Celsius')

    def test_get_all_parameters(self):
        response = self.client.get('/api/parameters/')
        self.assertEqual(response.status_code, 200)  # Expecting a successful retrieval status code
        parameters = response.json()
        self.assertIsInstance(parameters["parameters"], list)

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

        create_response = self.client.post('/api/parameters/', data=data, format='json')
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

        update_response = self.client.put(f'/api/parameters/{parameter_id}/', data=updated_data, format='json')
        self.assertEqual(update_response.status_code, 200)  # Expecting a successful update status code

        # Verify the updated parameter
        get_response = self.client.get(f'/api/parameters/{parameter_id}/')
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

        create_response = self.client.post('/api/parameters/', data=data, format='json')
        self.assertEqual(create_response.status_code, 201)

        parameter_id = create_response.json().get('id')

        # Delete the parameter
        delete_response = self.client.delete(f'/api/parameters/{parameter_id}/')
        self.assertEqual(delete_response.status_code, 204)  # Expecting a successful delete status code

        # Verify the parameter is deleted
        get_response = self.client.get(f'/api/parameters/{parameter_id}/')
        self.assertEqual(get_response.status_code, 404)  # Expecting a not found status code


class CategoryApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_category(self):
        data = {
            'name': 'Temperature',
            'detail_type': 'time',
        }

        response = self.client.post('/api/categories/', data=data, format='json')
        self.assertEqual(response.status_code, 201)  # Expecting a successful creation status code
        category_id = response.json().get('id')

        # Verify the created category by fetching its details
        get_response = self.client.get(f'/api/categories/{category_id}/')
        self.assertEqual(get_response.status_code, 200)  # Expecting a successful retrieval status code
        category = get_response.json()
        self.assertEqual(category['name'], 'Temperature')
        self.assertEqual(category['detail_type'], 'time')

    def test_get_all_categories(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, 200)  # Expecting a successful retrieval status code
        categories = response.json()
        self.assertIsInstance(categories, list)

    def test_update_category(self):
        # Create a category first
        data = {
            'name': 'Pressure',
            'detail_type': 'stacked-line',
        }

        create_response = self.client.post('/api/categories/', data=data, format='json')
        self.assertEqual(create_response.status_code, 201)

        category_id = create_response.json().get('id')

        # Update the category
        updated_data = {
            'name': 'Pressure Level',
            'detail_type': 'stacked-bar',
        }

        update_response = self.client.put(f'/api/categories/{category_id}/', data=updated_data, format='json')
        self.assertEqual(update_response.status_code, 200)  # Expecting a successful update status code

        # Verify the updated category
        get_response = self.client.get(f'/api/categories/{category_id}/')
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

        create_response = self.client.post('/api/categories/', data=data, format='json')
        self.assertEqual(create_response.status_code, 201)

        category_id = create_response.json().get('id')

        # Delete the category
        delete_response = self.client.delete(f'/api/categories/{category_id}/')
        self.assertEqual(delete_response.status_code, 204)  # Expecting a successful delete status code

        # Verify the category is deleted
        get_response = self.client.get(f'/api/categories/{category_id}/')
        self.assertEqual(get_response.status_code, 404)  # Expecting a not found status code


class DatapointsViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Add any necessary setup code here (e.g., create Sensor and Datapoint instances)
        # Create a sensor
        sensor_data = {
            "name": "Reifsteck",
            "geog": "POINT(35.6895 139.6917 0)",
            "created": "2023-07-24T17:14:47.783Z",
            "parameters": [
                "nitrogen",
                "phosphorus"
            ],
            "properties": {},
            "min_start_time": "2023-04-24T17:14:47.783Z",
            "max_end_time": "2024-04-24T17:14:47.783Z"
        }
        sensor_data = self.client.post('/api/sensors/', data=sensor_data, format='json')
        # Create parameters
        parameter_data = [
            {
                "name": "nitrogen",
                "title": "nitrogen",
                "unit": "%"
            },
            {
                "name": "phosphorus",
                "title": "phosphorus",
                "unit": "%"
            }
        ]
        for parameter in parameter_data:
            self.client.post('/api/parameters/', data=parameter, format='json')
        # Create a stream
        stream_data = [
            {
                "name": "RS-2",
                "geog": "POINT(35.6895 139.6917 0)",
                "created": "2023-07-24T17:14:47.783Z",
                "parameters": [
                    "nitrogen",
                    "phosphorus"
                ],
                "properties": {},
                "min_start_time": "2023-04-24T17:14:47.783Z",
                "max_end_time": "2024-04-24T17:14:47.783Z",
                "sensor": sensor_data.data["id"]
            },
            {
                "name": "RS-2",
                "geog": "SRID=4326;POINT (35.6895 139.6917 0)",
                "created": "2023-07-24T17:14:47.783000Z",
                "parameters": [
                    "nitrogen",
                    "phosphorus"
                ],
                "properties": {},
                "start_time": None,
                "end_time": None,
                "sensor":sensor_data.data["id"]
            }
        ]
        stream_ids = []
        for stream in stream_data:
            stream = self.client.post('/api/streams/', data=stream, format='json')
            stream_ids.append(stream.data["id"])
        # Create datapoints
        datapoint_data = [
                            {
                                "geog": "SRID=4326;POINT (40.7128 -74.006 0)",
                                "time": "2023-06-01T09:00:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 1.23,
                                    "phosphorus": 0.45
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (34.0522 -118.2437 0)",
                                "time": "2023-06-01T12:00:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 0.75,
                                    "phosphorus": 1.1
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (51.5074 -0.1278 0)",
                                "time": "2023-06-01T16:00:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 0.91,
                                    "phosphorus": 0.82
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (37.7749 -122.4194 0)",
                                "time": "2023-06-01T18:00:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 1.55,
                                    "phosphorus": 0.98
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (52.52 13.405 0)",
                                "time": "2023-06-01T09:30:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 0.65,
                                    "phosphorus": 1.25
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (35.6895 139.6917 0)",
                                "time": "2023-06-01T11:30:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 1.1,
                                    "phosphorus": 0.75
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (-33.8651 151.2099 0)",
                                "time": "2023-06-01T13:30:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 0.95,
                                    "phosphorus": 0.82
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (37.9838 23.7275 0)",
                                "time": "2023-06-01T15:30:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 1.35,
                                    "phosphorus": 0.93
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (40.4168 -3.7038 0)",
                                "time": "2023-06-01T17:30:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 0.78,
                                    "phosphorus": 1.02
                                }
                            },
                            {
                                "geog": "SRID=4326;POINT (51.5074 -0.1278 0)",
                                "time": "2023-05-01T16:00:00Z",
                                "end_time": None,
                                "data": {
                                    "nitrogen": 0.31,
                                    "phosphorus": 0.22
                                }
                            }
                        ]
        for datapoint in datapoint_data:
            datapoint['stream'] = random.choice(stream_ids)
            self.client.post('/api/datapoints/', data=datapoint, format='json')

    def test_get_hourly_average_datapoints_by_parameter(self):
        sensor_id = self.client.get('/api/sensors/').data["sensors"][0]['id']
        parameter = self.client.get('/api/parameters/').data['parameters'][0]['name']
        response = self.client.get('/api/cache/hour/', data={'sensor_id': sensor_id, 'parameter': parameter})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, dict)

    def test_get_daily_average_datapoints_by_parameter(self):
        sensor_id = self.client.get('/api/sensors/').data["sensors"][0]['id']
        parameter = self.client.get('/api/parameters/').data['parameters'][0]['name']
        response = self.client.get('/api/cache/day/', data={'sensor_id': sensor_id, 'parameter': parameter})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, dict)

    def test_get_monthly_average_datapoints_by_parameter(self):
        sensor_id = self.client.get('/api/sensors/').data["sensors"][0]['id']
        parameter = self.client.get('/api/parameters/').data['parameters'][0]['name']
        response = self.client.get('/api/cache/month/', data={'sensor_id': sensor_id, 'parameter': parameter})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, dict)

    def test_get_yearly_average_datapoints_by_parameter(self):
        sensor_id = self.client.get('/api/sensors/').data["sensors"][0]['id']
        parameter = self.client.get('/api/parameters/').data['parameters'][0]['name']
        response = self.client.get('/api/cache/year/', data={'sensor_id': sensor_id, 'parameter': parameter})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, dict)
