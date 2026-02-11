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
    IconButton,
    Tooltip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Autocomplete,
    TextField,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useSensors from "../../hooks/useSensors";
import useStreams from "../../hooks/useStreams";
import useParameters from "../../hooks/useParameters";
import LoadingSpinner from "../ui/LoadingSpinner";
import StatusMessage from "../ui/StatusMessage";
import StreamForm from "../forms/StreamForm";

const StreamsTab = () => {
    const { sensors } = useSensors();
    const { parameters } = useParameters();
    const [filterSensor, setFilterSensor] = useState(null);
    const { streams, isLoading, error, createStream, deleteStream } =
        useStreams(filterSensor?.id || null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [statusMsg, setStatusMsg] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCreate = async (data) => {
        await createStream(data);
        setStatusMsg({
            open: true,
            message: "Stream created successfully",
            severity: "success",
        });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteStream(deleteTarget.id);
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
        setDeleteTarget(null);
    };

    const getSensorName = (sensorId) => {
        const sensor = sensors.find((s) => s.id === sensorId);
        return sensor ? sensor.name : sensorId;
    };

    if (isLoading) return <LoadingSpinner message="Loading streams..." />;

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    gap: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, flexShrink: 0 }}
                >
                    Streams ({streams.length})
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Autocomplete
                        options={sensors}
                        getOptionLabel={(option) => option.name || ""}
                        value={filterSensor}
                        onChange={(_e, newVal) => setFilterSensor(newVal)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Filter by Sensor"
                                size="small"
                            />
                        )}
                        sx={{ minWidth: 250 }}
                        isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsFormOpen(true)}
                        sx={{ flexShrink: 0 }}
                    >
                        Create Stream
                    </Button>
                </Box>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Sensor
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Parameters
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Time Range
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {streams.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="center"
                                    sx={{ py: 4 }}
                                >
                                    <Typography color="text.secondary">
                                        No streams found. Create your first
                                        stream to get started.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            streams.map((stream) => (
                                <TableRow key={stream.id} hover>
                                    <TableCell>{stream.id}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {stream.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getSensorName(stream.sensor)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 0.5,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {(stream.parameters || [])
                                                .slice(0, 3)
                                                .map((p) => (
                                                    <Chip
                                                        key={p}
                                                        label={p}
                                                        size="small"
                                                    />
                                                ))}
                                            {(stream.parameters || []).length >
                                                3 && (
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
                                                    setDeleteTarget(stream)
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

            {/* Create Form Dialog */}
            <StreamForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreate}
                sensors={sensors}
                parameterOptions={parameters}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete stream &quot;
                        {deleteTarget?.name}&quot;? This action cannot be
                        undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <StatusMessage
                open={statusMsg.open}
                message={statusMsg.message}
                severity={statusMsg.severity}
                onClose={() =>
                    setStatusMsg((prev) => ({ ...prev, open: false }))
                }
            />
        </Box>
    );
};

export default StreamsTab;
