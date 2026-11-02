import { useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { ChartColumn, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import type { AggregateRow, TimePeriod } from "../../types/api";
import AggregatesTable, { type AggregateTableRow } from "./AggregatesTable";
import { formatDate } from "./chartUtils";
import DateRangeControls from "./DateRangeControls";
import ParameterChart, { type ChartPoint } from "./ParameterChart";

interface ChartSectionProps {
    rows: AggregateRow[];
    isLoading: boolean;
    error: string | null;
    /** Period the rows were loaded with; labels only change when new data loads. */
    loadedPeriod: TimePeriod;
    period: TimePeriod;
    onPeriodChange: (period: TimePeriod) => void;
    since: Dayjs | null;
    until: Dayjs | null;
    onSinceChange: (value: Dayjs | null) => void;
    onUntilChange: (value: Dayjs | null) => void;
    onLoad: () => void;
    onAddDatapoint: () => void;
    paramNameMap: Record<string, string>;
    paramUnitMap: Record<string, string>;
}

const ChartSection = ({
    rows,
    isLoading,
    error,
    loadedPeriod,
    onAddDatapoint,
    onLoad,
    paramNameMap,
    paramUnitMap,
    ...range
}: ChartSectionProps) => {
    const [selected, setSelected] = useState<string | null>(null);

    const series = useMemo(() => {
        const byParam = new Map<string, AggregateRow[]>();
        rows.forEach((row) => {
            byParam.set(row.parameter, [
                ...(byParam.get(row.parameter) ?? []),
                row,
            ]);
        });
        return [...byParam.entries()].map(([parameter, paramRows]) => ({
            parameter,
            sorted: [...paramRows].sort((a, b) =>
                (a.date ?? "").localeCompare(b.date ?? ""),
            ),
        }));
    }, [rows]);

    const tableRows = useMemo<AggregateTableRow[]>(
        () =>
            series
                .filter((s) => !selected || s.parameter === selected)
                .flatMap((s) =>
                    [...s.sorted].reverse().map((row, i) => ({
                        key: `${s.parameter}-${row.date}-${row.stream_id ?? ""}-${i}`,
                        parameter: paramNameMap[s.parameter] || s.parameter,
                        date: row.date
                            ? formatDate(row.date, loadedPeriod)
                            : "N/A",
                        average: row.average,
                    })),
                ),
        [series, selected, paramNameMap, loadedPeriod],
    );

    const showEmpty = rows.length === 0 && !isLoading;

    return (
        <section
            aria-labelledby="chart-heading"
            className="mb-6 rounded-lg border border-border bg-card p-4 text-card-foreground md:p-6"
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2
                    id="chart-heading"
                    className="font-heading text-xl font-semibold"
                >
                    Data visualization
                </h2>
                <Button size="sm" onClick={onAddDatapoint}>
                    <Plus aria-hidden />
                    Add datapoint
                </Button>
            </div>
            <DateRangeControls
                {...range}
                isLoading={isLoading}
                error={error}
                onLoad={onLoad}
            />
            {showEmpty ? (
                <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center text-muted-foreground">
                    <ChartColumn aria-hidden className="size-10 opacity-40" />
                    <p className="max-w-xs text-sm">
                        Select a time period and choose &quot;Load data&quot; to
                        visualize sensor data.
                    </p>
                </div>
            ) : isLoading ? (
                <LoadingSpinner message="Loading chart data..." />
            ) : (
                <>
                    <div className="flex flex-col gap-8">
                        {series.map(({ parameter, sorted }) => (
                            <ParameterChart
                                key={parameter}
                                name={parameter}
                                title={paramNameMap[parameter] || parameter}
                                unit={paramUnitMap[parameter] || ""}
                                points={sorted.map((r): ChartPoint => ({
                                    x: formatDate(r.date ?? "", loadedPeriod),
                                    y: r.average,
                                }))}
                                selected={selected === parameter}
                                onSelect={() =>
                                    setSelected((cur) =>
                                        cur === parameter ? null : parameter,
                                    )
                                }
                            />
                        ))}
                    </div>
                    <AggregatesTable
                        rows={tableRows}
                        selectedTitle={
                            selected ? paramNameMap[selected] || selected : null
                        }
                    />
                </>
            )}
        </section>
    );
};

export default ChartSection;
