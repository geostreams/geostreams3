import { Box, Typography, useTheme } from "@mui/material";
import Card from "./Card";

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

export default FeatureCard;
