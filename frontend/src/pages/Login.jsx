import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Alert,
} from "@mui/material";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState(""); // Error message
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.username !== "" && formData.password !== "") {
            const response = await auth.loginAction(formData);
            if (response) {
                setError(response);
            }
        } else {
            setError("Please fill out all fields.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        if (auth.token) {
            navigate("/profile");
        }
    }, [auth.token, navigate]);

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
                    Sign in
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
                        autoFocus
                        value={formData.username}
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
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
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
};

export default Login;
