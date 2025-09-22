import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import axios from "axios";
import {
    Typography,
    Container,
    Box,
    Paper,
    Button,
    Grid,
    Chip,
    Divider,
    Stack,
    Avatar,
    Alert,
    Tooltip,
    IconButton,
} from "@mui/material";
import {
    Person as PersonIcon,
    Email as EmailIcon,
    VpnKey as VpnKeyIcon,
    ContentCopy as ContentCopyIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatusMessage from "../components/ui/StatusMessage";

function UserProfile() {
    const auth = useAuth();
    const [copySuccess, setCopySuccess] = useState("");
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);

    const userProfile = {
        username: auth.user?.profile.preferred_username,
        name: auth.user?.profile.name,
        emailVerified: auth.user?.profile.email_verified,
    };

    const getAPIKey = async () => {
        const token = auth.user?.access_token;
        console.log("auth.user", auth.user);
        if (token) {
            try {
                setIsGeneratingKey(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}auth/generate-api-key/`,
                    null,
                    config,
                );
                return response.data.key;
            } catch (err) {
                console.error("API key error:", err);
                setCopySuccess("Failed to generate API key. Please try again.");
                setShowCopyMessage(true);
                //     Logout if token is invalid
                if (err.response?.status === 403) {
                    auth.removeUser();
                }
                throw err;
            } finally {
                setIsGeneratingKey(false);
            }
        }
    };

    // Copy token to clipboard function
    const copyToClipboard = async () => {
        try {
            const token = await getAPIKey();
            if (token) {
                await navigator.clipboard.writeText(token);
                setCopySuccess("API token copied to clipboard!");
                setShowCopyMessage(true);
            }
        } catch (err) {
            setCopySuccess("Failed to copy token. Please try again.");
            setShowCopyMessage(true);
            console.error("Copy error:", err);
        }
    };

    const handleCloseMessage = () => {
        setShowCopyMessage(false);
        setCopySuccess("");
    };

    if (!userProfile || !auth.user) {
        return (
            <PageLayout>
                <LoadingSpinner message="Loading user profile..." />
            </PageLayout>
        );
    }

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <PageLayout
            title="User Profile"
            subtitle="Manage your account and access your API credentials"
            maxWidth="md"
        >
            <Grid container spacing={4}>
                {/* Profile Information Card */}
                <Grid item xs={12} lg={8}>
                    <Card
                        title="Profile Information"
                        subtitle="Your account details and status"
                    >
                        <Box sx={{ p: 2 }}>
                            {/* User Avatar and Basic Info */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    mb: 4,
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: "primary.main",
                                        fontSize: "1.5rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {getInitials(userProfile.name)}
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                        {userProfile.name || "Unknown User"}
                                    </Typography>
                                    <Chip
                                        icon={
                                            userProfile.emailVerified ? (
                                                <CheckCircleIcon />
                                            ) : null
                                        }
                                        label={
                                            userProfile.emailVerified
                                                ? "Email Verified"
                                                : "Email Not Verified"
                                        }
                                        color={
                                            userProfile.emailVerified
                                                ? "success"
                                                : "warning"
                                        }
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Profile Details */}
                            <Stack spacing={3}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <PersonIcon color="primary" />
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            Username
                                        </Typography>
                                        <Typography variant="body1">
                                            {userProfile.username}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <EmailIcon color="primary" />
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            Email Status
                                        </Typography>
                                        <Typography variant="body1">
                                            {userProfile.emailVerified
                                                ? "Verified"
                                                : "Not Verified"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* API Access Card */}
                <Grid item xs={12} lg={4}>
                    <Card
                        title="API Access"
                        subtitle="Generate and manage your API token"
                    >
                        <Box sx={{ p: 2, textAlign: "center" }}>
                            <VpnKeyIcon
                                sx={{
                                    fontSize: 48,
                                    color: "primary.main",
                                    mb: 2,
                                }}
                            />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 3, lineHeight: 1.6 }}
                            >
                                Generate an API token to access Geostreams
                                programmatically. Keep your token secure and
                                don&apos;t share it with others.
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={
                                    isGeneratingKey ? null : <ContentCopyIcon />
                                }
                                onClick={copyToClipboard}
                                disabled={isGeneratingKey}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    fontWeight: 600,
                                }}
                            >
                                {isGeneratingKey
                                    ? "Generating..."
                                    : "Generate & Copy Token"}
                            </Button>

                            {copySuccess && !showCopyMessage && (
                                <Alert
                                    severity="success"
                                    sx={{ mt: 2, textAlign: "left" }}
                                >
                                    {copySuccess}
                                </Alert>
                            )}
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Status Message Snackbar */}
            <StatusMessage
                open={showCopyMessage}
                message={copySuccess}
                severity={copySuccess.includes("Failed") ? "error" : "success"}
                onClose={handleCloseMessage}
            />
        </PageLayout>
    );
}

export default UserProfile;
