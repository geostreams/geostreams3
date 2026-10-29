import { useState, useCallback } from "react";
import { publicApi } from "../api/apiClient";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching and creating datapoints.
 * GET is public (no auth needed). POST requires auth.
 * Does not auto-fetch on mount -- the user triggers queries via queryDatapoints.
 * @returns {{ datapoints: Array, isLoading: boolean, error: string|null, queryDatapoints: Function, createDatapoint: Function }}
 */
const useDatapoints = () => {
    const authApi = useApiClient();
    const [datapoints, setDatapoints] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const queryDatapoints = useCallback(async (filters = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (filters.streamId) params.stream = filters.streamId;
            if (filters.since) params.since = filters.since;
            if (filters.until) params.until = filters.until;
            const response = await publicApi.get("data/datapoints/", {
                params,
            });
            const data = response.data;
            // Handle both array and wrapped responses
            setDatapoints(Array.isArray(data) ? data : data?.datapoints || []);
        } catch (err) {
            if (err.response?.status === 404) {
                setDatapoints([]);
            } else {
                setError(
                    err.response?.data?.message || "Failed to fetch datapoints",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createDatapoint = useCallback(
        async (datapointData) => {
            const response = await authApi.post(
                "data/datapoints/",
                datapointData,
            );
            return response.data;
        },
        [authApi],
    );

    return { datapoints, isLoading, error, queryDatapoints, createDatapoint };
};

export default useDatapoints;
