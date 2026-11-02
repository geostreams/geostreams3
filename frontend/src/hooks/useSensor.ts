import { useState, useEffect, useCallback } from "react";
import { publicApi, getErrorMessage } from "../api/apiClient";
import type { Sensor } from "../types/api";

/**
 * Hook for fetching a single sensor by ID.
 * GET is public (no auth needed).
 *
 * @param id - Sensor ID
 */
const useSensor = (id?: number | string) => {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useCallback to prevent unnecessary re-renders and unnecessary API calls.
    // Doesn't fetch from API unless the id has changed since the last fetch.
    const fetchSensor = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await publicApi.get<Sensor>(`data/sensors/${id}/`);
            setSensor(response.data);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to fetch sensor"));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSensor();
    }, [fetchSensor]);

    return { sensor, isLoading, error, refetch: fetchSensor };
};

export default useSensor;
