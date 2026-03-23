import { useState, useEffect, useCallback } from "react";
import { publicApi } from "../api/apiClient";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching, creating, and deleting streams.
 * GET is public (no auth needed). POST/DELETE require auth.
 *
 * @param {number|null} sensorId - Optional sensor ID to filter streams
 * @param {number} page - 0-based page index (default 0)
 * @param {number} rowsPerPage - rows per page; use -1 to fetch all records (default -1)
 * @returns {{ streams: Array, pagination: object|null, isLoading: boolean, error: string|null, refetch: Function, createStream: Function, deleteStream: Function }}
 */
const useStreams = (sensorId = null, page = 0, rowsPerPage = -1) => {
    const authApi = useApiClient();
    const [streams, setStreams] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStreams = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { limit: rowsPerPage };
            if (rowsPerPage > 0) {
                params.offset = page * rowsPerPage;
            }
            if (sensorId) params.sensor = sensorId;
            const response = await publicApi.get("data/streams/", { params });
            setStreams(response.data?.streams || []);
            setPagination(response.data?.pagination ?? null);
        } catch (err) {
            if (err.response?.status === 404) {
                setStreams([]);
                setPagination({
                    count: 0,
                    limit: rowsPerPage,
                    offset: 0,
                    returned: 0,
                });
            } else {
                setError(
                    err.response?.data?.message || "Failed to fetch streams",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [sensorId, page, rowsPerPage]);

    const createStream = useCallback(
        async (streamData) => {
            const response = await authApi.post("data/streams/", streamData);
            await fetchStreams();
            return response.data;
        },
        [authApi, fetchStreams],
    );

    const deleteStream = useCallback(
        async (id) => {
            await authApi.delete(`data/streams/${id}/`);
            await fetchStreams();
        },
        [authApi, fetchStreams],
    );

    useEffect(() => {
        fetchStreams();
    }, [fetchStreams]);

    return {
        streams,
        pagination,
        isLoading,
        error,
        refetch: fetchStreams,
        createStream,
        deleteStream,
    };
};

export default useStreams;
