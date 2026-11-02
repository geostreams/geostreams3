import { useEffect, useState, type FormEvent } from "react";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import DateTimePicker from "@/components/ui/date-time-picker";
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
import type { DatapointInput, Parameter, Stream } from "../../types/api";

dayjs.extend(utc);

interface DatapointFormState {
    stream: string | null;
    parameter: string | null;
    time: Dayjs | null;
    value: string;
}

const initialState = (): DatapointFormState => ({
    stream: null,
    parameter: null,
    time: dayjs.utc().second(0).millisecond(0),
    value: "",
});

const parameterLabel = (p: Parameter) =>
    p.title && p.name ? `${p.title} (${p.name})` : p.title || p.name;

interface DatapointFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: DatapointInput) => Promise<unknown>;
    streams?: Stream[];
    parameters?: Parameter[];
    lockedSensor: { id: number; name: string | null };
}

/**
 * Dialog form for creating a new datapoint.
 */
const DatapointForm = ({
    open,
    onClose,
    onSubmit,
    streams = [],
    parameters = [],
    lockedSensor,
}: DatapointFormProps) => {
    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // A fresh form, with the time reset to now, each time the dialog opens.
    useEffect(() => {
        if (open) {
            setFormData(initialState());
            setError(null);
        }
    }, [open]);

    const setField = <K extends keyof DatapointFormState>(
        field: K,
        value: DatapointFormState[K],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const stream = streams.find((s) => String(s.id) === formData.stream);
        const parameter = parameters.find(
            (p) => String(p.id) === formData.parameter,
        );
        if (!stream) {
            setError("Stream is required");
            return;
        }
        if (!parameter) {
            setError("Parameter is required");
            return;
        }
        if (formData.value === "") {
            setError("Value is required");
            return;
        }
        const value = parseFloat(formData.value);
        if (Number.isNaN(value)) {
            setError("Value must be a number");
            return;
        }
        if (!formData.time) {
            setError(
                "Time must be a valid date and time, e.g. 2026-01-31 14:30",
            );
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                stream: stream.id,
                data: { [parameter.name]: value },
                time: formData.time.toISOString(),
            });
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to create datapoint"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add datapoint to sensor</DialogTitle>
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
                    <p className="text-sm text-muted-foreground">
                        Sensor:{" "}
                        <span className="font-semibold text-foreground">
                            {lockedSensor.name || "Name not available"}
                        </span>
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor="datapoint-stream">Stream *</Label>
                        <Combobox
                            id="datapoint-stream"
                            required
                            options={streams.map((s) => ({
                                value: String(s.id),
                                label: s.name || `Stream ${s.id}`,
                            }))}
                            value={formData.stream}
                            onChange={(next) => setField("stream", next)}
                            placeholder="Select a stream"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="datapoint-parameter">Parameter *</Label>
                        <Combobox
                            id="datapoint-parameter"
                            required
                            options={parameters.map((p) => ({
                                value: String(p.id),
                                label: parameterLabel(p),
                            }))}
                            value={formData.parameter}
                            onChange={(next) => setField("parameter", next)}
                            placeholder="Select a parameter"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="datapoint-time">Time (UTC) *</Label>
                            <DateTimePicker
                                id="datapoint-time"
                                value={formData.time}
                                onChange={(next) => setField("time", next)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="datapoint-value">Value *</Label>
                            <Input
                                id="datapoint-value"
                                type="number"
                                step="any"
                                value={formData.value}
                                onChange={(e) =>
                                    setField("value", e.target.value)
                                }
                                required
                            />
                        </div>
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
                            {isSubmitting ? "Adding…" : "Add datapoint"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DatapointForm;
