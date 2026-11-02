import { useState } from "react";
import { useAuth } from "react-oidc-context";
import axios from "axios";
import {
    Box,
    Button,
    Typography,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
} from "@mui/material";
import {
    VpnKey as VpnKeyIcon,
    ContentCopy as ContentCopyIcon,
    ExpandMore as ExpandMoreIcon,
    Code as CodeIcon,
} from "@mui/icons-material";
import Card from "../ui/Card";
import StatusMessage from "../ui/StatusMessage";

const ApiAccessTab = () => {
    const auth = useAuth();
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);
    const [statusMsg, setStatusMsg] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    const baseApiUrl = (() => {
        if (!backendUrl) return "/geostreams/api/";
        try {
            const origin = new URL(backendUrl).origin;
            return `${origin}/geostreams/api/`;
        } catch {
            return "/geostreams/api/";
        }
    })();
    const swaggerUrl = `${baseApiUrl}swagger/`;

    const getAPIKey = async () => {
        const token = auth.user?.access_token;
        if (!token) return null;

        try {
            setIsGeneratingKey(true);
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/generate-api-key/`,
                null,
                config,
            );
            return response.data.key;
        } catch (err) {
            setStatusMsg({
                open: true,
                message: "Failed to generate API key. Please try again.",
                severity: "error",
            });
            if (err.response?.status === 403) {
                auth.removeUser();
            }
            throw err;
        } finally {
            setIsGeneratingKey(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            const token = await getAPIKey();
            if (token) {
                await navigator.clipboard.writeText(token);
                setStatusMsg({
                    open: true,
                    message: "API token copied to clipboard!",
                    severity: "success",
                });
            }
        } catch {
            setStatusMsg({
                open: true,
                message: "Failed to copy token. Please try again.",
                severity: "error",
            });
        }
    };

    const curlExamples = [
        {
            title: "List Sensors",
            cmd: `curl -H "Authorization: YOUR_API_KEY" ${baseApiUrl}data/sensors/`,
        },
        {
            title: "Create Sensor",
            cmd: `curl -X POST -H "Authorization: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"my-sensor","source":"test","geoType":"Point","geometry":{"type":"Point","coordinates":[-89.4,40.1,0]},"properties":{}}' \\
  ${baseApiUrl}data/sensors/`,
        },
        {
            title: "List Streams",
            cmd: `curl -H "Authorization: YOUR_API_KEY" ${baseApiUrl}data/streams/`,
        },
        {
            title: "List Datapoints",
            cmd: `curl -H "Authorization: YOUR_API_KEY" ${baseApiUrl}data/datapoints/`,
        },
        {
            title: "Get Daily Aggregates",
            cmd: `curl "${baseApiUrl}data/cache/day/?sensor_id=1&parameter=temperature"`,
        },
    ];

    return (
        <Box>
            <Grid container spacing={3}>
                {/* API Key Generation */}
                <Grid item xs={12} md={5}>
                    <Card
                        title="API Key"
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
                                sx={{ py: 1.5, fontWeight: 600 }}
                            >
                                {isGeneratingKey
                                    ? "Generating..."
                                    : "Generate & Copy Token"}
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                {/* Quick Reference */}
                <Grid item xs={12} md={7}>
                    <Card
                        title="API Quick Reference"
                        subtitle="Common API endpoints and usage examples"
                        action={
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<CodeIcon />}
                                component="a"
                                href={swaggerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Full Docs
                            </Button>
                        }
                    >
                        <Box sx={{ p: 1 }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Base URL: <code>{baseApiUrl}</code>
                            </Typography>
                            {curlExamples.map((example, index) => (
                                <Accordion
                                    key={index}
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        "&:before": { display: "none" },
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 1,
                                        mb: 1,
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {example.title}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Paper
                                            sx={{
                                                p: 1.5,
                                                bgcolor: "grey.50",
                                                fontFamily: "monospace",
                                                fontSize: "0.75rem",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-all",
                                                borderRadius: 1,
                                            }}
                                        >
                                            {example.cmd}
                                        </Paper>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            <StatusMessage
                open={statusMsg.open}
                message={statusMsg.message}
                severity={statusMsg.severity}
                onClose={() =>
                    setStatusMsg((prev) => ({ ...prev, open: false }))
                }
            />
        </Box>
    );
};

export default ApiAccessTab;
