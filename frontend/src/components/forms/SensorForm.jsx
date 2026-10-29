import { useState } from "react";
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
} from "@mui/material";

const GEO_TYPES = ["Point", "LineString", "Polygon", "MultiPoint"];

const INITIAL_STATE = {
    name: "",
    source: "",
    geoType: "Point",
    latitude: "",
    longitude: "",
    altitude: "0",
    properties: "{}",
};

/**
 * Dialog form for creating a new sensor.
 */
const SensorForm = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(INITIAL_STATE);
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
        if (!formData.latitude || !formData.longitude) {
            setError("Latitude and longitude are required");
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
                source: formData.source.trim(),
                geoType: formData.geoType,
                geometry: {
                    type: formData.geoType,
                    coordinates: [
                        parseFloat(formData.longitude),
                        parseFloat(formData.latitude),
                        parseFloat(formData.altitude || 0),
                    ],
                },
                properties,
            };
            await onSubmit(payload);
            setFormData(INITIAL_STATE);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.name?.[0] ||
                    "Failed to create sensor",
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
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>
                Create New Sensor
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
                        <TextField
                            label="Source"
                            value={formData.source}
                            onChange={handleChange("source")}
                            fullWidth
                            size="small"
                        />
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
                            required
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
                            required
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
                    {isSubmitting ? "Creating..." : "Create Sensor"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SensorForm;
