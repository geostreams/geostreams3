import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import type { TimePeriod } from "../../types/api";

dayjs.extend(utc);

export const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
    { value: "hour", label: "Hourly" },
    { value: "day", label: "Daily" },
    { value: "month", label: "Monthly" },
    { value: "year", label: "Yearly" },
];

/** Picks up to 5 evenly-spaced values from an array for use as axis ticks. */
export function buildTicks(values: string[]): string[] {
    if (values.length <= 5) return values;
    const step = (values.length - 1) / 4;
    return [
        ...new Set(
            Array.from({ length: 5 }, (_, i) => values[Math.round(i * step)]),
        ),
    ].filter(Boolean);
}

/**
 * Formats an ISO date string into a human-readable UTC label based on the
 * aggregation period chosen by the user.
 */
export function formatDate(isoString: string, period: TimePeriod): string {
    const d = dayjs.utc(isoString);
    if (period === "year") return d.format("YYYY");
    if (period === "month") return d.format("MMM YYYY");
    if (period === "day") return d.format("MMM D, YYYY");
    return d.format("MMM D, YYYY HH:mm");
}

/** Formats an aggregate value for display. */
export function formatValue(value: number | null | undefined): string {
    return typeof value === "number" ? value.toFixed(4) : "N/A";
}
