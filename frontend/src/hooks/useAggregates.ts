import { useState, useCallback } from "react";
import { publicApi, getErrorMessage } from "../api/apiClient";
import type {
    Aggregate,
    AggregateParams,
    AggregateRow,
    TimePeriod,
} from "../types/api";

const TIME_PERIOD_PATHS: Record<TimePeriod, string> = {
    hour: "data/cache/hour/",
    day: "data/cache/day/",
    month: "data/cache/month/",
    year: "data/cache/year/",
};

/**
 * Hook for fetching aggregated (cached) sensor data.
 * All aggregate endpoints are public (no auth needed).
 * Queries are triggered manually via fetchAggregates.
 */
const useAggregates = () => {
    const [data, setData] = useState<AggregateRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useCallback used just in case child components use fetchAggregates as a dependency.
    const fetchAggregates = useCallback(async (params: AggregateParams) => {
        const {
            timePeriod = "day",
            sensorId,
            parameter,
            since,
            until,
            shortened = true,
        } = params;
        const path: string | undefined = TIME_PERIOD_PATHS[timePeriod];
        if (!path) {
            setError(`Invalid time period: ${timePeriod}`);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const queryParams: Record<string, string | number | boolean> = {
                shortened,
            };
            if (sensorId) queryParams.sensor_id = sensorId;
            if (since) queryParams.since = since;
            if (until) queryParams.until = until;

            const serializer = new URLSearchParams();
            Object.entries(queryParams).forEach(([k, v]) =>
                serializer.append(k, String(v)),
            );

            if (parameter) {
                const names = Array.isArray(parameter)
                    ? parameter
                    : [parameter];
                names.forEach((p) => serializer.append("parameter", p));
            }

            const response = await publicApi.get<Aggregate>(path, {
                params: serializer,
            });
            // Response shape: { sensor_name, streams, properties: { [paramName]: [{stream_id, average, date, ...}] } }
            // Flatten into [{parameter, stream_id, average, date, label, ...}] for the chart builder.
            const raw = response.data;
            const flattened: AggregateRow[] = [];
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
            setError(getErrorMessage(err, "Failed to fetch aggregated data"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { data, isLoading, error, fetchAggregates };
};

export default useAggregates;
