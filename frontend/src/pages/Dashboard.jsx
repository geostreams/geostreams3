import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";
import {
    Sensors as SensorsIcon,
    Stream as StreamIcon,
    Tune as TuneIcon,
    ScatterPlot as ScatterPlotIcon,
    BarChart as BarChartIcon,
    VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import SensorsTab from "../components/dashboard/SensorsTab";
import StreamsTab from "../components/dashboard/StreamsTab";
import ParametersTab from "../components/dashboard/ParametersTab";
import DatapointsTab from "../components/dashboard/DatapointsTab";
import VisualizationTab from "../components/dashboard/VisualizationTab";
import ApiAccessTab from "../components/dashboard/ApiAccessTab";

const TAB_CONFIG = [
    { label: "Sensors", icon: <SensorsIcon /> },
    { label: "Streams", icon: <StreamIcon /> },
    { label: "Parameters", icon: <TuneIcon /> },
    { label: "Datapoints", icon: <ScatterPlotIcon /> },
    { label: "Visualization", icon: <BarChartIcon /> },
    { label: "API Access", icon: <VpnKeyIcon /> },
];

function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = parseInt(searchParams.get("tab") || "0", 10);
    const [activeTab, setActiveTab] = useState(
        initialTab >= 0 && initialTab < TAB_CONFIG.length ? initialTab : 0,
    );

    const handleTabChange = (_event, newValue) => {
        setActiveTab(newValue);
        setSearchParams({ tab: newValue.toString() });
    };

    return (
        <PageLayout
            title="Dashboard"
            subtitle="Manage sensors, streams, parameters, and visualize your data"
            maxWidth="xl"
        >
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        "& .MuiTab-root": {
                            fontWeight: 600,
                            textTransform: "none",
                            minHeight: 56,
                            gap: 1,
                        },
                    }}
                >
                    {TAB_CONFIG.map((tab, index) => (
                        <Tab
                            key={index}
                            label={tab.label}
                            icon={tab.icon}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
                {activeTab === 0 && <SensorsTab />}
                {activeTab === 1 && <StreamsTab />}
                {activeTab === 2 && <ParametersTab />}
                {activeTab === 3 && <DatapointsTab />}
                {activeTab === 4 && <VisualizationTab />}
                {activeTab === 5 && <ApiAccessTab />}
            </Box>
        </PageLayout>
    );
}

export default Dashboard;
