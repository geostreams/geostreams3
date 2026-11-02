import { useSearchParams } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";
import {
    Sensors as SensorsIcon,
    Tune as TuneIcon,
    VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import SensorsTab from "../components/dashboard/SensorsTab";
import ParametersTab from "../components/dashboard/ParametersTab";
import ApiAccessTab from "../components/dashboard/ApiAccessTab";

const TAB_CONFIG = [
    { label: "Sensors", icon: <SensorsIcon /> },
    { label: "Data Properties", icon: <TuneIcon /> },
    { label: "API Access", icon: <VpnKeyIcon /> },
];

function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    // The URL is the source of truth so the rail's deep links switch tabs.
    const requestedTab = parseInt(searchParams.get("tab") || "0", 10);
    const activeTab =
        requestedTab >= 0 && requestedTab < TAB_CONFIG.length
            ? requestedTab
            : 0;

    const handleTabChange = (_event, newValue) => {
        setSearchParams({ tab: newValue.toString() });
    };

    return (
        <PageLayout
            title="Dashboard"
            subtitle="Manage sensors, parameters, and get API Key"
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
                {activeTab === 1 && <ParametersTab />}
                {activeTab === 2 && <ApiAccessTab />}
            </Box>
        </PageLayout>
    );
}

export default Dashboard;
