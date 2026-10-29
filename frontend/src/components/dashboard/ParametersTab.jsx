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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Grid,
    Alert,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import useParameters from "../../hooks/useParameters";
import LoadingSpinner from "../ui/LoadingSpinner";
import StatusMessage from "../ui/StatusMessage";
import ParameterForm from "../forms/ParameterForm";

const ParametersTab = () => {
    const {
        parameters,
        isLoadingParams,
        paramsError,
        createParameter,
        updateParameter,
        deleteParameter,
        categories,
        isLoadingCategories,
        createCategory,
        deleteCategory,
        visualizations,
        isLoadingVisualizations,
        createVisualization,
        deleteVisualization,
    } = useParameters();

    // Parameter form state
    const [isParamFormOpen, setIsParamFormOpen] = useState(false);
    const [editParam, setEditParam] = useState(null);
    const [deleteParamTarget, setDeleteParamTarget] = useState(null);

    // Visualization inline form state
    const [vizFormOpen, setVizFormOpen] = useState(false);
    const [vizFormData, setVizFormData] = useState({ name: "", title: "" });
    const [vizFormError, setVizFormError] = useState(null);
    const [deleteVizTarget, setDeleteVizTarget] = useState(null);

    // Category inline form state
    const [catFormOpen, setCatFormOpen] = useState(false);
    const [catFormData, setCatFormData] = useState({
        name: "",
        description: "",
    });
    const [catFormError, setCatFormError] = useState(null);
    const [deleteCatTarget, setDeleteCatTarget] = useState(null);

    const [statusMsg, setStatusMsg] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // --- Parameter handlers ---
    const handleCreateParam = async (data) => {
        await createParameter(data);
        setStatusMsg({
            open: true,
            message: "Parameter created successfully",
            severity: "success",
        });
    };

    const handleUpdateParam = async (data, id) => {
        await updateParameter(id, data);
        setStatusMsg({
            open: true,
            message: "Parameter updated successfully",
            severity: "success",
        });
    };

    const handleDeleteParam = async () => {
        if (!deleteParamTarget) return;
        try {
            await deleteParameter(deleteParamTarget.id);
            setStatusMsg({
                open: true,
                message: "Parameter deleted",
                severity: "success",
            });
        } catch {
            setStatusMsg({
                open: true,
                message: "Failed to delete parameter",
                severity: "error",
            });
        }
        setDeleteParamTarget(null);
    };

    // --- Visualization handlers ---
    const handleCreateViz = async () => {
        if (!vizFormData.name.trim()) {
            setVizFormError("Name is required");
            return;
        }
        try {
            await createVisualization(vizFormData);
            setVizFormData({ name: "", title: "" });
            setVizFormError(null);
            setVizFormOpen(false);
            setStatusMsg({
                open: true,
                message: "Visualization created",
                severity: "success",
            });
        } catch (err) {
            setVizFormError(
                err.response?.data?.message || "Failed to create visualization",
            );
        }
    };

    const handleDeleteViz = async () => {
        if (!deleteVizTarget) return;
        try {
            await deleteVisualization(deleteVizTarget.id);
            setStatusMsg({
                open: true,
                message: "Visualization deleted",
                severity: "success",
            });
        } catch {
            setStatusMsg({
                open: true,
                message: "Failed to delete visualization",
                severity: "error",
            });
        }
        setDeleteVizTarget(null);
    };

    // --- Category handlers ---
    const handleCreateCat = async () => {
        if (!catFormData.name.trim()) {
            setCatFormError("Name is required");
            return;
        }
        try {
            await createCategory(catFormData);
            setCatFormData({ name: "", description: "" });
            setCatFormError(null);
            setCatFormOpen(false);
            setStatusMsg({
                open: true,
                message: "Category created",
                severity: "success",
            });
        } catch (err) {
            setCatFormError(
                err.response?.data?.message || "Failed to create category",
            );
        }
    };

    const handleDeleteCat = async () => {
        if (!deleteCatTarget) return;
        try {
            await deleteCategory(deleteCatTarget.id);
            setStatusMsg({
                open: true,
                message: "Category deleted",
                severity: "success",
            });
        } catch {
            setStatusMsg({
                open: true,
                message: "Failed to delete category",
                severity: "error",
            });
        }
        setDeleteCatTarget(null);
    };

    if (isLoadingParams)
        return <LoadingSpinner message="Loading parameters..." />;

    return (
        <Box>
            {/* Section A: Visualizations */}
            <Accordion defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                        Visualizations ({visualizations.length})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mb: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setVizFormOpen(true)}
                        >
                            Add Visualization
                        </Button>
                    </Box>
                    {isLoadingVisualizations ? (
                        <LoadingSpinner message="Loading visualizations..." />
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
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
                                            Title
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
                                    {visualizations.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                align="center"
                                                sx={{ py: 3 }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    No visualizations found.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        visualizations.map((viz) => (
                                            <TableRow key={viz.id} hover>
                                                <TableCell>{viz.id}</TableCell>
                                                <TableCell>
                                                    {viz.name}
                                                </TableCell>
                                                <TableCell>
                                                    {viz.title}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Delete visualization">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                setDeleteVizTarget(
                                                                    viz,
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
                </AccordionDetails>
            </Accordion>

            {/* Section B: Categories */}
            <Accordion defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                        Categories ({categories.length})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mb: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setCatFormOpen(true)}
                        >
                            Add Category
                        </Button>
                    </Box>
                    {isLoadingCategories ? (
                        <LoadingSpinner message="Loading categories..." />
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
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
                                            Description
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
                                    {categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                align="center"
                                                sx={{ py: 3 }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    No categories found.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((cat) => (
                                            <TableRow key={cat.id} hover>
                                                <TableCell>{cat.id}</TableCell>
                                                <TableCell>
                                                    {cat.name}
                                                </TableCell>
                                                <TableCell>
                                                    {cat.description || "—"}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Delete category">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                setDeleteCatTarget(
                                                                    cat,
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
                </AccordionDetails>
            </Accordion>

            {/* Section C: Parameters */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                        Parameters ({parameters.length})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {paramsError && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {paramsError}
                        </Typography>
                    )}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mb: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditParam(null);
                                setIsParamFormOpen(true);
                            }}
                        >
                            Create Parameter
                        </Button>
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
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
                                        Title
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Unit
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Visualization
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Categories
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
                                {parameters.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            align="center"
                                            sx={{ py: 4 }}
                                        >
                                            <Typography color="text.secondary">
                                                No parameters found. Create
                                                visualizations and categories
                                                first, then add parameters.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    parameters.map((param) => (
                                        <TableRow key={param.id} hover>
                                            <TableCell>{param.id}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    {param.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{param.title}</TableCell>
                                            <TableCell>
                                                {param.unit || "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        param.visualization ||
                                                        "N/A"
                                                    }
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
                                                    {(
                                                        param.categories || []
                                                    ).map((cat) => (
                                                        <Chip
                                                            key={
                                                                cat.name || cat
                                                            }
                                                            label={
                                                                cat.name || cat
                                                            }
                                                            size="small"
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit parameter">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => {
                                                            setEditParam(param);
                                                            setIsParamFormOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete parameter">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            setDeleteParamTarget(
                                                                param,
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
                </AccordionDetails>
            </Accordion>

            {/* Parameter Create/Edit Dialog */}
            <ParameterForm
                open={isParamFormOpen}
                onClose={() => {
                    setIsParamFormOpen(false);
                    setEditParam(null);
                }}
                onSubmit={editParam ? handleUpdateParam : handleCreateParam}
                visualizations={visualizations}
                categories={categories}
                editData={editParam}
            />

            {/* Visualization Create Dialog */}
            <Dialog
                open={vizFormOpen}
                onClose={() => setVizFormOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Add Visualization
                </DialogTitle>
                <DialogContent>
                    {vizFormError && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {vizFormError}
                        </Alert>
                    )}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                value={vizFormData.name}
                                onChange={(e) =>
                                    setVizFormData((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                fullWidth
                                required
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Title"
                                value={vizFormData.title}
                                onChange={(e) =>
                                    setVizFormData((p) => ({
                                        ...p,
                                        title: e.target.value,
                                    }))
                                }
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setVizFormOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleCreateViz}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Category Create Dialog */}
            <Dialog
                open={catFormOpen}
                onClose={() => setCatFormOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Add Category</DialogTitle>
                <DialogContent>
                    {catFormError && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {catFormError}
                        </Alert>
                    )}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                value={catFormData.name}
                                onChange={(e) =>
                                    setCatFormData((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                fullWidth
                                required
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={catFormData.description}
                                onChange={(e) =>
                                    setCatFormData((p) => ({
                                        ...p,
                                        description: e.target.value,
                                    }))
                                }
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCatFormOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleCreateCat}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Parameter Confirmation */}
            <Dialog
                open={Boolean(deleteParamTarget)}
                onClose={() => setDeleteParamTarget(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete parameter &quot;{deleteParamTarget?.name}&quot;?
                        This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteParamTarget(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteParam}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Visualization Confirmation */}
            <Dialog
                open={Boolean(deleteVizTarget)}
                onClose={() => setDeleteVizTarget(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete visualization &quot;{deleteVizTarget?.name}
                        &quot;?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteVizTarget(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteViz}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Category Confirmation */}
            <Dialog
                open={Boolean(deleteCatTarget)}
                onClose={() => setDeleteCatTarget(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete category &quot;{deleteCatTarget?.name}&quot;?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteCatTarget(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteCat}
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

export default ParametersTab;
