import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Alert,
    Autocomplete,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

const INITIAL_STATE = {
    sensor: null,
    stream: null,
    parameter: null,
    time: dayjs(),
    value: "",
};

/**
 * Dialog form for creating a new datapoint.
 * @param {{ open: boolean, onClose: Function, onSubmit: Function, sensors: Array, streams: Array, parameters: Array, onSensorChange?: Function, lockedSensor?: { id: number, name: string } | null }} props
 */
const DatapointForm = ({
    open,
    onClose,
    onSubmit,
    sensors = [],
    streams = [],
    parameters = [],
    onSensorChange,
    lockedSensor = null,
}) => {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const lockedSensorId = lockedSensor?.id ?? null;

    const handleSubmit = async () => {
        if (!formData.stream) {
            setError("Stream is required");
            return;
        }
        if (!formData.parameter) {
            setError("Parameter is required");
            return;
        }
        if (formData.value === "" || formData.value === null) {
            setError("Value is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                stream_id: formData.stream.id,
                type: "Feature",
                properties: {
                    [formData.parameter.name]: parseFloat(formData.value),
                },
                geometry: null,
                start_time: formData.time.toISOString(),
                end_time: formData.time.toISOString(),
            };
            await onSubmit(payload);
            setFormData(INITIAL_STATE);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to create datapoint",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData(INITIAL_STATE);
        setError(null);
        onClose();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {lockedSensorId
                        ? "Add Datapoint to Sensor"
                        : "Add New Datapoint"}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {error}
                        </Alert>
                    )}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {lockedSensorId && (
                            <Grid item xs={12}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Sensor:{" "}
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {lockedSensor?.name ||
                                            "Name not available"}
                                    </Typography>
                                </Typography>
                            </Grid>
                        )}
                        {!lockedSensorId && (
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={sensors}
                                    getOptionLabel={(option) =>
                                        option.name || ""
                                    }
                                    value={formData.sensor}
                                    onChange={(_e, newVal) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            sensor: newVal,
                                            stream: null,
                                        }));
                                        if (onSensorChange)
                                            onSensorChange(newVal?.id || null);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Sensor (to filter streams)"
                                            size="small"
                                        />
                                    )}
                                    isOptionEqualToValue={(opt, val) =>
                                        opt.id === val?.id
                                    }
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Autocomplete
                                options={streams}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.stream}
                                onChange={(_e, newVal) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        stream: newVal,
                                    }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Stream"
                                        required
                                        size="small"
                                    />
                                )}
                                isOptionEqualToValue={(opt, val) =>
                                    opt.id === val?.id
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={parameters}
                                getOptionLabel={(option) => {
                                    const displayTitle = option.title || "";
                                    const displayName = option.name || "";

                                    if (displayTitle && displayName) {
                                        return `${displayTitle} (${displayName})`;
                                    }

                                    return displayTitle || displayName;
                                }}
                                value={formData.parameter}
                                onChange={(_e, newVal) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        parameter: newVal,
                                    }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Parameter"
                                        required
                                        size="small"
                                    />
                                )}
                                isOptionEqualToValue={(opt, val) =>
                                    opt.id === val?.id
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimePicker
                                label="Time"
                                value={formData.time}
                                onChange={(newVal) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        time: newVal,
                                    }))
                                }
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Value"
                                value={formData.value}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        value: e.target.value,
                                    }))
                                }
                                type="number"
                                fullWidth
                                required
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Adding..." : "Add Datapoint"}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default DatapointForm;
