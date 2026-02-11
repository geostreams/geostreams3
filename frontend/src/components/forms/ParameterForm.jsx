import { useState, useEffect } from "react";
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
} from "@mui/material";

const INITIAL_STATE = {
    name: "",
    title: "",
    unit: "",
    visualization: null,
    category: null,
    properties: "{}",
};

/**
 * Dialog form for creating or editing a parameter.
 * @param {{ open: boolean, onClose: Function, onSubmit: Function, visualizations: Array, categories: Array, editData?: object|null }} props
 */
const ParameterForm = ({
    open,
    onClose,
    onSubmit,
    visualizations = [],
    categories = [],
    editData = null,
}) => {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = Boolean(editData);

    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name || "",
                title: editData.title || "",
                unit: editData.unit || "",
                visualization: editData.visualization
                    ? visualizations.find(
                          (v) => v.name === editData.visualization,
                      ) || null
                    : null,
                category:
                    editData.categories?.length > 0
                        ? categories.find(
                              (c) => c.name === editData.categories[0]?.name,
                          ) || null
                        : null,
                properties: editData.properties
                    ? JSON.stringify(editData.properties, null, 2)
                    : "{}",
            });
        } else {
            setFormData(INITIAL_STATE);
        }
    }, [editData, visualizations, categories]);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError("Name is required");
            return;
        }
        if (!formData.title.trim()) {
            setError("Title is required");
            return;
        }
        if (!formData.visualization) {
            setError("Visualization is required");
            return;
        }
        if (!formData.category) {
            setError("Category is required");
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
                title: formData.title.trim(),
                unit: formData.unit.trim(),
                visualization: formData.visualization.name,
                category: formData.category.name,
                properties,
            };
            await onSubmit(payload, editData?.id);
            setFormData(INITIAL_STATE);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save parameter");
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
                {isEditing ? "Edit Parameter" : "Create New Parameter"}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={handleChange("name")}
                            fullWidth
                            required
                            size="small"
                            placeholder="e.g. dissolved_oxygen"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={handleChange("title")}
                            fullWidth
                            required
                            size="small"
                            placeholder="e.g. Dissolved Oxygen"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Unit"
                            value={formData.unit}
                            onChange={handleChange("unit")}
                            fullWidth
                            size="small"
                            placeholder="e.g. mg/L, °C"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            options={visualizations}
                            getOptionLabel={(option) => option.name || ""}
                            value={formData.visualization}
                            onChange={(_e, newVal) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    visualization: newVal,
                                }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Visualization"
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
                            options={categories}
                            getOptionLabel={(option) => option.name || ""}
                            value={formData.category}
                            onChange={(_e, newVal) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    category: newVal,
                                }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Category"
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
                        <TextField
                            label="Properties (JSON)"
                            value={formData.properties}
                            onChange={handleChange("properties")}
                            fullWidth
                            multiline
                            rows={3}
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
                    {isSubmitting
                        ? "Saving..."
                        : isEditing
                          ? "Update Parameter"
                          : "Create Parameter"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParameterForm;
