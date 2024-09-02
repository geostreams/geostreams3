import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import axios from "axios";
import { Typography, Container, Box, Paper, Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

function UserProfile() {
    const auth = useAuth();
    const [copySuccess, setCopySuccess] = useState("");

    const userProfile = {
        username: auth.user?.profile.preferred_username,
        email: auth.user?.profile.email,
    };

    const getAPIKey = async () => {
        console.log("auth", auth);
        const token = auth.user?.access_token;
        console.log("token", token);
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

    // Copy token to clipboard function
    const copyToClipboard = () => {
        getAPIKey().then((token) => {
            navigator.clipboard
                .writeText(`Token ${token}`)
                .then(() => {
                    setCopySuccess("Token copied to clipboard!");
                })
                .catch((err) => {
                    setCopySuccess("Failed to copy token.");
                    console.error("Copy error:", err);
                });
        });
    };

    if (!userProfile) {
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
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 4 }}
                        onClick={copyToClipboard}
                    >
                        Copy API Token to Clipboard
                    </Button>
                    {copySuccess && (
                        <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ mt: 2 }}
                        >
                            {copySuccess}
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default UserProfile;
