import type { Dayjs } from "dayjs";
import { ChartColumn } from "lucide-react";

import { Button } from "@/components/ui/button";
import DateTimePicker from "@/components/ui/date-time-picker";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { TimePeriod } from "../../types/api";
import { TIME_PERIODS } from "./chartUtils";

interface DateRangeControlsProps {
    period: TimePeriod;
    onPeriodChange: (period: TimePeriod) => void;
    since: Dayjs | null;
    until: Dayjs | null;
    onSinceChange: (value: Dayjs | null) => void;
    onUntilChange: (value: Dayjs | null) => void;
    isLoading: boolean;
    error: string | null;
    onLoad: () => void;
}

/** Aggregation period and UTC date range for the chart, with the Load button. */
const DateRangeControls = ({
    period,
    onPeriodChange,
    since,
    until,
    onSinceChange,
    onUntilChange,
    isLoading,
    error,
    onLoad,
}: DateRangeControlsProps) => (
    <form
        noValidate
        onSubmit={(event) => {
            event.preventDefault();
            onLoad();
        }}
        className="mb-6 grid gap-4 border-b border-border pb-6 md:grid-cols-[10rem_1fr_1fr_auto] md:items-end"
    >
        <div className="grid gap-2">
            <Label htmlFor="chart-period">Time period</Label>
            <Select
                value={period}
                onValueChange={(next) => onPeriodChange(next as TimePeriod)}
            >
                <SelectTrigger id="chart-period" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {TIME_PERIODS.map((tp) => (
                        <SelectItem key={tp.value} value={tp.value}>
                            {tp.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="chart-since">Since (UTC)</Label>
            <DateTimePicker
                id="chart-since"
                value={since}
                onChange={onSinceChange}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="chart-until">Until (UTC)</Label>
            <DateTimePicker
                id="chart-until"
                value={until}
                onChange={onUntilChange}
            />
        </div>
        <Button type="submit" variant="outline" disabled={isLoading}>
            <ChartColumn aria-hidden />
            {isLoading ? "Loading…" : "Load data"}
        </Button>
        {error && (
            <p
                role="alert"
                className="text-sm font-medium text-destructive md:col-span-4"
            >
                {error}
            </p>
        )}
    </form>
);

export default DateRangeControls;
