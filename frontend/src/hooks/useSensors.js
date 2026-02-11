import { useState, useEffect, useCallback } from "react";
import { publicApi } from "../api/apiClient";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching, creating, and deleting sensors.
 * GET is public (no auth needed). POST/DELETE require auth.
 * @returns {{ sensors: Array, isLoading: boolean, error: string|null, refetch: Function, createSensor: Function, deleteSensor: Function }}
 */
const useSensors = () => {
    const authApi = useApiClient();
    const [sensors, setSensors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSensors = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await publicApi.get("data/sensors/");
            setSensors(response.data?.sensors || []);
        } catch (err) {
            // 404 means "no sensors found" -- treat as empty list
            if (err.response?.status === 404) {
                setSensors([]);
            } else {
                setError(
                    err.response?.data?.message || "Failed to fetch sensors",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createSensor = useCallback(
        async (sensorData) => {
            const response = await authApi.post("data/sensors/", sensorData);
            await fetchSensors();
            return response.data;
        },
        [authApi, fetchSensors],
    );

    const deleteSensor = useCallback(
        async (id) => {
            await authApi.delete(`data/sensors/${id}/`);
            await fetchSensors();
        },
        [authApi, fetchSensors],
    );

    useEffect(() => {
        fetchSensors();
    }, [fetchSensors]);

    return {
        sensors,
        isLoading,
        error,
        refetch: fetchSensors,
        createSensor,
        deleteSensor,
    };
};

export default useSensors;
