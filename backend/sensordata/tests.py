import random

from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status


def get_authenticated_client(user=None):
    """
    Helper function to return an authenticated client with an API key in the header

    Args:
        user (User): User object to authenticate
    """

    client = APIClient()
    if user is None:
        user = get_user_model().objects.create_user(
            username="testuser", password="testpassword"
        )
    client.force_authenticate(user=user)

    # Request the API key using the authenticated user
    response = client.post("/auth/generate-api-key/")
    api_key = response.json().get("key")

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {api_key}")

    return client


class SensorApiTest(TestCase):
    def setUp(self):
        self.client = get_authenticated_client()

    def test_create_sensor(self):
        data = {
            "name": "NCSA Sensor 1",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        response = self.client.post("/data/sensors/", data=data, format="json")
        self.assertEqual(response.status_code, 201)
        sensor_id = response.json().get("id")

        # Verify the created sensor by fetching its details
        get_response = self.client.get(f"/data/sensors/{sensor_id}/")
        self.assertEqual(get_response.status_code, 200)
        sensor = get_response.json()
        self.assertEqual(sensor["name"], "NCSA Sensor 1")
        self.assertEqual(sensor["geometry"]["type"], "Point")
        self.assertEqual(
            sensor["geometry"]["coordinates"], [-88.290075, 40.0062722, 0.0]
        )
        self.assertEqual(sensor["min_start_time"], None)

    def test_get_all_sensors(self):
        # No sensors check
        response = self.client.get("/data/sensors/")
        self.assertEqual(response.status_code, 404)
        sensors = response.json()

        # Create a sensor first
        data = {
            "name": "NCSA Sensor 1",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        self.client.post("/data/sensors/", data=data, format="json")

        response = self.client.get("/data/sensors/")
        self.assertEqual(response.status_code, 200)
        sensors = response.json()
        self.assertIsInstance(sensors["sensors"], list)

    def test_update_sensor(self):
        # Create a sensor first
        data = {
            "name": "NCSA Sensor 2",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }
        response = self.client.post("/data/sensors/", data=data, format="json")
        self.assertEqual(response.status_code, 201)

        sensor_id = response.json().get("id")

        # Update the sensor
        updated_data = {
            "name": "NCSA Sensor 3 ",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.213772, 39.889292, 0.0]},
            "properties": {},
        }

        update_response = self.client.put(
            f"/data/sensors/{sensor_id}/", data=updated_data, format="json"
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Verify the updated sensor
        get_response = self.client.get(f"/data/sensors/{sensor_id}/")
        self.assertEqual(get_response.status_code, 200)
        sensor = get_response.json()
        self.assertEqual(sensor["name"], "NCSA Sensor 3")
        self.assertEqual(sensor["geometry"]["type"], "Point")
        self.assertEqual(
            sensor["geometry"]["coordinates"], [-88.213772, 39.889292, 0.0]
        )

    # In built patch function, when you only want to update a few fields, use the patch method.
    def test_patch_sensor(self):
        # Create a sensor first
        data = {
            "name": "NCSA Sensor 2",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }
        response = self.client.post("/data/sensors/", data=data, format="json")
        self.assertEqual(response.status_code, 201)

        sensor_id = response.json().get("id")

        # Update the sensor
        updated_data = {
            "geometry": {"type": "Point", "coordinates": [-88.213772, 39.889292, 0.0]},
            "properties": {},
        }

        update_response = self.client.patch(
            f"/data/sensors/{sensor_id}/", data=updated_data, format="json"
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Verify the updated sensor
        get_response = self.client.get(f"/data/sensors/{sensor_id}/")
        self.assertEqual(get_response.status_code, 200)
        sensor = get_response.json()
        self.assertEqual(
            sensor["geometry"]["coordinates"], [-88.213772, 39.889292, 0.0]
        )

    def test_delete_sensor(self):
        # Create a sensor first
        data = {
            "name": "NCSA Sensor 2",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        create_response = self.client.post("/data/sensors/", data=data, format="json")
        self.assertEqual(create_response.status_code, 201)

        sensor_id = create_response.json().get("id")

        # Delete the sensor
        delete_response = self.client.delete(f"/data/sensors/{sensor_id}/")
        self.assertEqual(delete_response.status_code, 204)

    def test_get_sensor_geojson(self):
        # Create a sensor first
        data = {
            "name": "NCSA Sensor 1",
            "source": "NCSA",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        create_response = self.client.post("/data/sensors/", data=data, format="json")
        self.assertEqual(create_response.status_code, 201)

        response = self.client.get("/data/sensors/?type=geojson")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        # Check the keys of the first item
        self.assertEqual(
            list(response.json()[0].keys()), ["type", "geometry", "properties"]
        )
        self.assertEqual(response.json()[0]["type"], "Feature")
        self.assertEqual(response.json()[0]["geometry"]["type"], "Point")
        self.assertEqual(response.json()[0]["properties"]["name"], "NCSA Sensor 1")
        self.assertEqual(response.json()[0]["properties"]["source"], "NCSA")


class StreamApiTest(TestCase):
    def setUp(self):
        self.client = get_authenticated_client()
        # Create a sensor first
        data = {
            "name": "NCSA Sensor 1",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {
                "name": "NCSA Sensor 1",
                "popupContent": "NCSA Sensor 1",
                "region": "NCSA Sensor 1",
                "type": {"id": "field", "title": "Field Data"},
            },
        }

        response = self.client.post("/data/sensors/", data=data, format="json")
        self.sensor_id = response.json().get("id")

    def test_create_stream(self):
        data = {
            "name": "NCSA Stream 1",
            "geotype": "Feature",
            "sensor": self.sensor_id,
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        response = self.client.post("/data/streams/", data=data, format="json")
        self.assertEqual(response.status_code, 201)
        stream_id = response.json().get("id")

        # Verify the created stream by fetching its details
        get_response = self.client.get(f"/data/streams/{stream_id}/")
        self.assertEqual(get_response.status_code, 200)
        stream = get_response.json()
        self.assertEqual(stream["name"], "NCSA Stream 1")

    def test_get_all_streams(self):
        response = self.client.get("/data/streams/")
        self.assertEqual(response.status_code, 404)

        # Create a stream first
        data = {
            "name": "NCSA Stream 1",
            "geotype": "Feature",
            "sensor": self.sensor_id,
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        self.client.post("/data/streams/", data=data, format="json")

        response = self.client.get("/data/streams/")
        self.assertEqual(response.status_code, 200)
        streams = response.json()
        self.assertIsInstance(streams["streams"], list)

    def test_update_stream(self):
        # Create a stream first
        data = {
            "name": "NCSA Stream 1",
            "geotype": "Feature",
            "sensor": self.sensor_id,
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }
        response = self.client.post("/data/streams/", data=data, format="json")
        self.assertEqual(response.status_code, 201)

        stream_id = response.json().get("id")

        # Update the stream
        updated_data = {
            "name": "NCSA Stream 2",
            "geometry": {"type": "Point", "coordinates": [-88.213772, 39.889292, 0.0]},
            "properties": {},
            "sensor": self.sensor_id,
        }

        update_response = self.client.put(
            f"/data/streams/{stream_id}/", data=updated_data, format="json"
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Verify the updated stream
        get_response = self.client.get(f"/data/streams/{stream_id}/")
        self.assertEqual(get_response.status_code, 200)
        stream = get_response.json()
        self.assertEqual(stream["name"], "NCSA Stream 2")
        self.assertEqual(
            stream["geometry"]["coordinates"], [-88.213772, 39.889292, 0.0]
        )

    def test_delete_stream(self):
        # Create a stream first
        data = {
            "name": "NCSA Stream 1",
            "geotype": "Feature",
            "sensor": self.sensor_id,
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        create_response = self.client.post("/data/streams/", data=data, format="json")
        self.assertEqual(create_response.status_code, 201)

        stream_id = create_response.json().get("id")

        # Delete the stream
        delete_response = self.client.delete(f"/data/streams/{stream_id}/")
        self.assertEqual(delete_response.status_code, 204)

    def test_patch_stream(self):
        # Create another sensor
        data = {
            "name": "NCSA Sensor 2",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }

        response = self.client.post("/data/sensors/", data=data, format="json")
        second_sensor = response.json().get("id")

        # Create a stream first
        data = {
            "name": "NCSA Stream 1",
            "geotype": "Feature",
            "sensor": self.sensor_id,
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }
        response = self.client.post("/data/streams/", data=data, format="json")
        self.assertEqual(response.status_code, 201)

        stream_id = response.json().get("id")

        # Update the stream
        updated_data = {
            "geometry": {"type": "Point", "coordinates": [-88.213772, 39.889292, 0.0]},
            "properties": {},
            "sensor": second_sensor,
        }

        update_response = self.client.patch(
            f"/data/streams/{stream_id}/", data=updated_data, format="json"
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Verify the updated stream
        get_response = self.client.get(f"/data/streams/{stream_id}/")
        self.assertEqual(get_response.status_code, 200)
        stream = get_response.json()
        self.assertEqual(
            stream["geometry"]["coordinates"], [-88.213772, 39.889292, 0.0]
        )
        self.assertEqual(stream["sensor"], second_sensor)


class VisualizationApiTest(TestCase):
    def setUp(self):
        self.client = get_authenticated_client()

    def test_create_visualization(self):
        data = {
            "name": "Line Chart",
            "title": "A line chart visualization",
        }

        response = self.client.post("/data/visualizations/", data=data, format="json")
        self.assertEqual(
            response.status_code, 201
        )  # Expecting a successful creation status code
        visualization_id = response.json().get("id")

        # Verify the created visualization by fetching its details
        get_response = self.client.get(f"/data/visualizations/{visualization_id}/")
        self.assertEqual(
            get_response.status_code, 200
        )  # Expecting a successful retrieval status code
        visualization = get_response.json()
        self.assertEqual(visualization["name"], "Line Chart")
        self.assertEqual(visualization["title"], "A line chart visualization")

    def test_get_all_visualizations(self):
        response = self.client.get("/data/visualizations/")
        self.assertEqual(
            response.status_code, 200
        )  # Expecting a successful retrieval status code
        visualizations = response.json()
        self.assertIsInstance(visualizations, list)

    def test_update_visualization(self):
        # Create a visualization first
        data = {
            "name": "Bar Chart",
            "title": "A bar chart visualization",
        }

        create_response = self.client.post(
            "/data/visualizations/", data=data, format="json"
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        visualization_id = create_response.json().get("id")

        # Update the visualization
        updated_data = {
            "name": "Bar Chart Updated",
            "title": "An updated bar chart visualization",
        }

        update_response = self.client.put(
            f"/data/visualizations/{visualization_id}/",
            data=updated_data,
            format="json",
        )
        self.assertEqual(
            update_response.status_code, 200
        )  # Expecting a successful update status code

        # Verify the updated visualization
        get_response = self.client.get(f"/data/visualizations/{visualization_id}/")
        self.assertEqual(get_response.status_code, 200)
        visualization = get_response.json()
        self.assertEqual(visualization["name"], "Bar Chart Updated")
        self.assertEqual(visualization["title"], "An updated bar chart visualization")

    def test_delete_visualization(self):
        # Create a visualization first
        data = {
            "name": "Pie Chart",
            "title": "A pie chart visualization",
        }

        create_response = self.client.post(
            "/data/visualizations/", data=data, format="json"
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        visualization_id = create_response.json().get("id")

        # Delete the visualization
        delete_response = self.client.delete(
            f"/data/visualizations/{visualization_id}/"
        )
        self.assertEqual(
            delete_response.status_code, 204
        )  # Expecting a successful delete status code

        # Verify the visualization is deleted
        get_response = self.client.get(f"/data/visualizations/{visualization_id}/")
        self.assertEqual(
            get_response.status_code, 404
        )  # Expecting a not found status code


class CategoryApiTest(TestCase):
    def setUp(self):
        self.client = get_authenticated_client()

    def test_create_category(self):
        data = {
            "name": "Temperature",
            "description": "Temperature data",
        }

        response = self.client.post("/data/categories/", data=data, format="json")
        self.assertEqual(
            response.status_code, 201
        )  # Expecting a successful creation status code
        category_id = response.json().get("id")

        # Verify the created category by fetching its details
        get_response = self.client.get(f"/data/categories/{category_id}/")
        self.assertEqual(
            get_response.status_code, 200
        )  # Expecting a successful retrieval status code
        category = get_response.json()
        self.assertEqual(category["name"], "Temperature")
        self.assertEqual(category["description"], "Temperature data")

    def test_get_all_categories(self):
        response = self.client.get("/data/categories/")
        self.assertEqual(
            response.status_code, 200
        )  # Expecting a successful retrieval status code
        categories = response.json()
        self.assertIsInstance(categories, list)

    def test_update_category(self):
        # Create a category first
        data = {
            "name": "Pressure",
            "description": "stacked-line",
        }

        create_response = self.client.post(
            "/data/categories/", data=data, format="json"
        )
        self.assertEqual(create_response.status_code, 201)

        category_id = create_response.json().get("id")

        # Update the category
        updated_data = {
            "name": "Pressure Level",
            "description": "Pressure data",
        }

        update_response = self.client.put(
            f"/data/categories/{category_id}/", data=updated_data, format="json"
        )
        self.assertEqual(
            update_response.status_code, 200
        )  # Expecting a successful update status code

        # Verify the updated category
        get_response = self.client.get(f"/data/categories/{category_id}/")
        self.assertEqual(get_response.status_code, 200)
        category = get_response.json()
        self.assertEqual(category["name"], "Pressure Level")
        self.assertEqual(category["description"], "Pressure data")

    def test_delete_category(self):
        # Create a category first
        data = {"name": "Weight", "description": "Weight of different elements"}

        create_response = self.client.post(
            "/data/categories/", data=data, format="json"
        )
        self.assertEqual(create_response.status_code, 201)

        category_id = create_response.json().get("id")

        # Delete the category
        delete_response = self.client.delete(f"/data/categories/{category_id}/")
        self.assertEqual(
            delete_response.status_code, 204
        )  # Expecting a successful delete status code

        # Verify the category is deleted
        get_response = self.client.get(f"/data/categories/{category_id}/")
        self.assertEqual(
            get_response.status_code, 404
        )  # Expecting a not found status code


class ParameterApiTest(TestCase):
    def setUp(self):
        self.client = get_authenticated_client()

        # Create visualization
        visualization_data = {
            "name": "line_chart",
            "title": "A line chart visualization",
        }
        self.client.post(
            "/data/visualizations/", data=visualization_data, format="json"
        )
        # Create another visualization
        visualization_data = {
            "name": "bar_chart",
            "title": "A bar chart visualization",
        }
        self.client.post(
            "/data/visualizations/", data=visualization_data, format="json"
        )

        # Create category
        category_data = {
            "name": "environment",
            "description": "Environmental Parameters",
        }
        self.client.post("/data/categories/", data=category_data, format="json")

    def test_create_parameter(self):
        data = {
            "name": "temperature",
            "title": "Temperature",
            "unit": "Celsius",
            "search_view": True,
            "explore_view": False,
            "visualization": "line_chart",
            "category": "environment",
        }

        response = self.client.post("/data/parameters/", data=data, format="json")
        self.assertEqual(response.status_code, 201)
        parameter_id = response.json().get("id")

        # Verify the created parameter by fetching its details
        get_response = self.client.get(f"/data/parameters/{parameter_id}/")
        self.assertEqual(get_response.status_code, 200)
        parameter = get_response.json()
        self.assertEqual(parameter["name"], "temperature")
        self.assertEqual(parameter["unit"], "Celsius")
        # Verify the parameter now includes categories
        self.assertIn("categories", parameter)
        self.assertIsInstance(parameter["categories"], list)

    def test_get_all_parameters(self):
        self.test_create_parameter()
        response = self.client.get("/data/parameters/")
        self.assertEqual(
            response.status_code, 200
        )  # Expecting a successful retrieval status code
        parameters = response.json()

        # Verify the simplified response structure
        self.assertIsInstance(parameters["parameters"], list)
        self.assertGreater(len(parameters["parameters"]), 0)

        # Verify each parameter has the expected structure with embedded categories
        first_parameter = parameters["parameters"][0]
        self.assertIn("id", first_parameter)
        self.assertIn("name", first_parameter)
        self.assertIn("categories", first_parameter)
        self.assertIsInstance(first_parameter["categories"], list)

    def test_get_all_parameters_with_filtering(self):
        # Create a parameter to ensure there's at least one in the database
        self.test_create_parameter()

        # Test filtering by name
        response = self.client.get("/data/parameters/?name=temperature")
        self.assertEqual(response.status_code, 200)
        parameters_response = response.json()

        # Verify the simplified response structure
        self.assertIn("parameters", parameters_response)
        parameters = parameters_response["parameters"]
        self.assertIsInstance(parameters, list)
        self.assertEqual(len(parameters), 1)
        self.assertEqual(parameters[0]["name"], "temperature")

        # Verify the parameter includes embedded categories
        self.assertIn("categories", parameters[0])
        self.assertIsInstance(parameters[0]["categories"], list)
        if len(parameters[0]["categories"]) > 0:
            category = parameters[0]["categories"][0]
            self.assertIn("name", category)
            self.assertIn("description", category)
            self.assertEqual(category["name"], "environment")

    def test_update_parameter(self):
        # Create a parameter first
        data = {
            "name": "pressure",
            "title": "Pressure",
            "unit": "Pascal",
            "search_view": False,
            "explore_view": True,
            "scale_names": ["Low", "Medium", "High"],
            "scale_colors": ["#FF0000", "#00FF00", "#0000FF"],
            "category": "environment",
            "visualization": "line_chart",
        }

        create_response = self.client.post(
            "/data/parameters/", data=data, format="json"
        )
        self.assertEqual(create_response.status_code, 201)

        parameter_id = create_response.json().get("id")

        # Update the parameter
        updated_data = {
            "name": "air_pressure",
            "title": "Pressure Level",
            "unit": "Pa",
            "search_view": False,
            "explore_view": True,
            "scale_names": ["Low", "Medium", "High"],
            "scale_colors": ["#FF0000", "#00FF00", "#0000FF"],
            "visualization": "bar_chart",
        }

        update_response = self.client.put(
            f"/data/parameters/{parameter_id}/", data=updated_data, format="json"
        )
        self.assertEqual(
            update_response.status_code, 200
        )  # Expecting a successful update status code

        # Verify the updated parameter
        get_response = self.client.get(f"/data/parameters/{parameter_id}/")
        self.assertEqual(get_response.status_code, 200)
        parameter = get_response.json()
        self.assertEqual(parameter["title"], "Pressure Level")
        self.assertEqual(parameter["unit"], "Pa")

        # Verify categories are still embedded
        self.assertIn("categories", parameter)
        self.assertIsInstance(parameter["categories"], list)

    def test_delete_parameter(self):
        # Create a parameter first
        data = {
            "name": "temperature",
            "title": "Temperature",
            "unit": "Celsius",
            "search_view": True,
            "explore_view": False,
            "visualization": "line_chart",
            "category": "environment",
        }

        create_response = self.client.post(
            "/data/parameters/", data=data, format="json"
        )
        self.assertEqual(create_response.status_code, 201)

        parameter_id = create_response.json().get("id")

        # Delete the parameter
        delete_response = self.client.delete(f"/data/parameters/{parameter_id}/")
        self.assertEqual(
            delete_response.status_code, 204
        )  # Expecting a successful delete status code

        # Verify the parameter is deleted
        get_response = self.client.get(f"/data/parameters/{parameter_id}/")
        self.assertEqual(
            get_response.status_code, 404
        )  # Expecting a not found status code


# Using TransactionTestCase to see the data in the database
class DatapointsViewSetTestCase(TransactionTestCase):
    def setUp(self):
        self.client = get_authenticated_client()
        # Add any necessary setup code here (e.g., create Sensor and Datapoint instances)
        # Create visualization
        visualization_data = {
            "name": "line_chart",
            "title": "A line chart visualization",
        }
        self.client.post(
            "/data/visualizations/", data=visualization_data, format="json"
        )
        # Create category
        category_data = {
            "name": "air_quality",
            "title": "Air Quality",
        }
        self.client.post("/data/categories/", data=category_data, format="json")
        # Create parameters
        parameter_data = [
            {
                "name": "nitrogen",
                "title": "nitrogen",
                "unit": "%",
                "visualization": "line_chart",
                "category": "air_quality",
            },
            {
                "name": "phosphorus",
                "title": "phosphorus",
                "unit": "%",
                "visualization": "line_chart",
                "category": "air_quality",
            },
        ]
        for parameter in parameter_data:
            self.client.post("/data/parameters/", data=parameter, format="json")

        # Create a sensor
        sensor_data = {
            "name": "NCSA Sensor 1",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }
        sensor_data = self.client.post(
            "/data/sensors/", data=sensor_data, format="json"
        )
        # Create a stream
        stream_data = [
            {
                "name": "NCSA Stream 1",
                "geotype": "Feature",
                "sensor": sensor_data.data["id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": [-88.290075, 40.0062722, 0.0],
                },
                "properties": {},
            },
            {
                "name": "NCSA Stream 2",
                "geotype": "Feature",
                "sensor": sensor_data.data["id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": [-88.213772, 39.889292, 0.0],
                },
                "properties": {},
            },
        ]
        stream_ids = []
        for stream in stream_data:
            stream = self.client.post("/data/streams/", data=stream, format="json")
            stream_ids.append(stream.data["id"])
        # Create datapoints
        datapoint_data = [
            {
                "time": "2023-06-01T09:00:00Z",
                "data": {"nitrogen": 1.23, "phosphorus": 0.45},
            },
            {
                "time": "2023-06-01T12:00:00Z",
                "data": {"nitrogen": 0.75, "phosphorus": 1.1},
            },
            {
                "time": "2023-06-01T16:00:00Z",
                "data": {"nitrogen": 0.91, "phosphorus": 0.82},
            },
            {
                "time": "2023-06-01T18:00:00Z",
                "data": {"nitrogen": 1.55, "phosphorus": 0.98},
            },
            {
                "time": "2023-06-01T09:30:00Z",
                "data": {"nitrogen": 0.65, "phosphorus": 1.25},
            },
            {
                "time": "2023-06-01T11:30:00Z",
                "data": {"nitrogen": 1.1, "phosphorus": 0.75},
            },
            {
                "time": "2023-06-01T13:30:00Z",
                "data": {"nitrogen": 0.95, "phosphorus": 0.82},
            },
            {
                "time": "2023-06-01T15:30:00Z",
                "data": {"nitrogen": 1.35, "phosphorus": 0.93},
            },
            {
                "time": "2023-06-01T17:30:00Z",
                "data": {"nitrogen": 0.78, "phosphorus": 1.02},
            },
            {
                "geog": "SRID=4326;POINT (51.5074 -0.1278 0)",
                "time": "2023-05-01T16:00:00Z",
                "data": {"nitrogen": 0.31, "phosphorus": 0.22},
            },
        ]
        for datapoint in datapoint_data:
            datapoint["stream"] = random.choice(stream_ids)
        # Create a datapoint
        self.client.post("/data/datapoints/", data=datapoint_data[0], format="json")
        # Bulk create datapoints
        self.client.post("/data/datapoints/", data=datapoint_data[1:], format="json")

        # Refresh cache
        self.client.post(
            "/data/cache/refresh/", data={"time_period": "all"}, format="json"
        )

    def test_get_hourly_average_datapoints_by_parameter(self):
        sensor = self.client.get("/data/sensors/").data["sensors"][0]
        sensor_id = sensor["id"]
        sensor_name = sensor["name"]
        parameter = self.client.get("/data/parameters/").data["parameters"][0]["name"]
        response = self.client.get(
            "/data/cache/hour/", data={"sensor_id": sensor_id, "parameter": parameter}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, dict)
        self.assertEqual("sensor_name" in data, True)
        self.assertEqual(data["sensor_name"], sensor_name)
        self.assertEqual(len(data["properties"]) > 0, True)
        self.assertEqual(len(data["streams"]) > 0, True)
        # Check streams are in the streams dictionary
        self.assertEqual(len(data["streams"]) == 2, True)

    def test_get_daily_average_datapoints_by_parameter(self):
        sensor = self.client.get("/data/sensors/").data["sensors"][0]
        sensor_id = sensor["id"]
        sensor_name = sensor["name"]
        parameter = self.client.get("/data/parameters/").data["parameters"][0]["name"]

        response = self.client.get(
            "/data/cache/day/", data={"sensor_id": sensor_id, "parameter": parameter}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, dict)
        self.assertEqual("sensor_name" in data, True)
        self.assertEqual(data["sensor_name"], sensor_name)
        # Check properties is not empty
        self.assertEqual(len(data["properties"]) > 0, True)
        self.assertEqual(len(data["streams"]) == 2, True)
        # Check properties is a dictionary
        self.assertIsInstance(data["properties"], dict)

    def test_get_monthly_average_datapoints_by_parameter(self):
        sensor = self.client.get("/data/sensors/").data["sensors"][0]
        sensor_id = sensor["id"]
        sensor_name = sensor["name"]
        parameter = self.client.get("/data/parameters/").data["parameters"][0]["name"]
        response = self.client.get(
            "/data/cache/month/", data={"sensor_id": sensor_id, "parameter": parameter}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, dict)
        self.assertEqual("sensor_name" in data, True)
        self.assertEqual(data["sensor_name"], sensor_name)
        # Check properties is not empty
        self.assertEqual(len(data["properties"]) > 0, True)
        self.assertEqual(len(data["streams"]) == 2, True)
        # Check properties is a dictionary
        self.assertIsInstance(data["properties"], dict)

    def test_get_yearly_average_datapoints_by_parameter(self):
        sensor = self.client.get("/data/sensors/").data["sensors"][0]
        sensor_id = sensor["id"]
        sensor_name = sensor["name"]
        parameter = self.client.get("/data/parameters/").data["parameters"][0]["name"]
        response = self.client.get(
            "/data/cache/year/", data={"sensor_id": sensor_id, "parameter": parameter}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual("sensor_name" in data, True)
        self.assertEqual(data["sensor_name"], sensor_name)
        # Check properties is not empty
        self.assertEqual(len(data["properties"]) > 0, True)
        self.assertEqual(len(data["streams"]) == 2, True)
        # Check properties is a dictionary
        self.assertIsInstance(data["properties"], dict)


class SensorInShapeTestCase(TestCase):
    def setUp(self):
        self.client = get_authenticated_client()

        # Create first sensor
        sensor_data = {
            "name": "NCSA Sensor 1",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }
        self.client.post("/data/sensors/", data=sensor_data, format="json")

        # Create second sensor
        sensor_data = {
            "name": "NCSA Sensor 2",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.154722, 39.883611, 0.0]},
            "properties": {},
        }

        self.client.post("/data/sensors/", data=sensor_data, format="json")

        # Create third sensor
        sensor_data = {
            "name": "NCSA Sensor 3",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.213772, 39.889292, 0.0]},
            "properties": {},
        }

        self.client.post("/data/sensors/", data=sensor_data, format="json")

    def test_get_sensors_in_polygon(self):
        shape = "polygon"
        wkt = (
            "POLYGON((-88.4584808 40.0034239, -88.4646606 39.4255858, -87.3275757 39.4998022, -87.3577881 "
            "40.4657559, -88.3850098 40.4553072, -88.4584808 40.0034239))"
        )
        buffer = 1

        response = self.client.get(
            "/data/sensors/sensors_in_shape/",
            {"shape": shape, "wkt": wkt, "buffer": buffer},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        sensors = response.json()["sensors"]
        self.assertIsInstance(sensors, list)
        self.assertEqual(len(sensors), 3)  # All sensors should be in the polygon

    def test_get_sensors_in_circle(self):
        shape = "circle"
        wkt = "POINT(-88.290075 40.0062722)"
        buffer = 16  # 16 km radius

        response = self.client.get(
            "/data/sensors/sensors_in_shape/",
            {"shape": shape, "wkt": wkt, "buffer": buffer},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        sensors = response.json()["sensors"]
        self.assertIsInstance(sensors, list)
        self.assertEqual(len(sensors), 2)  # Two sensors should be in the circle


# Edge Case Datapoint Test
class EdgeCaseDatapointTestCase(TransactionTestCase):
    def setUp(self):
        self.client = get_authenticated_client()

        # Create visualization
        visualization_data = {
            "name": "line_chart",
            "title": "A line chart visualization",
        }
        self.client.post(
            "/data/visualizations/", data=visualization_data, format="json"
        )
        # Create category
        category_data = {
            "name": "environment",
            "title": "Environment",
        }
        self.client.post("/data/categories/", data=category_data, format="json")
        # Create a parameter
        parameter_data = {
            "name": "Temperature",
            "unit": "Celsius",
            "visualization": "line_chart",
            "category": "environment",
        }
        self.client.post("/data/parameters/", data=parameter_data, format="json")

        # Create a sensor
        sensor_data = {
            "name": "NCSA Sensor 1",
            "geotype": "Feature",
            "geometry": {"type": "Point", "coordinates": [-88.290075, 40.0062722, 0.0]},
            "properties": {},
        }
        sensor_data = self.client.post(
            "/data/sensors/", data=sensor_data, format="json"
        )
        self.sensor_id = sensor_data.data["id"]
        # Create a stream
        stream_data = {
            "name": "NCSA Stream 1",
            "geotype": "Feature",
            "sensor": self.sensor_id,
            "geometry": {
                "type": "Point",
                "coordinates": [-88.290075, 40.0062722, 0.0],
            },
            "properties": {},
        }
        stream = self.client.post("/data/streams/", data=stream_data, format="json")
        stream_id = stream.data["id"]

        # Create multiple datapoints in the same hour
        base_time = "2024-01-01T10:00:00Z"
        datapoints = [
            {"stream": stream_id, "time": base_time, "data": {"Temperature": 20.0}},
            {
                "stream": stream_id,
                "time": "2024-01-01T10:15:00Z",
                "data": {"Temperature": 22.0},
            },
            {
                "stream": stream_id,
                "time": "2024-01-01T10:30:00Z",
                "data": {"Temperature": 24.0},
            },
            {
                "stream": stream_id,
                "time": "2024-01-01T10:45:00Z",
                "data": {"Temperature": 26.0},
            },
        ]

        self.client.post("/data/datapoints/", data=datapoints, format="json")

        # Refresh aggregates to ensure data is available
        self.client.post(
            "/data/cache/refresh/", data={"time_period": "all"}, format="json"
        )

    def test_get_hourly_average_datapoints_same_hour(self):
        # Get hourly averages
        response = self.client.get(
            "/data/cache/hour/",
            {
                "sensor_id": self.sensor_id,
                "parameter": ["Temperature"],
                "since": "2024-01-01T00:00:00Z",
                "until": "2024-01-01T23:59:59Z",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        # Verify we get exactly one hourly average
        self.assertIn("Temperature", data["properties"])
        hourly_data = data["properties"]["Temperature"]
        self.assertEqual(len(hourly_data), 1)

        # Verify the average is correct (should be 23.0)
        self.assertEqual(hourly_data[0]["average"], 23.0)
        self.assertEqual(hourly_data[0]["count"], 4)

    def test_get_daily_average_datapoints_same_hour(self):
        # Get Daily averages
        response = self.client.get(
            "/data/cache/day/",
            {
                "sensor_id": self.sensor_id,
                "parameter": ["Temperature"],
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("Temperature", data["properties"])
        daily_data = data["properties"]["Temperature"]
        self.assertEqual(len(daily_data), 1)
        self.assertEqual(daily_data[0]["average"], 23.0)
        self.assertEqual(daily_data[0]["count"], 4)

    def test_get_monthly_average_datapoints_same_hour(self):
        # Get Monthly averages
        response = self.client.get(
            "/data/cache/month/",
            {
                "sensor_id": self.sensor_id,
                "parameter": ["Temperature"],
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("Temperature", data["properties"])
        monthly_data = data["properties"]["Temperature"]
        self.assertEqual(len(monthly_data), 1)
        self.assertEqual(monthly_data[0]["average"], 23.0)
        self.assertEqual(monthly_data[0]["count"], 4)

    def test_get_yearly_average_datapoints_same_hour(self):
        # Get Yearly averages
        response = self.client.get(
            "/data/cache/year/",
            {
                "sensor_id": self.sensor_id,
                "parameter": ["Temperature"],
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("Temperature", data["properties"])
        yearly_data = data["properties"]["Temperature"]
        self.assertEqual(len(yearly_data), 1)
        self.assertEqual(yearly_data[0]["average"], 23.0)
        self.assertEqual(yearly_data[0]["count"], 4)
