import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { config } from "./config";

const oidcConfig = {
    authority: config.keycloakAuthUrl,
    client_id: config.keycloakClientId,
    redirect_uri: `${window.location.origin}/geostreams`,
    client_secret: config.keycloakClientSecret,
    post_logout_redirect_uri: `${window.location.origin}/geostreams`,
    userStore: new WebStorageStateStore({
        store: window.localStorage,
    }),
};

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);
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
