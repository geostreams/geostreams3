import { useEffect, useState, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { getErrorMessage } from "../../api/apiClient";

interface NamedItemDialogProps {
    open: boolean;
    onClose: () => void;
    /** Singular noun for the item: "visualization" or "category". */
    noun: string;
    /** Label and field key of the second input. */
    secondField: "title" | "description";
    onSubmit: (values: { name: string; second: string }) => Promise<unknown>;
}

/** Create dialog shared by visualizations and categories: a name plus one text field. */
export const NamedItemDialog = ({
    open,
    onClose,
    noun,
    secondField,
    onSubmit,
}: NamedItemDialogProps) => {
    const [name, setName] = useState("");
    const [second, setSecond] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setName("");
            setSecond("");
            setError(null);
        }
    }, [open]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({ name: name.trim(), second: second.trim() });
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, `Failed to create ${noun}`));
        } finally {
            setIsSubmitting(false);
        }
    };

    const secondLabel = secondField === "title" ? "Title" : "Description";

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create {noun}</DialogTitle>
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
                    <div className="grid gap-2">
                        <Label htmlFor={`${noun}-name`}>Name *</Label>
                        <Input
                            id={`${noun}-name`}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError(null);
                            }}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${noun}-${secondField}`}>
                            {secondLabel}
                        </Label>
                        <Input
                            id={`${noun}-${secondField}`}
                            value={second}
                            onChange={(e) => setSecond(e.target.value)}
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
                            {isSubmitting ? "Creating…" : `Create ${noun}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    noun: string;
    /** Name of the item to delete, shown in the question. */
    name: string | undefined;
    /** Extra consequence shown after the question. */
    note?: string;
    isDeleting: boolean;
    onConfirm: () => void;
}

/** Confirmation dialog for deleting a parameter, visualization or category. */
export const DeleteDialog = ({
    open,
    onClose,
    noun,
    name,
    note,
    isDeleting,
    onConfirm,
}: DeleteDialogProps) => (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete {noun}</DialogTitle>
                <DialogDescription>
                    Delete {name ?? noun}? {note ?? "This cannot be undone."}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={onConfirm}
                >
                    {isDeleting ? "Deleting…" : `Delete ${noun}`}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
