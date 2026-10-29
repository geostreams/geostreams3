import { useState, useEffect, useCallback } from "react";
import { publicApi } from "../api/apiClient";

/**
 * Hook for fetching a single sensor by ID.
 * GET is public (no auth needed).
 *
 * @param {number|string} id - Sensor ID
 * @returns {{ sensor: object|null, isLoading: boolean, error: string|null, refetch: Function }}
 */
const useSensor = (id) => {
    const [sensor, setSensor] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // useCallback to prevent unnecessary re-renders and unnecessary API calls.
    // Doesn't fetch from API unless the id has changed since the last fetch.
    const fetchSensor = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await publicApi.get(`data/sensors/${id}/`);
            setSensor(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch sensor");
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
