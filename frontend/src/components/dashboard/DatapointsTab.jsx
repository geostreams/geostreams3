import { useState } from "react";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Autocomplete,
    TextField,
    Divider,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import useSensors from "../../hooks/useSensors";
import useStreams from "../../hooks/useStreams";
import useParameters from "../../hooks/useParameters";
import useDatapoints from "../../hooks/useDatapoints";
import LoadingSpinner from "../ui/LoadingSpinner";
import StatusMessage from "../ui/StatusMessage";
import DatapointForm from "../forms/DatapointForm";

const DatapointsTab = () => {
    const { sensors } = useSensors();
    const { parameters } = useParameters();
    const { datapoints, isLoading, error, queryDatapoints, createDatapoint } =
        useDatapoints();

    // Form sensor filter for cascading stream dropdown
    const [formSensorId, setFormSensorId] = useState(null);
    const { streams: formStreams } = useStreams(formSensorId);

    // Query filter state
    const [querySensor, setQuerySensor] = useState(null);
    const { streams: queryStreams } = useStreams(querySensor?.id || null);
    const [queryStream, setQueryStream] = useState(null);
    const [querySince, setQuerySince] = useState(null);
    const [queryUntil, setQueryUntil] = useState(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [statusMsg, setStatusMsg] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCreate = async (data) => {
        await createDatapoint(data);
        setStatusMsg({
            open: true,
            message: "Datapoint created successfully",
            severity: "success",
        });
    };

    const handleQuery = () => {
        const filters = {};
        if (queryStream) filters.streamId = queryStream.id;
        if (querySince) filters.since = querySince.toISOString();
        if (queryUntil) filters.until = queryUntil.toISOString();
        queryDatapoints(filters);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                {/* Add Datapoint Section */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Datapoints
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsFormOpen(true)}
                    >
                        Add Datapoint
                    </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Query Section */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Query Datapoints
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Autocomplete
                        options={sensors}
                        getOptionLabel={(option) => option.name || ""}
                        value={querySensor}
                        onChange={(_e, newVal) => {
                            setQuerySensor(newVal);
                            setQueryStream(null);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Sensor"
                                size="small"
                            />
                        )}
                        sx={{ minWidth: 200 }}
                        isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                    />
                    <Autocomplete
                        options={queryStreams}
                        getOptionLabel={(option) => option.name || ""}
                        value={queryStream}
                        onChange={(_e, newVal) => setQueryStream(newVal)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Stream"
                                size="small"
                            />
                        )}
                        sx={{ minWidth: 200 }}
                        isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                    />
                    <DateTimePicker
                        label="Since"
                        value={querySince}
                        onChange={setQuerySince}
                        slotProps={{
                            textField: { size: "small", sx: { minWidth: 200 } },
                        }}
                    />
                    <DateTimePicker
                        label="Until"
                        value={queryUntil}
                        onChange={setQueryUntil}
                        slotProps={{
                            textField: { size: "small", sx: { minWidth: 200 } },
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<SearchIcon />}
                        onClick={handleQuery}
                        disabled={isLoading}
                    >
                        {isLoading ? "Querying..." : "Query"}
                    </Button>
                </Box>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {isLoading ? (
                    <LoadingSpinner message="Loading datapoints..." />
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        ID
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Stream
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Parameter
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Value
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Time
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Created
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {datapoints.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{ py: 4 }}
                                        >
                                            <Typography color="text.secondary">
                                                No datapoints found. Use the
                                                filters above to query, or add
                                                new datapoints.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    datapoints.map((dp) => (
                                        <TableRow key={dp.id} hover>
                                            <TableCell>{dp.id}</TableCell>
                                            <TableCell>
                                                {dp.sensor_name || dp.stream}
                                            </TableCell>
                                            <TableCell>
                                                {dp.parameter || "—"}
                                            </TableCell>
                                            <TableCell>
                                                {dp.value != null
                                                    ? dp.value
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                {dp.time
                                                    ? new Date(
                                                          dp.time,
                                                      ).toLocaleString()
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                {dp.created
                                                    ? new Date(
                                                          dp.created,
                                                      ).toLocaleString()
                                                    : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Create Form Dialog */}
                <DatapointForm
                    open={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleCreate}
                    sensors={sensors}
                    streams={formStreams}
                    parameters={parameters}
                    onSensorChange={setFormSensorId}
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

export default DatapointsTab;
