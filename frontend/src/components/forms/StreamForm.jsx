import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Alert,
    Autocomplete,
    Chip,
} from "@mui/material";

const GEO_TYPES = ["Point", "LineString", "Polygon", "MultiPoint"];

const INITIAL_STATE = {
    name: "",
    sensor: null,
    geoType: "Point",
    latitude: "",
    longitude: "",
    altitude: "0",
    parameters: [],
    properties: "{}",
};

/**
 * Dialog form for creating a new stream.
 * @param {{ open: boolean, onClose: Function, onSubmit: Function, sensors: Array, parameterOptions: Array, lockedSensor?: object }} props
 */
const StreamForm = ({
    open,
    onClose,
    onSubmit,
    sensors = [],
    parameterOptions = [],
    lockedSensor = null,
}) => {
    const [formData, setFormData] = useState({
        ...INITIAL_STATE,
        sensor: lockedSensor ?? null,
    });

    useEffect(() => {
        if (lockedSensor) {
            setFormData((prev) => ({ ...prev, sensor: lockedSensor }));
        }
    }, [lockedSensor]);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError("Name is required");
            return;
        }
        if (!formData.sensor) {
            setError("Sensor is required");
            return;
        }

        let properties;
        try {
            properties = JSON.parse(formData.properties);
        } catch {
            setError("Properties must be valid JSON");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                sensor: formData.sensor.id,
                geoType: formData.geoType,
                geometry: {
                    type: formData.geoType,
                    coordinates: [
                        parseFloat(formData.longitude || 0),
                        parseFloat(formData.latitude || 0),
                        parseFloat(formData.altitude || 0),
                    ],
                },
                parameters: formData.parameters,
                properties,
            };
            await onSubmit(payload);
            setFormData(INITIAL_STATE);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.name?.[0] ||
                    "Failed to create stream",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ ...INITIAL_STATE, sensor: lockedSensor ?? null });
        setError(null);
        onClose();
    };

    const paramOptionLabels = parameterOptions.map((p) => p.name);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>
                Create New Stream
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={handleChange("name")}
                            fullWidth
                            required
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {lockedSensor ? (
                            <TextField
                                label="Sensor"
                                value={lockedSensor.name}
                                fullWidth
                                size="small"
                                disabled
                            />
                        ) : (
                            <Autocomplete
                                options={sensors}
                                getOptionLabel={(option) => option.name || ""}
                                value={formData.sensor}
                                onChange={(_e, newVal) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        sensor: newVal,
                                    }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Sensor"
                                        required
                                        size="small"
                                    />
                                )}
                                isOptionEqualToValue={(opt, val) =>
                                    opt.id === val?.id
                                }
                            />
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Geometry Type"
                            value={formData.geoType}
                            onChange={handleChange("geoType")}
                            select
                            fullWidth
                            size="small"
                        >
                            {GEO_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Latitude"
                            value={formData.latitude}
                            onChange={handleChange("latitude")}
                            type="number"
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Longitude"
                            value={formData.longitude}
                            onChange={handleChange("longitude")}
                            type="number"
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Altitude"
                            value={formData.altitude}
                            onChange={handleChange("altitude")}
                            type="number"
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={paramOptionLabels}
                            value={formData.parameters}
                            onChange={(_e, newVal) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    parameters: newVal,
                                }))
                            }
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option}
                                        size="small"
                                        {...getTagProps({ index })}
                                        key={option}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Parameters"
                                    size="small"
                                    placeholder="Select or type parameter names"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Properties (JSON)"
                            value={formData.properties}
                            onChange={handleChange("properties")}
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            placeholder='{"key": "value"}'
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
                    {isSubmitting ? "Creating..." : "Create Stream"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StreamForm;
