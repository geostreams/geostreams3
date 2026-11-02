import { useState } from "react";
import { config } from "@/config";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Menu,
    MenuItem,
    Avatar,
    IconButton,
    useScrollTrigger,
    Slide,
    alpha,
    useTheme,
} from "@mui/material";
import {
    Home as HomeIcon,
    MenuBook as MenuBookIcon,
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

const HideOnScroll = ({ children }) => {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
};

function Navbar() {
    const auth = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const isAuthenticated = auth.isAuthenticated;
    const [anchorEl, setAnchorEl] = useState(null);
    const backendUrl = config.backendUrl;
    const apiDocsUrl = (() => {
        if (!backendUrl) {
            return "/geostreams/api/swagger/";
        }

        try {
            const origin = new URL(backendUrl).origin;
            return `${origin}/geostreams/api/swagger/`;
        } catch (_error) {
            return "/geostreams/api/swagger/";
        }
    })();

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            auth.removeUser();
            await auth.signoutRedirect(); // Redirects to the identity provider's logout
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error during logout:", error);
        }
    };

    const handleLogin = () => {
        auth.signinRedirect();
    };

    return (
        <HideOnScroll>
            <AppBar
                position="sticky"
                elevation={2}
                sx={{
                    background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                    backdropFilter: "blur(10px)",
                    borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    borderRadius: 0,
                }}
            >
                <Toolbar
                    sx={{
                        px: { xs: 2, sm: 3 },
                        py: 1,
                        justifyContent: "space-between",
                    }}
                >
                    {/* Logo */}
                    <Typography
                        variant="h5"
                        component={RouterLink}
                        to="/"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            color: "white",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                                transform: "scale(1.02)",
                            },
                        }}
                    >
                        Geostreams3
                    </Typography>

                    {/* Navigation */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            startIcon={<HomeIcon />}
                            sx={{
                                color: "white",
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    backgroundColor: alpha(
                                        theme.palette.common.white,
                                        0.1,
                                    ),
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            Home
                        </Button>
                        <Button
                            color="inherit"
                            component="a"
                            href={apiDocsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<MenuBookIcon />}
                            sx={{
                                color: "white",
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    backgroundColor: alpha(
                                        theme.palette.common.white,
                                        0.1,
                                    ),
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            API Docs
                        </Button>

                        {isAuthenticated && (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/dashboard"
                                startIcon={<DashboardIcon />}
                                sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        backgroundColor: alpha(
                                            theme.palette.common.white,
                                            0.1,
                                        ),
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            >
                                Dashboard
                            </Button>
                        )}

                        {!isAuthenticated ? (
                            <Button
                                color="inherit"
                                onClick={handleLogin}
                                startIcon={<LoginIcon />}
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor: alpha(
                                        theme.palette.common.white,
                                        0.5,
                                    ),
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        borderColor: "white",
                                        backgroundColor: alpha(
                                            theme.palette.common.white,
                                            0.1,
                                        ),
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            >
                                Sign In
                            </Button>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{
                                        p: 0.5,
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(
                                                theme.palette.common.white,
                                                0.2,
                                            ),
                                            color: "white",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            width: 40,
                                            height: 40,
                                            border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                                        }}
                                    >
                                        {getInitials(auth.user?.profile.name)}
                                    </Avatar>
                                </IconButton>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    sx={{
                                        mt: 0.75,
                                        "& .MuiPaper-root": {
                                            borderRadius: 3,
                                            minWidth: 220,
                                            boxShadow: theme.shadows[8],
                                            border: `1px solid ${theme.palette.divider}`,
                                            overflow: "hidden",
                                        },
                                    }}
                                    MenuListProps={{
                                        sx: {
                                            py: 0.75,
                                        },
                                    }}
                                    transformOrigin={{
                                        horizontal: "right",
                                        vertical: "top",
                                    }}
                                    anchorOrigin={{
                                        horizontal: "right",
                                        vertical: "bottom",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 1.25,
                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            sx={{ fontSize: "0.75rem" }}
                                        >
                                            Signed in as
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {auth.user?.profile.name ||
                                                auth.user?.profile
                                                    .preferred_username}
                                        </Typography>
                                    </Box>

                                    <MenuItem
                                        onClick={() => {
                                            handleMenuClose();
                                            navigate("/dashboard");
                                        }}
                                        sx={{
                                            py: 1.25,
                                            gap: 1.5,
                                            mx: 0.75,
                                            borderRadius: 1.5,
                                            "&:hover": {
                                                backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08,
                                                ),
                                            },
                                        }}
                                    >
                                        <DashboardIcon
                                            fontSize="small"
                                            color="primary"
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            Dashboard
                                        </Typography>
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            handleMenuClose();
                                            navigate("/profile");
                                        }}
                                        sx={{
                                            py: 1.25,
                                            gap: 1.5,
                                            mx: 0.75,
                                            borderRadius: 1.5,
                                            "&:hover": {
                                                backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08,
                                                ),
                                            },
                                        }}
                                    >
                                        <PersonIcon
                                            fontSize="small"
                                            color="primary"
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            Profile
                                        </Typography>
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            handleMenuClose();
                                            handleLogout();
                                        }}
                                        sx={{
                                            py: 1.25,
                                            gap: 1.5,
                                            mt: 0.5,
                                            mx: 0.75,
                                            borderRadius: 1.5,
                                            borderTop: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                                            "&:hover": {
                                                backgroundColor: alpha(
                                                    theme.palette.error.main,
                                                    0.08,
                                                ),
                                            },
                                        }}
                                    >
                                        <LogoutIcon
                                            fontSize="small"
                                            color="error"
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                                color: "error.main",
                                            }}
                                        >
                                            Sign Out
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    );
}

// const Navbar = () => <></>
export default Navbar;
