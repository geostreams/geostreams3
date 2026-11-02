import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./theme/theme";

const oidcConfig = {
    authority: import.meta.env.VITE_KEYCLOAK_AUTH_URL,
    client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    redirect_uri: `${window.location.origin}/geostreams`,
    client_secret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
    post_logout_redirect_uri: `${window.location.origin}/geostreams`,
    userStore: new WebStorageStateStore({
        store: window.localStorage,
    }),
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // Removed React.StrictMode cos it breaks the react-oidc-context auth flow on a refresh
    // <React.StrictMode>
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider {...oidcConfig}>
            <App />
        </AuthProvider>
    </ThemeProvider>,
    // </React.StrictMode>,
);

