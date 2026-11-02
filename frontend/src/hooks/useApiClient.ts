import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import type { AxiosInstance } from "axios";
import { createApiClient } from "../api/apiClient";

/**
 * Hook that provides an authenticated axios instance.
 * Memoized so the client is only recreated when the access token changes.
 * @returns Authenticated axios instance
 */
const useApiClient = (): AxiosInstance => {
    const auth = useAuth();
    const token = auth.user?.access_token;

    const apiClient = useMemo(
        () => createApiClient(auth),
        // token changes when auth refreshes, which is when we need a new client
        [token], // eslint-disable-line
    );

    return apiClient;
};

export default useApiClient;
