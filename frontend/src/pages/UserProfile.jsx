import { useState, useEffect } from "react";
import { useAuth } from "../hooks/AuthProvider";
import axios from "axios";
import { Typography, Container, Box, Paper } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

function UserProfile() {
    const { token } = useAuth();
    const [userProfile, setUserProfile] = useState({});
    const getUserInfo = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Token ${token}`,
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
        }
    };
    useEffect(() => {
        getUserInfo();
    }, []);

    if (!userProfile.username) {
        // Center the loading spinner
        return (
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography component="h1" variant="h5">
                        User Profile
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Username: {userProfile.username}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Email: {userProfile.email}
                    </Typography>
                    {/* Additional user info can be displayed here */}
                </Box>
            </Paper>
        </Container>
    );
}

export default UserProfile;
