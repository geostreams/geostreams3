import axios, { type AxiosInstance } from "axios";
import type { AuthContextProps } from "react-oidc-context";
import { config } from "../config";

/**
 * Public (unauthenticated) axios instance for open GET endpoints.
 * Sensors, streams, parameters, categories, visualizations, and
 * aggregated data are all publicly readable.
 */
export const publicApi = axios.create({
    baseURL: config.backendUrl,
});

/**
 * Creates a configured axios instance that automatically attaches
 * the Keycloak Bearer token from the auth object.
 * Used for authenticated mutations (POST, PUT, DELETE).
 * @param auth - The auth object from react-oidc-context
 * @returns Configured axios instance
 */
export const createApiClient = (
    auth: Pick<AuthContextProps, "user">,
): AxiosInstance => {
    const client = axios.create({
        baseURL: config.backendUrl,
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

/** HTTP status of a failed axios request, or undefined for other errors. */
export const getErrorStatus = (err: unknown): number | undefined =>
    axios.isAxiosError(err) ? err.response?.status : undefined;

/** The backend's `message` field for a failed request, or the fallback. */
export const getErrorMessage = (err: unknown, fallback: string): string => {
    const data: unknown = axios.isAxiosError(err) ? err.response?.data : null;
    const message =
        data && typeof data === "object" && "message" in data
            ? (data as { message?: unknown }).message
            : undefined;
    return (typeof message === "string" && message) || fallback;
};
