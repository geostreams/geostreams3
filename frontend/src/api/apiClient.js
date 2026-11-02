import axios from "axios";

/**
 * Public (unauthenticated) axios instance for open GET endpoints.
 * Sensors, streams, parameters, categories, visualizations, and
 * aggregated data are all publicly readable.
 */
export const publicApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

/**
 * Creates a configured axios instance that automatically attaches
 * the Keycloak Bearer token from the auth object.
 * Used for authenticated mutations (POST, PUT, DELETE).
 * @param {object} auth - The auth object from react-oidc-context
 * @returns {import("axios").AxiosInstance} Configured axios instance
 */
export const createApiClient = (auth) => {
    const client = axios.create({
        baseURL: import.meta.env.VITE_BACKEND_URL,
    });

    client.interceptors.request.use((config) => {
        const token = auth.user?.access_token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return client;
};
