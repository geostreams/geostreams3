import { useState } from "react";
import {
    Box,
    Autocomplete,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Button,
    Typography,
    Paper,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import useSensors from "../../hooks/useSensors";
import useStreams from "../../hooks/useStreams";
import useParameters from "../../hooks/useParameters";
import useAggregates from "../../hooks/useAggregates";
import LoadingSpinner from "../ui/LoadingSpinner";

const TimeSeriesChart = () => {
    const { sensors } = useSensors();
    const { parameters } = useParameters();
    const {
        data: aggData,
        isLoading,
        error,
        fetchAggregates,
    } = useAggregates();

    const [selectedSensor, setSelectedSensor] = useState(null);
    const { streams } = useStreams(selectedSensor?.id || null);
    const [selectedStream, setSelectedStream] = useState(null);
    const [selectedParameter, setSelectedParameter] = useState(null);
    const [timePeriod, setTimePeriod] = useState("day");
    const [since, setSince] = useState(null);
    const [until, setUntil] = useState(null);

    const handleFetch = () => {
        if (!selectedSensor) return;
        fetchAggregates({
            sensorId: selectedSensor.id,
            parameter: selectedParameter?.name || undefined,
            timePeriod,
            since: since ? since.toISOString() : undefined,
            until: until ? until.toISOString() : undefined,
        });
    };

    // Transform aggregate data for Recharts
    const chartData = (Array.isArray(aggData) ? aggData : []).map((item) => ({
        time: item.bucket || item.time,
        average: item.average != null ? parseFloat(item.average) : null,
        count: item.count || 0,
        label: item.bucket ? new Date(item.bucket).toLocaleDateString() : "",
    }));

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                {/* Controls Bar */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        <Autocomplete
                            options={sensors}
                            getOptionLabel={(option) => option.name || ""}
                            value={selectedSensor}
                            onChange={(_e, newVal) => {
                                setSelectedSensor(newVal);
                                setSelectedStream(null);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Sensor"
                                    size="small"
                                />
                            )}
                            sx={{ minWidth: 180 }}
                            isOptionEqualToValue={(opt, val) =>
                                opt.id === val?.id
                            }
                        />
                        <Autocomplete
                            options={streams}
                            getOptionLabel={(option) => option.name || ""}
                            value={selectedStream}
                            onChange={(_e, newVal) => setSelectedStream(newVal)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Stream"
                                    size="small"
                                />
                            )}
                            sx={{ minWidth: 180 }}
                            isOptionEqualToValue={(opt, val) =>
                                opt.id === val?.id
                            }
                        />
                        <Autocomplete
                            options={parameters}
                            getOptionLabel={(option) =>
                                option.unit
                                    ? `${option.name} (${option.unit})`
                                    : option.name
                            }
                            value={selectedParameter}
                            onChange={(_e, newVal) =>
                                setSelectedParameter(newVal)
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Parameter"
                                    size="small"
                                />
                            )}
                            sx={{ minWidth: 200 }}
                            isOptionEqualToValue={(opt, val) =>
                                opt.id === val?.id
                            }
                        />
                        <ToggleButtonGroup
                            value={timePeriod}
                            exclusive
                            onChange={(_e, val) => {
                                if (val) setTimePeriod(val);
                            }}
                            size="small"
                        >
                            <ToggleButton value="hour">Hour</ToggleButton>
                            <ToggleButton value="day">Day</ToggleButton>
                            <ToggleButton value="month">Month</ToggleButton>
                            <ToggleButton value="year">Year</ToggleButton>
                        </ToggleButtonGroup>
                        <DateTimePicker
                            label="Since"
                            value={since}
                            onChange={setSince}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    sx: { minWidth: 180 },
                                },
                            }}
                        />
                        <DateTimePicker
                            label="Until"
                            value={until}
                            onChange={setUntil}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    sx: { minWidth: 180 },
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleFetch}
                            disabled={!selectedSensor || isLoading}
                        >
                            {isLoading ? "Loading..." : "Load Data"}
                        </Button>
                    </Box>
                </Paper>

                {/* Chart */}
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {isLoading ? (
                    <LoadingSpinner message="Loading chart data..." />
                ) : chartData.length > 0 ? (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    tickFormatter={(val) => {
                                        const date = new Date(val);
                                        if (timePeriod === "hour")
                                            return date.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });
                                        if (timePeriod === "year")
                                            return date
                                                .getFullYear()
                                                .toString();
                                        return date.toLocaleDateString();
                                    }}
                                    fontSize={12}
                                />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    labelFormatter={(val) =>
                                        new Date(val).toLocaleString()
                                    }
                                    formatter={(val) => [
                                        val?.toFixed(4),
                                        "Average",
                                    ]}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="average"
                                    stroke="#1976d2"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 6 }}
                                    name={
                                        selectedParameter
                                            ? `${selectedParameter.name} avg`
                                            : "Average"
                                    }
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                ) : (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 6,
                            textAlign: "center",
                            color: "text.secondary",
                        }}
                    >
                        <Typography>
                            Select a sensor and click &quot;Load Data&quot; to
                            display the chart.
                        </Typography>
                    </Paper>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default TimeSeriesChart;
