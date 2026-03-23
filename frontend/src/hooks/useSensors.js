import { useState, useEffect, useCallback } from "react";
import { publicApi } from "../api/apiClient";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching, creating, and deleting sensors.
 * GET is public (no auth needed). POST/DELETE require auth.
 *
 * @param {number} page - 0-based page index (default 0)
 * @param {number} rowsPerPage - rows per page; use -1 to fetch all records (default -1)
 * @returns {{ sensors: Array, pagination: object|null, isLoading: boolean, error: string|null, refetch: Function, createSensor: Function, deleteSensor: Function }}
 */
const useSensors = (page = 0, rowsPerPage = -1) => {
    const authApi = useApiClient();
    const [sensors, setSensors] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSensors = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { limit: rowsPerPage };
            if (rowsPerPage > 0) {
                params.offset = page * rowsPerPage;
            }
            const response = await publicApi.get("data/sensors/", { params });
            setSensors(response.data?.sensors || []);
            setPagination(response.data?.pagination ?? null);
        } catch (err) {
            if (err.response?.status === 404) {
                setSensors([]);
                setPagination({
                    count: 0,
                    limit: rowsPerPage,
                    offset: 0,
                    returned: 0,
                });
            } else {
                setError(
                    err.response?.data?.message || "Failed to fetch sensors",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, rowsPerPage]);

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
        pagination,
        isLoading,
        error,
        refetch: fetchSensors,
        createSensor,
        deleteSensor,
    };
};

export default useSensors;
