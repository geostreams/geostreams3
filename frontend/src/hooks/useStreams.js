import { useState, useEffect, useCallback } from "react";
import { publicApi } from "../api/apiClient";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching, creating, and deleting streams.
 * GET is public (no auth needed). POST/DELETE require auth.
 * @param {number|null} sensorId - Optional sensor ID to filter streams
 * @returns {{ streams: Array, isLoading: boolean, error: string|null, refetch: Function, createStream: Function, deleteStream: Function }}
 */
const useStreams = (sensorId = null) => {
    const authApi = useApiClient();
    const [streams, setStreams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStreams = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (sensorId) params.sensor = sensorId;
            const response = await publicApi.get("data/streams/", { params });
            setStreams(response.data?.streams || []);
        } catch (err) {
            if (err.response?.status === 404) {
                setStreams([]);
            } else {
                setError(
                    err.response?.data?.message || "Failed to fetch streams",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [sensorId]);

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
        isLoading,
        error,
        refetch: fetchStreams,
        createStream,
        deleteStream,
    };
};

export default useStreams;
