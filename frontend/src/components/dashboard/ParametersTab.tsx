import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "../../api/apiClient";
import useParameters from "../../hooks/useParameters";
import type {
    Category,
    Parameter,
    ParameterInput,
    Visualization,
} from "../../types/api";
import ParameterForm from "../forms/ParameterForm";
import LoadingSpinner from "../ui/LoadingSpinner";
import { DeleteDialog, NamedItemDialog } from "./ParameterDialogs";
import {
    ActionsHead,
    EmptyRow,
    RowActions,
    Section,
} from "./ParameterTableParts";

type DeleteTarget =
    | { kind: "parameter"; item: Parameter }
    | { kind: "visualization"; item: Visualization }
    | { kind: "category"; item: Category };

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

    const [isParamFormOpen, setIsParamFormOpen] = useState(false);
    const [editParam, setEditParam] = useState<Parameter | null>(null);
    const [vizFormOpen, setVizFormOpen] = useState(false);
    const [catFormOpen, setCatFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openParamForm = (param: Parameter | null) => {
        setEditParam(param);
        setIsParamFormOpen(true);
    };

    const closeParamForm = () => {
        setIsParamFormOpen(false);
        setEditParam(null);
    };

    const handleParamSubmit = async (payload: ParameterInput, id?: number) => {
        if (id !== undefined) {
            await updateParameter(id, payload);
            toast.success("Data property updated");
        } else {
            await createParameter(payload);
            toast.success("Data property created");
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setIsDeleting(true);
        try {
            if (deleting.kind === "parameter") {
                await deleteParameter(deleting.item.id);
                toast.success("Data property deleted");
            } else if (deleting.kind === "visualization") {
                await deleteVisualization(deleting.item.id);
                toast.success("Visualization deleted");
            } else {
                await deleteCategory(deleting.item.id);
                toast.success("Category deleted");
            }
            setDeleting(null);
        } catch (err) {
            toast.error(
                getErrorMessage(err, `Failed to delete ${deleting.kind}`),
            );
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoadingParams && parameters.length === 0) {
        return <LoadingSpinner message="Loading data properties..." />;
    }

    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
            {paramsError && (
                <p role="alert" className="text-sm text-destructive">
                    {paramsError}
                </p>
            )}

            <Section
                title="Data properties"
                count={parameters.length}
                action={
                    <Button onClick={() => openParamForm(null)}>
                        <Plus aria-hidden /> Create data property
                    </Button>
                }
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Visualization</TableHead>
                            <TableHead>Categories</TableHead>
                            <ActionsHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parameters.length === 0 ? (
                            <EmptyRow
                                colSpan={7}
                                text="No data properties found. Create a visualization and a category first, then add a data property."
                            />
                        ) : (
                            parameters.map((param) => (
                                <TableRow key={param.id}>
                                    <TableCell>{param.id}</TableCell>
                                    <TableCell className="max-w-56 whitespace-normal break-all font-medium">
                                        {param.name}
                                    </TableCell>
                                    <TableCell className="max-w-56 whitespace-normal">
                                        {param.title}
                                    </TableCell>
                                    <TableCell>{param.unit || "—"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {param.visualization || "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {param.categories.map((cat) => (
                                                <Badge
                                                    key={cat.name}
                                                    variant="secondary"
                                                >
                                                    {cat.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <RowActions
                                        label={param.title || param.name}
                                        onEdit={() => openParamForm(param)}
                                        onDelete={() =>
                                            setDeleting({
                                                kind: "parameter",
                                                item: param,
                                            })
                                        }
                                    />
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Section>

            <Section
                title="Visualizations"
                count={visualizations.length}
                action={
                    <Button
                        variant="outline"
                        onClick={() => setVizFormOpen(true)}
                    >
                        <Plus aria-hidden /> Create visualization
                    </Button>
                }
            >
                {isLoadingVisualizations ? (
                    <LoadingSpinner message="Loading visualizations..." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Title</TableHead>
                                <ActionsHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visualizations.length === 0 ? (
                                <EmptyRow
                                    colSpan={4}
                                    text="No visualizations found."
                                />
                            ) : (
                                visualizations.map((viz) => (
                                    <TableRow key={viz.id}>
                                        <TableCell>{viz.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {viz.name}
                                        </TableCell>
                                        <TableCell>
                                            {viz.title || "—"}
                                        </TableCell>
                                        <RowActions
                                            label={viz.name}
                                            onDelete={() =>
                                                setDeleting({
                                                    kind: "visualization",
                                                    item: viz,
                                                })
                                            }
                                        />
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </Section>

            <Section
                title="Categories"
                count={categories.length}
                action={
                    <Button
                        variant="outline"
                        onClick={() => setCatFormOpen(true)}
                    >
                        <Plus aria-hidden /> Create category
                    </Button>
                }
            >
                {isLoadingCategories ? (
                    <LoadingSpinner message="Loading categories..." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <ActionsHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <EmptyRow
                                    colSpan={4}
                                    text="No categories found."
                                />
                            ) : (
                                categories.map((cat) => (
                                    <TableRow key={cat.id}>
                                        <TableCell>{cat.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {cat.name}
                                        </TableCell>
                                        <TableCell>
                                            {cat.description || "—"}
                                        </TableCell>
                                        <RowActions
                                            label={cat.name}
                                            onDelete={() =>
                                                setDeleting({
                                                    kind: "category",
                                                    item: cat,
                                                })
                                            }
                                        />
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </Section>

            <ParameterForm
                open={isParamFormOpen}
                onClose={closeParamForm}
                onSubmit={handleParamSubmit}
                visualizations={visualizations}
                categories={categories}
                editData={editParam}
            />

            <NamedItemDialog
                open={vizFormOpen}
                onClose={() => setVizFormOpen(false)}
                noun="visualization"
                secondField="title"
                onSubmit={async ({ name, second }) => {
                    await createVisualization({ name, title: second });
                    toast.success("Visualization created");
                }}
            />
            <NamedItemDialog
                open={catFormOpen}
                onClose={() => setCatFormOpen(false)}
                noun="category"
                secondField="description"
                onSubmit={async ({ name, second }) => {
                    await createCategory({ name, description: second });
                    toast.success("Category created");
                }}
            />

            <DeleteDialog
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                noun={
                    deleting?.kind === "parameter"
                        ? "data property"
                        : (deleting?.kind ?? "item")
                }
                name={deleting?.item.name}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default ParametersTab;
