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
import Dashboard from "./pages/Dashboard";
import SensorDetail from "./pages/SensorDetail";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { AppShell } from "./components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ParametersProvider } from "./contexts/ParametersContext";

function App() {
    const auth = useAuth();

    // Handle different states of OIDC flow
    switch (auth.activeNavigator) {
        case "signinSilent":
            return (
                <div className="flex min-h-screen items-center justify-center px-4">
                    <LoadingSpinner message="Signing you in..." />
                </div>
            );
        case "signoutRedirect":
            return (
                <div className="flex min-h-screen items-center justify-center px-4">
                    <LoadingSpinner message="Signing you out..." />
                </div>
            );
    }

    if (auth.isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <LoadingSpinner message="Loading application..." />
            </div>
        );
    }

    if (auth.error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
                <h1 className="font-heading text-3xl font-semibold text-destructive">
                    Authentication error
                </h1>
                <p className="max-w-md text-muted-foreground">
                    {auth.error.message}
                </p>
                <Button onClick={() => window.location.reload()}>
                    Reload page
                </Button>
            </div>
        );
    }

    // Redirect to profile if authenticated and trying to access the root
    return (
        <ParametersProvider>
            <Router basename="/geostreams">
                <AppShell nav={<Navbar />}>
                    <Routes>
                        {/* Redirect to dashboard if authenticated */}
                        <Route
                            path="/"
                            element={
                                auth.isAuthenticated ? (
                                    <Navigate to="/dashboard" />
                                ) : (
                                    <Home />
                                )
                            }
                        />
                        {/* Protected Dashboard Route */}
                        <Route
                            path="/dashboard"
                            element={
                                auth.isAuthenticated ? (
                                    <Dashboard />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                        {/* Protected Sensor Detail Route */}
                        <Route
                            path="/dashboard/sensors/:id"
                            element={
                                auth.isAuthenticated ? (
                                    <SensorDetail />
                                ) : (
                                    <Navigate to="/" />
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
                </AppShell>
            </Router>
        </ParametersProvider>
    );
}

export default App;
