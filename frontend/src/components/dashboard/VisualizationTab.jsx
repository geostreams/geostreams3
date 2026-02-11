import { useState } from "react";
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Typography,
} from "@mui/material";
import { BarChart as ChartIcon, Map as MapIcon } from "@mui/icons-material";
import TimeSeriesChart from "../visualization/TimeSeriesChart";
import SensorMap from "../visualization/SensorMap";

const VisualizationTab = () => {
    const [view, setView] = useState("chart");

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Data Visualization
                </Typography>
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={(_e, newVal) => {
                        if (newVal) setView(newVal);
                    }}
                    size="small"
                >
                    <ToggleButton value="chart">
                        <ChartIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Chart
                    </ToggleButton>
                    <ToggleButton value="map">
                        <MapIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Map
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {view === "chart" && <TimeSeriesChart />}
            {view === "map" && <SensorMap />}
        </Box>
    );
};

export default VisualizationTab;
