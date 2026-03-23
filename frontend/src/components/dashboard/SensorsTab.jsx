import { useState } from "react";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useSensors from "../../hooks/useSensors";
import LoadingSpinner from "../ui/LoadingSpinner";
import StatusMessage from "../ui/StatusMessage";
import SensorForm from "../forms/SensorForm";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const SensorsTab = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const {
        sensors,
        pagination,
        isLoading,
        error,
        createSensor,
        deleteSensor,
    } = useSensors(page, rowsPerPage);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [statusMsg, setStatusMsg] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCreate = async (data) => {
        await createSensor(data);
        setStatusMsg({
            open: true,
            message: "Sensor created successfully",
            severity: "success",
        });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteSensor(deleteTarget.id);
            setStatusMsg({
                open: true,
                message: "Sensor deleted successfully",
                severity: "success",
            });
        } catch {
            setStatusMsg({
                open: true,
                message: "Failed to delete sensor",
                severity: "error",
            });
        }
        setDeleteTarget(null);
    };

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const totalCount = pagination?.count ?? 0;

    if (isLoading) return <LoadingSpinner message="Loading sensors..." />;

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Sensors ({totalCount})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsFormOpen(true)}
                >
                    Create Sensor
                </Button>
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
                                Source
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Geo Type
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Created
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sensors.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="center"
                                    sx={{ py: 4 }}
                                >
                                    <Typography color="text.secondary">
                                        No sensors found. Create your first
                                        sensor to get started.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sensors.map((sensor) => (
                                <TableRow key={sensor.id} hover>
                                    <TableCell>{sensor.id}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {sensor.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sensor.source || "N/A"}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{sensor.geoType}</TableCell>
                                    <TableCell>
                                        {sensor.created
                                            ? new Date(
                                                  sensor.created,
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Delete sensor">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    setDeleteTarget(sensor)
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
                {totalCount > 0 && (
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    />
                )}
            </TableContainer>

            {/* Create Form Dialog */}
            <SensorForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreate}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete sensor &quot;
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

export default SensorsTab;
