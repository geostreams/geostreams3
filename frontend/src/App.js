import { useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";
import AuthProvider from "./hooks/AuthProvider";
import { useAuth } from "./hooks/AuthProvider";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserProfile from "./pages/UserProfile";

const ProtectedRoute = () => {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/login" />;
    }
    return <Outlet />;
};

function App() {
    const [user, setUser] = useState(null); // null when not logged in

    const isAuthenticated = !!user;

    return (
        <Router>
            <AuthProvider>
                <Navbar isAuthenticated={isAuthenticated} user={user} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/login"
                        element={<Login setUser={setUser} />}
                    />
                    <Route path="/signup" element={<SignUp />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<UserProfile />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
