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
     * @param {{ sensorId?: number, parameter?: string, timePeriod: string, since?: string, until?: string }} params
     */
    const fetchAggregates = useCallback(async (params) => {
        const {
            timePeriod = "day",
            sensorId,
            parameter,
            since,
            until,
        } = params;
        const path = TIME_PERIOD_PATHS[timePeriod];
        if (!path) {
            setError(`Invalid time period: ${timePeriod}`);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const queryParams = {};
            if (sensorId) queryParams.sensor_id = sensorId;
            if (parameter) queryParams.parameter = parameter;
            if (since) queryParams.since = since;
            if (until) queryParams.until = until;

            const response = await publicApi.get(path, { params: queryParams });
            setData(response.data || []);
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
