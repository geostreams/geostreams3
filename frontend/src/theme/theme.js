import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
            light: "#42a5f5",
            dark: "#1565c0",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#dc004e",
            light: "#ff5983",
            dark: "#9a0036",
            contrastText: "#ffffff",
        },
        background: {
            default: "#f8fafc",
            paper: "#ffffff",
        },
        text: {
            primary: "#1e293b",
            secondary: "#64748b",
        },
        success: {
            main: "#10b981",
            light: "#34d399",
            dark: "#059669",
        },
        warning: {
            main: "#f59e0b",
            light: "#fbbf24",
            dark: "#d97706",
        },
        error: {
            main: "#ef4444",
            light: "#f87171",
            dark: "#dc2626",
        },
        info: {
            main: "#3b82f6",
            light: "#60a5fa",
            dark: "#2563eb",
        },
    },
    typography: {
        fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
        ].join(","),
        h1: {
            fontSize: "2.5rem",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
        },
        h2: {
            fontSize: "2rem",
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
        },
        h3: {
            fontSize: "1.75rem",
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h4: {
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: "1.25rem",
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: "1.125rem",
            fontWeight: 600,
            lineHeight: 1.4,
        },
        body1: {
            fontSize: "1rem",
            lineHeight: 1.6,
        },
        body2: {
            fontSize: "0.875rem",
            lineHeight: 1.5,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        "none",
        "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
        ...Array(19).fill("none"),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
                    },
                },
                containedPrimary: {
                    background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                    "&:hover": {
                        background:
                            "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    boxShadow:
                        "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                    boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.15)",
                    borderRadius: 0,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
    },
});

export default theme;
