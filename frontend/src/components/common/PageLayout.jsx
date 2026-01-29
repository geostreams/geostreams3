import { Container, Box, Typography, Fade } from "@mui/material";

const PageLayout = ({
    title,
    subtitle,
    children,
    maxWidth = "lg",
    showHeader = true,
    sx = {},
}) => {
    return (
        <Fade in timeout={600}>
            <Container
                maxWidth={maxWidth}
                sx={{
                    py: { xs: 3, md: 4 },
                    px: { xs: 2, md: 3 },
                    minHeight: "calc(100vh - 64px)",
                    ...sx,
                }}
            >
                {showHeader && (title || subtitle) && (
                    <Box
                        sx={{
                            mb: { xs: 3, md: 4 },
                            textAlign: "center",
                        }}
                    >
                        {title && (
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    mb: subtitle ? 1 : 0,
                                    background:
                                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    fontWeight: 700,
                                }}
                            >
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{
                                    fontWeight: 400,
                                    maxWidth: "600px",
                                    mx: "auto",
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                )}
                <Box>{children}</Box>
            </Container>
        </Fade>
    );
};

export default PageLayout;
