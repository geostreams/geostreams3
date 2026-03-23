import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useParamNames } from "../../contexts/ParametersContext";
import {
    Box,
    Button,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    Typography,
    Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import useSensors from "../../hooks/useSensors";
import LoadingSpinner from "../ui/LoadingSpinner";
import StatusMessage from "../ui/StatusMessage";
import SensorForm from "../forms/SensorForm";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const SensorsTab = () => {
    const paramNameMap = useParamNames();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const { sensors, pagination, isLoading, error, createSensor } = useSensors(
        page,
        rowsPerPage,
    );

    const [isFormOpen, setIsFormOpen] = useState(false);
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
                                Parameters
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Created
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sensors.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
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
                                        <Link
                                            component={RouterLink}
                                            to={`/dashboard/sensors/${sensor.id}`}
                                            underline="hover"
                                            color="primary"
                                            sx={{
                                                fontWeight: 500,
                                                textAlign: "left",
                                            }}
                                        >
                                            {sensor.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sensor.source || "N/A"}
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
                                            {(sensor.parameters || [])
                                                .slice(0, 2)
                                                .map((p) => (
                                                    <Chip
                                                        key={p}
                                                        label={
                                                            paramNameMap[p] || p
                                                        }
                                                        title={p}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            {(sensor.parameters || []).length >
                                                2 && (
                                                <Chip
                                                    label={`+${sensor.parameters.length - 2}`}
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {sensor.created
                                            ? new Date(
                                                  sensor.created,
                                              ).toLocaleDateString()
                                            : "N/A"}
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
