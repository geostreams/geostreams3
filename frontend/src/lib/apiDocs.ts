import { config } from "@/config";

const FALLBACK = "/geostreams/api/";

/** API root on the backend origin, or the same-origin path when unset. */
export const getApiBaseUrl = () => {
    if (!config.backendUrl) return FALLBACK;
    try {
        return `${new URL(config.backendUrl).origin}${FALLBACK}`;
    } catch {
        return FALLBACK;
    }
};

/** Swagger UI on the backend origin, or the same-origin path when unset. */
export const getApiDocsUrl = () => `${getApiBaseUrl()}swagger/`;
