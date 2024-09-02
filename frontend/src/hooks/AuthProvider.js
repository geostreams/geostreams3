import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState(null); // null when not logged in
    const [token, setToken] = useState("");
    const navigate = useNavigate();

    // Check if token exists in local storage and set it
    const checkAuth = () => {
        const auth = localStorage.getItem("GeostreamsAuth");
        if (auth) {
            try {
                const parsedAuth = JSON.parse(auth);
                if (parsedAuth.token) {
                    setToken(parsedAuth.token);
                }
            } catch (error) {
                console.error("Failed to parse auth token:", error);
                logoutAction();
            }
        }
    };

    useEffect(() => {
        checkAuth(); // Runs on component mount to check for token
    }, []);

    // Use the token to get the user profile when the token changes
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (token) {
                try {
                    await getUserProfile(); // Fetch user profile if token exists
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    await logoutAction(); // Ensure logout on failure
                }
            }
        };
        fetchUserProfile();
    }, [token]);

    // Login function
    const loginAction = async (data) => {
        try {
            const response = await axios.post(
                "http://localhost:9007/auth/login/",
                data,
            );
            if (response.status === 200) {
                const token = response.data.token.access_token;
                setToken(token);

                // Store token in localStorage
                localStorage.setItem(
                    "GeostreamsAuth",
                    JSON.stringify({
                        token: token,
                    }),
                );

                // Fetch the user profile after login
                await getUserProfile();

                navigate("/profile");
            }
        } catch (err) {
            console.error("Login error:", err);
            if (err.response && err.response.status === 400) {
                return `Error: ${err.response.data.non_field_errors[0]}`;
            }
            await logoutAction(); // Ensure logout on failure
        }
    };

    // Logout function
    const logoutAction = async () => {
        // Clear user profile and token state
        setUserProfile(null);
        setToken("");
        localStorage.removeItem("GeostreamsAuth");

        navigate("/login");
    };

    // Fetch user profile using the token
    const getUserProfile = async () => {
        if (token) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.get(
                    "http://localhost:9007/auth/userprofile/",
                    config,
                );
                setUserProfile({
                    username: response.data.username,
                    email: response.data.email,
                });
            } catch (err) {
                console.error("Profile error:", err);
                await logoutAction(); // Ensure logout on failure
            }
        }
    };

    const getAPIKey = async () => {
        if (token) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.post(
                    "http://localhost:9007/auth/generate-api-key/",
                    null,
                    config,
                );
                return response.data.key;
            } catch (err) {
                console.error("API key error:", err);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{ token, userProfile, loginAction, logoutAction, getAPIKey }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};
