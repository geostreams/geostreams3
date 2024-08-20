import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Menu,
    MenuItem,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";

function Navbar() {
    const { userProfile, logoutAction } = useAuth();
    const isAuthenticated = !!userProfile;

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logoutAction();
        handleMenuClose();
    };

    return (
        <AppBar position="static" sx={{ boxShadow: "none" }}>
            <Toolbar sx={{ padding: { xs: 1, sm: 1 } }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontWeight: "bold",
                        letterSpacing: 1.2,
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                        color: "#fff",
                    }}
                >
                    Geostreams
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/"
                        sx={{
                            color: "#fff",
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                            textTransform: "uppercase",
                        }}
                    >
                        Home
                    </Button>
                    {!isAuthenticated ? (
                        <>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/login"
                                sx={{
                                    color: "#fff",
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                    textTransform: "uppercase",
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/signup"
                                sx={{
                                    color: "#fff",
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                    textTransform: "uppercase",
                                }}
                            >
                                Sign Up
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                aria-controls="user-menu"
                                aria-haspopup="true"
                                onClick={handleMenuOpen}
                                sx={{
                                    color: "#fff",
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                    textTransform: "none",
                                    fontWeight: "bold",
                                }}
                            >
                                Hello, {userProfile.username}
                            </Button>
                            <Menu
                                id="user-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                sx={{
                                    mt: "45px",
                                    "& .MuiPaper-root": {
                                        backgroundColor: "#f5f5f5",
                                        boxShadow: "0 3px 5px rgba(0,0,0,0.3)",
                                        minWidth: "150px",
                                    },
                                    "& .MuiMenuItem-root": {
                                        color: "#333",
                                        fontSize: "0.9rem",
                                        "&:hover": {
                                            backgroundColor: "#ddd",
                                        },
                                    },
                                }}
                            >
                                <MenuItem
                                    onClick={handleMenuClose}
                                    component={RouterLink}
                                    to="/profile"
                                >
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
