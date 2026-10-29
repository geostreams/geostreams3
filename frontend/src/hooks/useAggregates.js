import { useState, useCallback } from "react";
import { publicApi } from "../api/apiClient";

const TIME_PERIOD_PATHS = {
    hour: "data/cache/hour/",
    day: "data/cache/day/",
    month: "data/cache/month/",
    year: "data/cache/year/",
};

/**
 * Hook for fetching aggregated (cached) sensor data.
 * All aggregate endpoints are public (no auth needed).
 * Queries are triggered manually via fetchAggregates.
 * @returns {{ data: Array, isLoading: boolean, error: string|null, fetchAggregates: Function }}
 */
const useAggregates = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * @param {{ sensorId?: number, parameter?: string|string[], timePeriod: string, since?: string, until?: string, shortened?: boolean }} params
     */
    // useCallback used just in case child components use fetchAggregates as a dependency.
    const fetchAggregates = useCallback(async (params) => {
        const {
            timePeriod = "day",
            sensorId,
            parameter,
            since,
            until,
            shortened = true,
        } = params;
        const path = TIME_PERIOD_PATHS[timePeriod];
        if (!path) {
            setError(`Invalid time period: ${timePeriod}`);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const queryParams = { shortened };
            if (sensorId) queryParams.sensor_id = sensorId;
            if (since) queryParams.since = since;
            if (until) queryParams.until = until;

            const serializer = new URLSearchParams();
            Object.entries(queryParams).forEach(([k, v]) =>
                serializer.append(k, v),
            );

            if (parameter) {
                const params = Array.isArray(parameter)
                    ? parameter
                    : [parameter];
                params.forEach((p) => serializer.append("parameter", p));
            }

            const response = await publicApi.get(path, {
                params: serializer,
            });
            // Response shape: { sensor_name, streams, properties: { [paramName]: [{stream_id, average, date, ...}] } }
            // Flatten into [{parameter, stream_id, average, date, label, ...}] for the chart builder.
            const raw = response.data;
            const flattened = [];
            if (raw && raw.properties && typeof raw.properties === "object") {
                Object.entries(raw.properties).forEach(([paramName, rows]) => {
                    if (Array.isArray(rows)) {
                        rows.forEach((row) =>
                            flattened.push({ parameter: paramName, ...row }),
                        );
                    }
                });
            }
            setData(flattened);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to fetch aggregated data",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { data, isLoading, error, fetchAggregates };
};

export default useAggregates;
