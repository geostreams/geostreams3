import { config } from "@/config";

/** Swagger UI on the backend origin, or the same-origin path when unset. */
export const getApiDocsUrl = () => {
    const fallback = "/geostreams/api/swagger/";
    if (!config.backendUrl) return fallback;
    try {
        return `${new URL(config.backendUrl).origin}/geostreams/api/swagger/`;
    } catch {
        return fallback;
    }
};
