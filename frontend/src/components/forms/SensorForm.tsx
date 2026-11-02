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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "../../api/apiClient";
import type { Sensor, SensorInput } from "../../types/api";

const GEO_TYPES = ["Point", "LineString", "Polygon", "MultiPoint"];

interface SensorFormState {
    name: string;
    source: string;
    geoType: string;
    latitude: string;
    longitude: string;
    altitude: string;
    properties: string;
}

const INITIAL_STATE: SensorFormState = {
    name: "",
    source: "",
    geoType: "Point",
    latitude: "",
    longitude: "",
    altitude: "0",
    properties: "{}",
};

/** Form state for an existing sensor; the geometry is read as [lon, lat, alt]. */
const stateFromSensor = (sensor: Sensor): SensorFormState => {
    const coords = Array.isArray(sensor.geometry?.coordinates)
        ? (sensor.geometry.coordinates as unknown[])
        : [];
    const text = (value: unknown, fallback = "") =>
        typeof value === "number" ? String(value) : fallback;
    return {
        name: sensor.name ?? "",
        source: sensor.source ?? "",
        geoType: sensor.geoType ?? sensor.geometry?.type ?? "Point",
        longitude: text(coords[0]),
        latitude: text(coords[1]),
        altitude: text(coords[2], "0"),
        properties: JSON.stringify(sensor.properties ?? {}, null, 2),
    };
};

interface SensorFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: SensorInput) => Promise<unknown>;
    /** When set, the dialog edits this sensor instead of creating one. */
    sensor?: Sensor | null;
}

/**
 * Dialog form for creating or editing a sensor.
 */
const SensorForm = ({ open, onClose, onSubmit, sensor }: SensorFormProps) => {
    const isEdit = Boolean(sensor);
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setFormData(sensor ? stateFromSensor(sensor) : INITIAL_STATE);
            setError(null);
        }
    }, [open, sensor]);

    const setField = (field: keyof SensorFormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!formData.name.trim()) {
            setError("Name is required");
            return;
        }
        if (!formData.latitude || !formData.longitude) {
            setError("Latitude and longitude are required");
            return;
        }

        let properties: Record<string, unknown>;
        try {
            const parsed: unknown = JSON.parse(formData.properties || "{}");
            if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                throw new Error("not an object");
            }
            properties = parsed as Record<string, unknown>;
        } catch {
            setError("Properties must be a valid JSON object");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: formData.name.trim(),
                source: formData.source.trim(),
                geoType: formData.geoType,
                geometry: {
                    type: formData.geoType,
                    coordinates: [
                        parseFloat(formData.longitude),
                        parseFloat(formData.latitude),
                        parseFloat(formData.altitude || "0"),
                    ],
                },
                properties,
            });
            onClose();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    isEdit
                        ? "Failed to update sensor"
                        : "Failed to create sensor",
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
                        {isEdit ? "Edit sensor" : "Create sensor"}
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
                    <div className="grid gap-2">
                        <Label htmlFor="sensor-name">Name *</Label>
                        <Input
                            id="sensor-name"
                            value={formData.name}
                            onChange={(e) => setField("name", e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sensor-source">Source</Label>
                        <Input
                            id="sensor-source"
                            value={formData.source}
                            onChange={(e) => setField("source", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sensor-geotype">Geometry type</Label>
                        <Select
                            value={formData.geoType}
                            onValueChange={(v) => setField("geoType", v)}
                        >
                            <SelectTrigger
                                id="sensor-geotype"
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {GEO_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="sensor-lat">Latitude *</Label>
                            <Input
                                id="sensor-lat"
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) =>
                                    setField("latitude", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sensor-lon">Longitude *</Label>
                            <Input
                                id="sensor-lon"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) =>
                                    setField("longitude", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sensor-alt">Altitude</Label>
                            <Input
                                id="sensor-alt"
                                type="number"
                                step="any"
                                value={formData.altitude}
                                onChange={(e) =>
                                    setField("altitude", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sensor-props">Properties (JSON)</Label>
                        <Textarea
                            id="sensor-props"
                            rows={4}
                            className="font-mono text-sm"
                            value={formData.properties}
                            onChange={(e) =>
                                setField("properties", e.target.value)
                            }
                            placeholder='{"key": "value"}'
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
                            {isSubmitting ? `${verb}…` : `${verb} sensor`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SensorForm;
