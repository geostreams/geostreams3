import { useState, useEffect, useCallback } from "react";
import { publicApi, getErrorMessage, getErrorStatus } from "../api/apiClient";
import type {
    Sensor,
    SensorInput,
    Pagination,
    PaginatedSensors,
} from "../types/api";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching, creating, updating, and deleting sensors.
 * GET is public (no auth needed). POST/PUT/DELETE require auth.
 *
 * @param page - 0-based page index (default 0)
 * @param rowsPerPage - rows per page; use -1 to fetch all records (default -1)
 */
const useSensors = (page = 0, rowsPerPage = -1) => {
    const authApi = useApiClient();
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSensors = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: Record<string, number> = { limit: rowsPerPage };
            if (rowsPerPage > 0) {
                params.offset = page * rowsPerPage;
            }
            const response = await publicApi.get<PaginatedSensors>(
                "data/sensors/",
                { params },
            );
            setSensors(response.data?.sensors || []);
            setPagination(response.data?.pagination ?? null);
        } catch (err) {
            if (getErrorStatus(err) === 404) {
                setSensors([]);
                setPagination({
                    count: 0,
                    limit: rowsPerPage,
                    offset: 0,
                    returned: 0,
                });
            } else {
                setError(getErrorMessage(err, "Failed to fetch sensors"));
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, rowsPerPage]);

    const createSensor = useCallback(
        async (sensorData: SensorInput) => {
            const response = await authApi.post<Sensor>(
                "data/sensors/",
                sensorData,
            );
            await fetchSensors();
            return response.data;
        },
        [authApi, fetchSensors],
    );

    const updateSensor = useCallback(
        async (id: number, sensorData: SensorInput) => {
            const response = await authApi.put<Sensor>(
                `data/sensors/${id}/`,
                sensorData,
            );
            await fetchSensors();
            return response.data;
        },
        [authApi, fetchSensors],
    );

    const deleteSensor = useCallback(
        async (id: number) => {
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
        updateSensor,
        deleteSensor,
    };
};

export default useSensors;
