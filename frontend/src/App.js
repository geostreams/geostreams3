import { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { useAuth } from "react-oidc-context";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";

function App() {
    const auth = useAuth();

    // Handle different states of OIDC flow
    switch (auth.activeNavigator) {
        case "signinSilent":
            return <div>Signing you in...</div>;
        case "signoutRedirect":
            return <div>Signing you out...</div>;
    }

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        console.log(auth.error);
        return <div>Oops... {auth.error.message}</div>;
    }

    // Redirect to profile if authenticated and trying to access the root
    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Redirect to profile if authenticated */}
                <Route
                    path="/"
                    element={
                        auth.isAuthenticated ? (
                            <Navigate to="/profile" />
                        ) : (
                            <Home />
                        )
                    }
                />
                {/* Protected Profile Route */}
                <Route
                    path="/profile"
                    element={
                        auth.isAuthenticated ? (
                            <UserProfile />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
