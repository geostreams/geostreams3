/**
 * Response and payload types for the Django REST API.
 * Written from backend/sensordata/serializers.py and
 * backend/authentication/serializers.py / views.py.
 */

/** ISO 8601 timestamp as serialized by DRF. */
export type IsoDateTime = string;

export type JsonObject = Record<string, unknown>;

/** GeoJSON geometry as returned by `json.loads(geog.geojson)`. */
export interface Geometry {
    type: string;
    coordinates: unknown;
}

export interface Pagination {
    count: number;
    limit: number;
    offset: number;
    returned: number;
}

export interface Sensor {
    id: number;
    name: string | null;
    source: string | null;
    geoType: string | null;
    created: IsoDateTime | null;
    geometry: Geometry | null;
    properties: JsonObject;
    /** Unique parameter names across all of the sensor's streams. */
    parameters: string[];
    min_start_time: IsoDateTime | null;
    max_end_time: IsoDateTime | null;
}

export interface Stream {
    id: number;
    sensor: number;
    name: string | null;
    geoType: string | null;
    created: IsoDateTime | null;
    parameters: string[];
    properties: JsonObject;
    start_time: IsoDateTime | null;
    end_time: IsoDateTime | null;
    geometry: Geometry | null;
}

export interface Datapoint {
    id: number;
    created: IsoDateTime | null;
    stream: number;
    sensor_id: number;
    sensor_name: string | null;
    type: string | null;
    time: IsoDateTime;
    /** Parameter primary key. */
    parameter: number;
    value: number | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Visualization {
    id: number;
    name: string;
    title: string | null;
}

export interface ParameterCategory {
    name: string;
    description: string | null;
}

/** Parameter with its unit; `visualization` is the visualization's name. */
export interface Parameter {
    id: number;
    name: string;
    title: string;
    unit: string | null;
    properties: JsonObject | null;
    /** Visualization name; absent from the response when the parameter has none. */
    visualization?: string | null;
    categories: ParameterCategory[];
}

/** Request body for creating or updating a parameter. */
export type ParameterInput = Partial<Omit<Parameter, "id" | "categories">> & {
    categories?: Array<string | number>;
    /** Category name; the backend links the parameter to this category. */
    category?: string;
};

export type CategoryInput = Omit<Category, "id">;
export type VisualizationInput = Omit<Visualization, "id">;

export type SensorInput = Partial<Omit<Sensor, "id">>;
export type StreamInput = Partial<Omit<Stream, "id">>;
export type DatapointInput = JsonObject;

/** Row of the aggregate (cache) endpoints, after flattening by parameter. */
export interface AggregateRow {
    parameter: string;
    stream_id?: number;
    average?: number | null;
    date?: string;
    label?: string;
    [key: string]: unknown;
}

/** Raw response of `data/cache/{hour,day,month,year}/`. */
export interface Aggregate {
    sensor_name?: string;
    streams?: unknown;
    properties: Record<string, Array<Omit<AggregateRow, "parameter">>>;
}

export type TimePeriod = "hour" | "day" | "month" | "year";

export interface AggregateParams {
    sensorId?: number | string;
    parameter?: string | string[];
    timePeriod?: TimePeriod;
    since?: string;
    until?: string;
    shortened?: boolean;
}

/** Response of `auth/generate-api-key/`; `key` is a token issued for the user's API key. */
export interface ApiKey {
    key: string;
}

export interface PaginatedSensors {
    sensors: Sensor[];
    pagination: Pagination;
}

export interface PaginatedStreams {
    streams: Stream[];
    pagination: Pagination;
}

export interface PaginatedDatapoints {
    datapoints: Datapoint[];
    pagination: Pagination;
}

export interface ParametersResponse {
    parameters: Parameter[];
}

export interface CategoriesResponse {
    categories: Category[];
}

export interface VisualizationsResponse {
    visualizations: Visualization[];
}
