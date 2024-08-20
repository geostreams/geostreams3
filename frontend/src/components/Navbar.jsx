import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function Navbar({ isAuthenticated, user }) {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Geostreams
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    <Button color="inherit" component={RouterLink} to="/">
                        Home
                    </Button>
                    {!isAuthenticated ? (
                        <>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/login"
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/signup"
                            >
                                Sign Up
                            </Button>
                        </>
                    ) : (
                        <Typography variant="subtitle1">
                            Hello, {user.username}
                        </Typography>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
