import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
    authority: process.env.REACT_APP_KEYCLOAK_AUTH_URL,
    client_id: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_URL,
    client_secret: process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET,
    post_logout_redirect_uri: process.env.REACT_APP_URL,
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // Removed React.StrictMode cos it breaks the react-oidc-context auth flow on a refresh
    // <React.StrictMode>
    <AuthProvider {...oidcConfig}>
        <App />
    </AuthProvider>,
    // </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
