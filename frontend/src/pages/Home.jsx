import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Grid,
    Button,
    Stack,
    useTheme,
    alpha,
} from "@mui/material";
import {
    Login as LoginIcon,
    Science as ScienceIcon,
    Storage as StorageIcon,
    Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import yaml from "js-yaml";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import PageLayout from "../components/common/PageLayout";
import Card from "../components/ui/Card";

const FeatureCard = ({ icon: Icon, title, description }) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                textAlign: "center",
                p: 3,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon sx={{ fontSize: 28, color: "white" }} />
                </Box>
            </Box>
            <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
            >
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Card>
    );
};

function Home() {
    const [content, setContent] = useState({ title: "", description: "" });
    const auth = useAuth();
    const theme = useTheme();

    useEffect(() => {
        axios
            .get("/description.yaml")
            .then((response) => {
                const data = yaml.load(response.data);
                setContent(data);
            })
            .catch((error) =>
                console.error("Error loading the YAML content:", error),
            );
    }, []);

    const features = [
        {
            icon: ScienceIcon,
            title: "Scientific Data",
            description:
                "Access and manage environmental sensor data with precision and reliability.",
        },
        {
            icon: StorageIcon,
            title: "Secure Storage",
            description:
                "Your data is safely stored and managed with enterprise-grade security.",
        },
        {
            icon: AnalyticsIcon,
            title: "Advanced Analytics",
            description:
                "Powerful tools for analyzing and visualizing your environmental data.",
        },
    ];

    return (
        <PageLayout showHeader={false}>
            {/* Hero Section */}
            <Box
                sx={{
                    textAlign: "center",
                    py: { xs: 6, md: 8 },
                    px: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                    borderRadius: 4,
                    mb: 6,
                }}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        mb: 3,
                        background:
                            "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 700,
                        fontSize: { xs: "2.5rem", md: "3.5rem" },
                    }}
                >
                    {content.title || "Geostreams"}
                </Typography>

                <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{
                        mb: 4,
                        maxWidth: "800px",
                        mx: "auto",
                        fontWeight: 400,
                        lineHeight: 1.6,
                    }}
                >
                    {content.description ||
                        "A platform for environmental data management and analysis"}
                </Typography>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="center"
                    sx={{ mt: 4 }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        onClick={() => auth.signinRedirect()}
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: 600,
                        }}
                    >
                        Get Started
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            borderWidth: 2,
                            "&:hover": {
                                borderWidth: 2,
                            },
                        }}
                    >
                        Learn More
                    </Button>
                </Stack>
            </Box>

            {/* Features Section */}
            <Box sx={{ mb: 6 }}>
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        textAlign: "center",
                        mb: 2,
                        fontWeight: 600,
                        color: "text.primary",
                    }}
                >
                    Why Choose Geostreams?
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        textAlign: "center",
                        mb: 5,
                        maxWidth: "600px",
                        mx: "auto",
                        fontWeight: 400,
                    }}
                >
                    Powerful tools and features designed for environmental data
                    professionals
                </Typography>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <FeatureCard {...feature} />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Call to Action Section */}
            <Box
                sx={{
                    textAlign: "center",
                    py: 6,
                    px: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    borderRadius: 4,
                    color: "white",
                }}
            >
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{ mb: 2, fontWeight: 600 }}
                >
                    Ready to get started?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    Sign up now to access your API token and start managing your
                    data
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => auth.signinRedirect()}
                    sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        bgcolor: "white",
                        color: "primary.main",
                        "&:hover": {
                            bgcolor: alpha("#ffffff", 0.9),
                            transform: "translateY(-2px)",
                        },
                    }}
                >
                    Sign In / Sign Up
                </Button>
            </Box>
        </PageLayout>
    );
}

export default Home;
