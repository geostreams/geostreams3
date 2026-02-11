import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Container, Typography, Button } from "@mui/material";

import { useAuth } from "react-oidc-context";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import LoadingSpinner from "./components/ui/LoadingSpinner";

function App() {
    const auth = useAuth();

    // Handle different states of OIDC flow
    switch (auth.activeNavigator) {
        case "signinSilent":
            return (
                <Container
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                    }}
                >
                    <LoadingSpinner message="Signing you in..." />
                </Container>
            );
        case "signoutRedirect":
            return (
                <Container
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                    }}
                >
                    <LoadingSpinner message="Signing you out..." />
                </Container>
            );
    }

    if (auth.isLoading) {
        return (
            <Container
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <LoadingSpinner message="Loading application..." />
            </Container>
        );
    }

    if (auth.error) {
        return (
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    textAlign: "center",
                    gap: 3,
                }}
            >
                <Typography variant="h4" color="error.main" fontWeight="600">
                    Authentication Error
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {auth.error.message}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                    sx={{ mt: 2 }}
                >
                    Reload Page
                </Button>
            </Container>
        );
    }

    // Redirect to profile if authenticated and trying to access the root
    return (
        <Router basename="/geostreams">
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
