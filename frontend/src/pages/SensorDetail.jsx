import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Divider,
    FormControl,
    InputLabel,
    Stack,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    BarChart as BarChartIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
} from "recharts";
import useSensor from "../hooks/useSensor";
import useStreams from "../hooks/useStreams";
import useAggregates from "../hooks/useAggregates";
import useApiClient from "../hooks/useApiClient";
import {
    useParamNames,
    useParamUnits,
    useParametersList,
} from "../contexts/ParametersContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatusMessage from "../components/ui/StatusMessage";
import StreamForm from "../components/forms/StreamForm";
import DatapointForm from "../components/forms/DatapointForm";

const CHART_COLORS = [
    "#2196f3",
    "#4caf50",
    "#ff9800",
    "#e91e63",
    "#9c27b0",
    "#00bcd4",
    "#ff5722",
    "#8bc34a",
];

const TIME_PERIODS = [
    { value: "hour", label: "Hourly" },
    { value: "day", label: "Daily" },
    { value: "month", label: "Monthly" },
    { value: "year", label: "Yearly" },
];

/**
 * Picks up to 5 evenly-spaced values from an array for use as axis ticks.
 */
function buildTicks(values) {
    if (!values || values.length <= 5) return values ?? [];
    const step = (values.length - 1) / 4;
    return [
        ...new Set(
            Array.from({ length: 5 }, (_, i) => values[Math.round(i * step)]),
        ),
    ].filter(Boolean);
}

/**
 * Formats an ISO date string into a human-readable label based on the
 * aggregation period chosen by the user.
 */
function formatDate(isoString, period) {
    const d = dayjs.utc(isoString);
    if (period === "year") return d.format("YYYY");
    if (period === "month") return d.format("MMM YYYY");
    if (period === "day") return d.format("MMM D, YYYY");
    return d.format("MMM D, YYYY HH:mm");
}

/**
 * Renders the correct date/time picker variant for the selected aggregation period.
 * - hour  → DateTimePicker (full date + time)
 * - day   → DatePicker (date only)
 * - month → DatePicker (year + month only)
 * - year  → DatePicker (year only)
 */
function PeriodDatePicker({
    label,
    value,
    onChange,
    period,
    minDate,
    maxDate,
}) {
    const commonProps = {
        label,
        value,
        onChange,
        minDate,
        maxDate,
        slotProps: { textField: { size: "small", sx: { minWidth: 180 } } },
    };

    if (period === "hour") {
        return <DateTimePicker {...commonProps} />;
    }
    if (period === "month") {
        return (
            <DatePicker
                {...commonProps}
                views={["year", "month"]}
                openTo="month"
            />
        );
    }
    if (period === "year") {
        return <DatePicker {...commonProps} views={["year"]} openTo="year" />;
    }
    return <DatePicker {...commonProps} views={["year", "month", "day"]} />;
}

const SensorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const authApi = useApiClient();

    const {
        sensor,
        isLoading: sensorLoading,
        error: sensorError,
    } = useSensor(id);
    const {
        streams,
        isLoading: streamsLoading,
        refetch: refetchStreams,
        createStream,
        deleteStream,
    } = useStreams(id);
    const parameters = useParametersList();
    const paramNameMap = useParamNames();
    const paramUnitMap = useParamUnits();
    const {
        data: aggregateRows,
        isLoading: chartLoading,
        error: chartError,
        fetchAggregates,
    } = useAggregates();

    const [period, setPeriod] = useState("day");
    // Tracks the period that was actually used for the last successful fetch,
    // so chart labels only reformat when new data loads, not on dropdown change.
    const [loadedPeriod, setLoadedPeriod] = useState("day");
    const [since, setSince] = useState(null);
    const [until, setUntil] = useState(null);

    const [isStreamFormOpen, setIsStreamFormOpen] = useState(false);
    const [streamDeleteTarget, setStreamDeleteTarget] = useState(null);
    const [isDatapointFormOpen, setIsDatapointFormOpen] = useState(false);
    const [isDeleteSensorDialogOpen, setIsDeleteSensorDialogOpen] =
        useState(false);

    const [statusMsg, setStatusMsg] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Once the sensor loads, seed since/until from its data range and auto-fetch
    const autoLoadedRef = useRef(false);
    useEffect(() => {
        if (!sensor || autoLoadedRef.current) return;
        autoLoadedRef.current = true;

        const defaultSince = sensor.min_start_time
            ? dayjs(sensor.min_start_time)
            : null;
        const defaultUntil = sensor.max_end_time
            ? dayjs(sensor.max_end_time)
            : null;

        setSince(defaultSince);
        setUntil(defaultUntil);

        fetchAggregates({
            sensorId: id,
            timePeriod: period,
            since: defaultSince ? defaultSince.toISOString() : undefined,
            until: defaultUntil ? defaultUntil.toISOString() : undefined,
        });
        setLoadedPeriod(period);
    }, [sensor]);

    const handleLoadChart = () => {
        if (!id) return;
        fetchAggregates({
            sensorId: id,
            timePeriod: period,
            since: since ? since.toISOString() : undefined,
            until: until ? until.toISOString() : undefined,
        });
        setLoadedPeriod(period);
    };

    const handleCreateStream = async (data) => {
        await createStream(data);
        setStatusMsg({
            open: true,
            message: "Stream created successfully",
            severity: "success",
        });
    };

    const handleDeleteStream = async () => {
        if (!streamDeleteTarget) return;
        try {
            await deleteStream(streamDeleteTarget.id);
            setStatusMsg({
                open: true,
                message: "Stream deleted successfully",
                severity: "success",
            });
        } catch {
            setStatusMsg({
                open: true,
                message: "Failed to delete stream",
                severity: "error",
            });
        }
        setStreamDeleteTarget(null);
    };

    const handleCreateDatapoint = async (data) => {
        await authApi.post("data/datapoints/", data);
        setStatusMsg({
            open: true,
            message: "Datapoint added successfully",
            severity: "success",
        });
    };

    const handleDeleteSensor = async () => {
        try {
            await authApi.delete(`data/sensors/${id}/`);
            setIsDeleteSensorDialogOpen(false);
            navigate("/dashboard");
        } catch {
            setStatusMsg({
                open: true,
                message: "Failed to delete sensor",
                severity: "error",
            });
            setIsDeleteSensorDialogOpen(false);
        }
    };

    const chartParams = useMemo(
        () => [...new Set(aggregateRows.map((r) => r.parameter))],
        [aggregateRows],
    );

    if (sensorLoading) return <LoadingSpinner message="Loading sensor..." />;

    if (sensorError || !sensor) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="error" variant="h6">
                    {sensorError || "Sensor not found"}
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                >
                    Back
                </Button>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{ maxWidth: "xl", mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}
            >
                {/* Back button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2 }}
                >
                    Back to Dashboard
                </Button>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                            gap: 2,
                            mb: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                background:
                                    "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            {sensor.name}
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setIsDeleteSensorDialogOpen(true)}
                            size="small"
                        >
                            Delete Sensor
                        </Button>
                    </Box>
                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        {sensor.source && (
                            <Chip
                                label={`Source: ${sensor.source}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        )}
                        {sensor.geometry && (
                            <Chip
                                label={`${sensor.geometry.type}: ${sensor.geometry.coordinates[1]?.toFixed(4)}°N, ${sensor.geometry.coordinates[0]?.toFixed(4)}°E`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {sensor.created && (
                            <Chip
                                label={`Created: ${new Date(sensor.created).toLocaleDateString()}`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {sensor.properties &&
                            Object.entries(sensor.properties).map(
                                ([key, val]) => (
                                    <Chip
                                        key={key}
                                        label={`${key}: ${val}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                ),
                            )}
                    </Stack>
                </Box>

                {/* ── Streams Section ── */}
                <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Streams ({streams.length})
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsStreamFormOpen(true)}
                            size="small"
                        >
                            Add Stream
                        </Button>
                    </Box>

                    {streamsLoading ? (
                        <LoadingSpinner message="Loading streams..." />
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            ID
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            Name
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            Parameters
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            Time Range
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 600 }}
                                            align="right"
                                        >
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {streams.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                align="center"
                                                sx={{ py: 3 }}
                                            >
                                                <Typography color="text.secondary">
                                                    No streams yet. Add a stream
                                                    to start collecting data.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        streams.map((stream) => (
                                            <TableRow key={stream.id} hover>
                                                <TableCell>
                                                    {stream.id}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontWeight: 500 }}
                                                    >
                                                        {stream.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            gap: 0.5,
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        {(
                                                            stream.parameters ||
                                                            []
                                                        )
                                                            .slice(0, 3)
                                                            .map((p) => (
                                                                <Chip
                                                                    key={p}
                                                                    label={
                                                                        paramNameMap[
                                                                            p
                                                                        ] || p
                                                                    }
                                                                    size="small"
                                                                    title={p}
                                                                />
                                                            ))}
                                                        {(
                                                            stream.parameters ||
                                                            []
                                                        ).length > 3 && (
                                                            <Chip
                                                                label={`+${stream.parameters.length - 3}`}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {stream.start_time
                                                            ? new Date(
                                                                  stream.start_time,
                                                              ).toLocaleDateString()
                                                            : "N/A"}{" "}
                                                        &mdash;{" "}
                                                        {stream.end_time
                                                            ? new Date(
                                                                  stream.end_time,
                                                              ).toLocaleDateString()
                                                            : "N/A"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Delete stream">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                setStreamDeleteTarget(
                                                                    stream,
                                                                )
                                                            }
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* ── Data Visualization Section ── */}
                <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
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
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsDatapointFormOpen(true)}
                            size="small"
                        >
                            Add Datapoint
                        </Button>
                    </Box>

                    {/* Chart controls */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ sm: "center" }}
                        flexWrap="wrap"
                        sx={{ mb: 3 }}
                    >
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Time Period</InputLabel>
                            <Select
                                value={period}
                                label="Time Period"
                                onChange={(e) => setPeriod(e.target.value)}
                            >
                                {TIME_PERIODS.map((tp) => (
                                    <MenuItem key={tp.value} value={tp.value}>
                                        {tp.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <PeriodDatePicker
                            label="Since"
                            value={since}
                            onChange={setSince}
                            period={period}
                            minDate={
                                sensor.min_start_time
                                    ? dayjs(sensor.min_start_time)
                                    : undefined
                            }
                            maxDate={
                                until ??
                                (sensor.max_end_time
                                    ? dayjs(sensor.max_end_time)
                                    : undefined)
                            }
                        />

                        <PeriodDatePicker
                            label="Until"
                            value={until}
                            onChange={setUntil}
                            period={period}
                            minDate={
                                since ??
                                (sensor.min_start_time
                                    ? dayjs(sensor.min_start_time)
                                    : undefined)
                            }
                            maxDate={
                                sensor.max_end_time
                                    ? dayjs(sensor.max_end_time)
                                    : undefined
                            }
                        />

                        <Button
                            variant="outlined"
                            startIcon={<BarChartIcon />}
                            onClick={handleLoadChart}
                            disabled={chartLoading}
                        >
                            {chartLoading ? "Loading..." : "Load Data"}
                        </Button>
                    </Stack>

                    <Divider sx={{ mb: 3 }} />

                    {chartError && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {chartError}
                        </Typography>
                    )}

                    {aggregateRows.length === 0 && !chartLoading ? (
                        <Box
                            sx={{
                                height: 300,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: 1,
                                color: "text.secondary",
                                border: "1px dashed",
                                borderColor: "divider",
                                borderRadius: 2,
                            }}
                        >
                            <BarChartIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            <Typography variant="body2">
                                Select a time period and click &quot;Load
                                Data&quot; to visualize sensor data.
                            </Typography>
                        </Box>
                    ) : chartLoading ? (
                        <LoadingSpinner message="Loading chart data..." />
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                            }}
                        >
                            {chartParams.map((param, idx) => {
                                const color =
                                    CHART_COLORS[idx % CHART_COLORS.length];
                                const paramTitle = paramNameMap[param] || param;
                                const paramUnit = paramUnitMap[param] || "";
                                const scatterData = aggregateRows
                                    .filter((r) => r.parameter === param)
                                    .sort((a, b) =>
                                        a.date.localeCompare(b.date),
                                    )
                                    .map((r) => ({
                                        x: formatDate(r.date, loadedPeriod),
                                        y: r.average,
                                    }));
                                const xTicks = buildTicks(
                                    scatterData.map((d) => d.x),
                                );

                                return (
                                    <Box key={param}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 600,
                                                color: "text.primary",
                                            }}
                                        >
                                            {paramTitle}
                                            {paramUnit && (
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{
                                                        ml: 1,
                                                        color: "text.secondary",
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    ({paramUnit})
                                                </Typography>
                                            )}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: "block",
                                                mb: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            {param}
                                        </Typography>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >
                                            <ScatterChart
                                                margin={{
                                                    top: 10,
                                                    right: 20,
                                                    bottom: 40,
                                                    left: 50,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="x"
                                                    type="category"
                                                    ticks={xTicks}
                                                    interval={0}
                                                    textAnchor="end"
                                                    height={55}
                                                    tickMargin={6}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis
                                                    dataKey="y"
                                                    tick={{ fontSize: 12 }}
                                                    label={
                                                        paramUnit
                                                            ? {
                                                                  value: paramUnit,
                                                                  angle: -90,
                                                                  position:
                                                                      "insideLeft",
                                                                  offset: -10,
                                                                  style: {
                                                                      fontSize: 12,
                                                                  },
                                                              }
                                                            : undefined
                                                    }
                                                />
                                                <RechartsTooltip
                                                    cursor={{
                                                        strokeDasharray: "3 3",
                                                    }}
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            !active ||
                                                            !payload?.length
                                                        )
                                                            return null;
                                                        const { x, y } =
                                                            payload[0].payload;
                                                        return (
                                                            <Box
                                                                sx={{
                                                                    background:
                                                                        "rgba(255,255,255,0.97)",
                                                                    border: "1px solid #e5e7eb",
                                                                    borderRadius: 1.5,
                                                                    p: "8px 12px",
                                                                    boxShadow: 1,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        display:
                                                                            "block",
                                                                        fontWeight: 600,
                                                                        color: "text.secondary",
                                                                        mb: 0.25,
                                                                    }}
                                                                >
                                                                    {x}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color,
                                                                    }}
                                                                >
                                                                    {paramTitle}
                                                                    :{" "}
                                                                    {typeof y ===
                                                                    "number"
                                                                        ? y.toFixed(
                                                                              4,
                                                                          )
                                                                        : y}
                                                                    {paramUnit
                                                                        ? ` ${paramUnit}`
                                                                        : ""}
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    }}
                                                />
                                                <Scatter
                                                    data={scatterData}
                                                    fill={color}
                                                    opacity={0.8}
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Paper>

                {/* ── Stream Form Dialog ── */}
                <StreamForm
                    open={isStreamFormOpen}
                    onClose={() => setIsStreamFormOpen(false)}
                    onSubmit={handleCreateStream}
                    lockedSensor={sensor}
                    parameterOptions={parameters}
                />

                {/* ── Stream Delete Confirm ── */}
                <Dialog
                    open={Boolean(streamDeleteTarget)}
                    onClose={() => setStreamDeleteTarget(null)}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete stream &quot;
                            {streamDeleteTarget?.name}&quot;? This action cannot
                            be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setStreamDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteStream}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── Sensor Delete Confirm ── */}
                <Dialog
                    open={isDeleteSensorDialogOpen}
                    onClose={() => setIsDeleteSensorDialogOpen(false)}
                >
                    <DialogTitle>Delete Sensor</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete sensor &quot;
                            {sensor.name}&quot;? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setIsDeleteSensorDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteSensor}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── Datapoint Form Dialog ── */}
                <DatapointForm
                    open={isDatapointFormOpen}
                    onClose={() => setIsDatapointFormOpen(false)}
                    onSubmit={handleCreateDatapoint}
                    lockedSensor={{ id: Number(id), name: sensor.name }}
                    streams={streams}
                    parameters={parameters}
                />

                <StatusMessage
                    open={statusMsg.open}
                    message={statusMsg.message}
                    severity={statusMsg.severity}
                    onClose={() =>
                        setStatusMsg((prev) => ({ ...prev, open: false }))
                    }
                />
            </Box>
        </LocalizationProvider>
    );
};

export default SensorDetail;
