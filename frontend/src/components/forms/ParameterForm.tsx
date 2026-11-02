import { useEffect, useState, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "../../api/apiClient";
import type {
    Category,
    JsonObject,
    Parameter,
    ParameterInput,
    Visualization,
} from "../../types/api";

interface ParameterFormState {
    name: string;
    title: string;
    unit: string;
    /** Visualization name; the combobox value. */
    visualization: string | null;
    /** Category name; the combobox value. */
    category: string | null;
    properties: string;
}

const INITIAL_STATE: ParameterFormState = {
    name: "",
    title: "",
    unit: "",
    visualization: null,
    category: null,
    properties: "{}",
};

/** Form state for an existing parameter; names no longer in the lists are dropped. */
const stateFromParameter = (
    parameter: Parameter,
    visualizations: Visualization[],
    categories: Category[],
): ParameterFormState => {
    const visualization = visualizations.find(
        (v) => v.name === parameter.visualization,
    );
    const category = categories.find(
        (c) => c.name === parameter.categories[0]?.name,
    );
    return {
        name: parameter.name ?? "",
        title: parameter.title ?? "",
        unit: parameter.unit ?? "",
        visualization: visualization?.name ?? null,
        category: category?.name ?? null,
        properties: parameter.properties
            ? JSON.stringify(parameter.properties, null, 2)
            : "{}",
    };
};

interface ParameterFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: ParameterInput, id?: number) => Promise<unknown>;
    visualizations?: Visualization[];
    categories?: Category[];
    /** When set, the dialog edits this parameter instead of creating one. */
    editData?: Parameter | null;
}

/**
 * Dialog form for creating or editing a parameter.
 */
const ParameterForm = ({
    open,
    onClose,
    onSubmit,
    visualizations = [],
    categories = [],
    editData = null,
}: ParameterFormProps) => {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEdit = Boolean(editData);

    useEffect(() => {
        if (open) {
            setFormData(
                editData
                    ? stateFromParameter(editData, visualizations, categories)
                    : INITIAL_STATE,
            );
            setError(null);
        }
        // The lists reload after every save; only reset when the dialog opens
        // or a different parameter is picked, so a refetch can't wipe typing.
    }, [open, editData]);

    const setField = <K extends keyof ParameterFormState>(
        field: K,
        value: ParameterFormState[K],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
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

        let properties: JsonObject;
        try {
            properties = JSON.parse(formData.properties || "{}") as JsonObject;
        } catch {
            setError("Properties must be valid JSON");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(
                {
                    name: formData.name.trim(),
                    title: formData.title.trim(),
                    unit: formData.unit.trim(),
                    visualization: formData.visualization,
                    category: formData.category,
                    properties,
                },
                editData?.id,
            );
            onClose();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    isEdit
                        ? "Failed to update parameter"
                        : "Failed to create parameter",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const verb = isEdit ? "Save" : "Create";

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit data property" : "Create data property"}
                    </DialogTitle>
                    <DialogDescription>
                        Fields marked * are required.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate className="grid gap-4">
                    {error && (
                        <Alert variant="destructive" role="alert">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="parameter-name">Name *</Label>
                            <Input
                                id="parameter-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setField("name", e.target.value)
                                }
                                placeholder="e.g. dissolved_oxygen"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="parameter-title">Title *</Label>
                            <Input
                                id="parameter-title"
                                value={formData.title}
                                onChange={(e) =>
                                    setField("title", e.target.value)
                                }
                                placeholder="e.g. Dissolved oxygen"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="parameter-unit">Unit</Label>
                            <Input
                                id="parameter-unit"
                                value={formData.unit}
                                onChange={(e) =>
                                    setField("unit", e.target.value)
                                }
                                placeholder="e.g. mg/L, °C"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="parameter-visualization">
                                Visualization *
                            </Label>
                            <Combobox
                                id="parameter-visualization"
                                required
                                options={visualizations.map((v) => ({
                                    value: v.name,
                                    label: v.name,
                                }))}
                                value={formData.visualization}
                                onChange={(v) => setField("visualization", v)}
                                placeholder="Select visualization"
                                searchPlaceholder="Search visualizations…"
                                emptyMessage="No visualizations found."
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="parameter-category">Category *</Label>
                        <Combobox
                            id="parameter-category"
                            required
                            options={categories.map((c) => ({
                                value: c.name,
                                label: c.name,
                            }))}
                            value={formData.category}
                            onChange={(v) => setField("category", v)}
                            placeholder="Select category"
                            searchPlaceholder="Search categories…"
                            emptyMessage="No categories found."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="parameter-props">
                            Properties (JSON)
                        </Label>
                        <Textarea
                            id="parameter-props"
                            rows={4}
                            className="font-mono text-sm"
                            value={formData.properties}
                            onChange={(e) =>
                                setField("properties", e.target.value)
                            }
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? `${verb}…`
                                : `${verb} data property`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ParameterForm;
