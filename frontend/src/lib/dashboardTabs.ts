/** Dashboard sections, indexed by the `?tab=` query parameter. */
export const DASHBOARD_TABS = [
    {
        label: "Sensors",
        title: "Sensors",
        subtitle: "Browse, create and manage sensors.",
    },
    {
        label: "Data properties",
        title: "Data properties",
        subtitle: "Manage the parameters sensors report.",
    },
    {
        label: "API access",
        title: "API access",
        subtitle: "Get an API key for the Geostreams API.",
    },
] as const;

export const DASHBOARD_TAB_COUNT = DASHBOARD_TABS.length;

/** Parses a `?tab=` value; anything out of range falls back to the first tab. */
export const parseDashboardTab = (value: string | null): number => {
    const tab = parseInt(value || "0", 10);
    return tab >= 0 && tab < DASHBOARD_TAB_COUNT ? tab : 0;
};
