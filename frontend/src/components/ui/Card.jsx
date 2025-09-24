import React from "react";
import { Card as MuiCard, CardContent, Typography, Box } from "@mui/material";

const Card = ({
    title,
    subtitle,
    children,
    action,
    elevation = 1,
    sx = {},
    ...props
}) => {
    return (
        <MuiCard
            elevation={elevation}
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                ...sx,
            }}
            {...props}
        >
            <CardContent
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {(title || subtitle || action) && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2,
                        }}
                    >
                        <Box>
                            {title && (
                                <Typography
                                    variant="h6"
                                    component="h2"
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.primary",
                                        mb: subtitle ? 0.5 : 0,
                                    }}
                                >
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontWeight: 500 }}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                        {action && <Box>{action}</Box>}
                    </Box>
                )}
                <Box sx={{ flexGrow: 1 }}>{children}</Box>
            </CardContent>
        </MuiCard>
    );
};

export default Card;
