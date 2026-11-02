import { useSearchParams } from "react-router-dom";

import PageLayout from "../components/common/PageLayout";
import SensorsTab from "../components/dashboard/SensorsTab";
import ParametersTab from "../components/dashboard/ParametersTab";
import ApiAccessTab from "../components/dashboard/ApiAccessTab";
import { DASHBOARD_TABS, parseDashboardTab } from "@/lib/dashboardTabs";

const TAB_CONTENT = [SensorsTab, ParametersTab, ApiAccessTab];

/**
 * Dashboard. The rail's deep links (`?tab=0|1|2`) pick the section, so the URL
 * is the source of truth and there is no in-page tab bar.
 */
function Dashboard() {
    const [searchParams] = useSearchParams();
    const activeTab = parseDashboardTab(searchParams.get("tab"));
    const { title, subtitle } = DASHBOARD_TABS[activeTab];
    const Content = TAB_CONTENT[activeTab];

    return (
        <PageLayout title={title} subtitle={subtitle} maxWidth="xl">
            <Content />
        </PageLayout>
    );
}

export default Dashboard;
