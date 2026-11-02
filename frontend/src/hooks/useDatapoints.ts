import { useState, useCallback } from "react";
import { publicApi, getErrorMessage, getErrorStatus } from "../api/apiClient";
import type {
    Datapoint,
    DatapointInput,
    PaginatedDatapoints,
} from "../types/api";
import useApiClient from "./useApiClient";

/**
 * Hook for fetching and creating datapoints.
 * GET is public (no auth needed). POST requires auth.
 * Does not auto-fetch on mount -- the user triggers queries via queryDatapoints.
 */
export interface DatapointFilters {
    streamId?: number | string;
    since?: string;
    until?: string;
}

const useDatapoints = () => {
    const authApi = useApiClient();
    const [datapoints, setDatapoints] = useState<Datapoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const queryDatapoints = useCallback(
        async (filters: DatapointFilters = {}) => {
            setIsLoading(true);
            setError(null);
            try {
                const params: Record<string, string | number> = {};
                if (filters.streamId) params.stream = filters.streamId;
                if (filters.since) params.since = filters.since;
                if (filters.until) params.until = filters.until;
                const response = await publicApi.get<
                    Datapoint[] | PaginatedDatapoints
                >("data/datapoints/", { params });
                const data = response.data;
                // Handle both array and wrapped responses
                setDatapoints(
                    Array.isArray(data) ? data : data?.datapoints || [],
                );
            } catch (err) {
                if (getErrorStatus(err) === 404) {
                    setDatapoints([]);
                } else {
                    setError(
                        getErrorMessage(err, "Failed to fetch datapoints"),
                    );
                }
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const createDatapoint = useCallback(
        async (datapointData: DatapointInput) => {
            const response = await authApi.post<unknown>(
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
