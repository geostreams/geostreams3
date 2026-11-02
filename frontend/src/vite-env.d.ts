/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_KEYCLOAK_AUTH_URL: string;
    readonly VITE_KEYCLOAK_CLIENT_ID: string;
    readonly VITE_KEYCLOAK_CLIENT_SECRET: string;
    readonly VITE_BACKEND_URL: string;
}
