import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { buildTicks, formatValue } from "./chartUtils";

export interface ChartPoint {
    x: string;
    y: number | null | undefined;
}

interface ParameterChartProps {
    name: string;
    title: string;
    unit: string;
    points: ChartPoint[];
    selected: boolean;
    onSelect: () => void;
}

const TICK_STYLE = {
    fontSize: 12,
    fill: "var(--muted-foreground)",
    fontVariantNumeric: "tabular-nums",
};

/** One parameter's scatter chart; the selected series is drawn in ochre, the rest in teal. */
const ParameterChart = ({
    name,
    title,
    unit,
    points,
    selected,
    onSelect,
}: ParameterChartProps) => {
    const color = selected ? "var(--chart-2)" : "var(--chart-1)";
    return (
        <div>
            <button
                type="button"
                aria-pressed={selected}
                onClick={onSelect}
                className={cn(
                    "mb-1 w-full rounded-md border-l-4 px-3 py-1 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
                    selected ? "border-accent bg-muted" : "border-transparent",
                )}
            >
                <span className="font-heading text-base font-semibold">
                    {title}
                </span>
                {unit && (
                    <span className="ml-2 text-sm text-muted-foreground">
                        ({unit})
                    </span>
                )}
                <span className="block text-xs text-muted-foreground">
                    {name}
                    {selected && " · selected, table below shows this series"}
                </span>
            </button>
            <ResponsiveContainer width="100%" height={260}>
                <ScatterChart
                    margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                    />
                    <XAxis
                        dataKey="x"
                        type="category"
                        ticks={buildTicks(points.map((p) => p.x))}
                        interval={0}
                        textAnchor="end"
                        angle={-30}
                        height={55}
                        tickMargin={6}
                        tick={TICK_STYLE}
                        stroke="var(--border)"
                    />
                    <YAxis
                        dataKey="y"
                        tick={TICK_STYLE}
                        stroke="var(--border)"
                        label={
                            unit
                                ? {
                                      value: unit,
                                      angle: -90,
                                      position: "insideLeft",
                                      offset: -10,
                                      style: TICK_STYLE,
                                  }
                                : undefined
                        }
                    />
                    <Tooltip
                        cursor={{
                            strokeDasharray: "3 3",
                            stroke: "var(--muted-foreground)",
                        }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const { x, y } = payload[0].payload as ChartPoint;
                            return (
                                <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                                    <p className="font-semibold tabular-nums">
                                        {x}
                                    </p>
                                    <p className="tabular-nums">
                                        {title}: {formatValue(y)}
                                        {unit ? ` ${unit}` : ""}
                                    </p>
                                </div>
                            );
                        }}
                    />
                    <Scatter data={points} fill={color} opacity={0.85} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ParameterChart;
