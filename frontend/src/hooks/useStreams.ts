import { useState, useEffect, useCallback } from "react";
import { publicApi, getErrorMessage, getErrorStatus } from "../api/apiClient";
import type {
    Stream,
    StreamInput,
    Pagination,
    PaginatedStreams,
} from "../types/api";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching, creating, and deleting streams.
 * GET is public (no auth needed). POST/DELETE require auth.
 *
 * @param sensorId - Optional sensor ID to filter streams
 * @param page - 0-based page index (default 0)
 * @param rowsPerPage - rows per page; use -1 to fetch all records (default -1)
 */
const useStreams = (
    sensorId: number | null = null,
    page = 0,
    rowsPerPage = -1,
) => {
    const authApi = useApiClient();
    const [streams, setStreams] = useState<Stream[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStreams = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: Record<string, number> = { limit: rowsPerPage };
            if (rowsPerPage > 0) {
                params.offset = page * rowsPerPage;
            }
            if (sensorId) params.sensor = sensorId;
            const response = await publicApi.get<PaginatedStreams>(
                "data/streams/",
                { params },
            );
            setStreams(response.data?.streams || []);
            setPagination(response.data?.pagination ?? null);
        } catch (err) {
            if (getErrorStatus(err) === 404) {
                setStreams([]);
                setPagination({
                    count: 0,
                    limit: rowsPerPage,
                    offset: 0,
                    returned: 0,
                });
            } else {
                setError(getErrorMessage(err, "Failed to fetch streams"));
            }
        } finally {
            setIsLoading(false);
        }
    }, [sensorId, page, rowsPerPage]);

    const createStream = useCallback(
        async (streamData: StreamInput) => {
            const response = await authApi.post<Stream>(
                "data/streams/",
                streamData,
            );
            await fetchStreams();
            return response.data;
        },
        [authApi, fetchStreams],
    );

    const deleteStream = useCallback(
        async (id: number) => {
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
