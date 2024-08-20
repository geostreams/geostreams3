import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Alert,
} from "@mui/material";
import axios from "axios";

function SignUp() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    // Checks if passwords match, then sends a POST request to the server
    // If successful, redirects to the home page else displays an error
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError("");

        try {
            // TODO: Remove hardcoded URL
            const response = await axios.post(
                "http://localhost:9007/auth/createuser/",
                {
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                },
            );
            navigate("/login"); // Redirect to home page on successful sign-up
        } catch (err) {
            if (err.response) {
                // Check the resonse body JSON for the error message
                if (err.response.data.username) {
                    setError(`Username: ${err.response.data.username[0]}`);
                    return;
                }

                if (err.response.data.email) {
                    setError(`Email: ${err.response.data.email[0]}`);
                    return;
                }

                if (err.response.data.password) {
                    setError(`Password: ${err.response.data.password[0]}`);
                    return;
                }

                setError(err.response.data.detail || "Failed to register.");
            } else if (err.request) {
                setError("No response from server.");
            } else {
                setError("Error: " + err.message);
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

export default SignUp;
