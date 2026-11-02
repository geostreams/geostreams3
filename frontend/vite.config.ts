import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    base: "/geostreams/",
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    build: {
        outDir: "build",
    },
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost",
                changeOrigin: true,
            },
        },
    },
});
