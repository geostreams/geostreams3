import {
    useEffect,
    useId,
    useState,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import { X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "../../api/apiClient";
import type { Parameter, Sensor, StreamInput } from "../../types/api";

const GEO_TYPES = ["Point", "LineString", "Polygon", "MultiPoint"];

type SensorOption = Pick<Sensor, "id" | "name">;

interface StreamFormState {
    name: string;
    sensor: string | null;
    geoType: string;
    latitude: string;
    longitude: string;
    altitude: string;
    parameters: string[];
    properties: string;
}

const initialState = (sensor: SensorOption | null): StreamFormState => ({
    name: "",
    sensor: sensor ? String(sensor.id) : null,
    geoType: "Point",
    latitude: "",
    longitude: "",
    altitude: "0",
    parameters: [],
    properties: "{}",
});

interface StreamFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: StreamInput) => Promise<unknown>;
    sensors?: SensorOption[];
    parameterOptions?: Parameter[];
    lockedSensor?: SensorOption | null;
}

/**
 * Dialog form for creating a new stream.
 */
const StreamForm = ({
    open,
    onClose,
    onSubmit,
    sensors = [],
    parameterOptions = [],
    lockedSensor = null,
}: StreamFormProps) => {
    const [formData, setFormData] = useState(() => initialState(lockedSensor));
    const [paramText, setParamText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const listId = useId();

    useEffect(() => {
        if (open) {
            setFormData(initialState(lockedSensor));
            setParamText("");
            setError(null);
        }
    }, [open, lockedSensor]);

    const setField = <K extends keyof StreamFormState>(
        field: K,
        value: StreamFormState[K],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const addParameters = (text: string) => {
        const names = text
            .split(",")
            .map((n) => n.trim())
            .filter((n) => n && !formData.parameters.includes(n));
        if (names.length) {
            setField("parameters", [...formData.parameters, ...names]);
        }
        setParamText("");
    };

    const onParamKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            // Add the name without submitting the form.
            event.preventDefault();
            addParameters(paramText);
        } else if (
            event.key === "Backspace" &&
            paramText === "" &&
            formData.parameters.length
        ) {
            setField("parameters", formData.parameters.slice(0, -1));
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const sensorId = lockedSensor?.id ?? Number(formData.sensor);
        if (!formData.name.trim()) {
            setError("Name is required");
            return;
        }
        if (!sensorId) {
            setError("Sensor is required");
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

        // A parameter name typed but not yet confirmed still counts.
        const typed = paramText.trim();
        const parameters =
            typed && !formData.parameters.includes(typed)
                ? [...formData.parameters, typed]
                : formData.parameters;

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: formData.name.trim(),
                sensor: sensorId,
                geoType: formData.geoType,
                geometry: {
                    type: formData.geoType,
                    coordinates: [
                        parseFloat(formData.longitude || "0"),
                        parseFloat(formData.latitude || "0"),
                        parseFloat(formData.altitude || "0"),
                    ],
                },
                parameters,
                properties,
            });
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to create stream"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create stream</DialogTitle>
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
                        <Label htmlFor="stream-name">Name *</Label>
                        <Input
                            id="stream-name"
                            value={formData.name}
                            onChange={(e) => setField("name", e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stream-sensor">Sensor *</Label>
                        {lockedSensor ? (
                            <Input
                                id="stream-sensor"
                                value={lockedSensor.name ?? ""}
                                disabled
                            />
                        ) : (
                            <Combobox
                                id="stream-sensor"
                                required
                                options={sensors.map((s) => ({
                                    value: String(s.id),
                                    label: s.name || `Sensor ${s.id}`,
                                }))}
                                value={formData.sensor}
                                onChange={(next) => setField("sensor", next)}
                                placeholder="Select a sensor"
                            />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stream-geotype">Geometry type</Label>
                        <Select
                            value={formData.geoType}
                            onValueChange={(v) => setField("geoType", v)}
                        >
                            <SelectTrigger
                                id="stream-geotype"
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
                        {(
                            [
                                ["latitude", "Latitude"],
                                ["longitude", "Longitude"],
                                ["altitude", "Altitude"],
                            ] as const
                        ).map(([field, label]) => (
                            <div key={field} className="grid gap-2">
                                <Label htmlFor={`stream-${field}`}>
                                    {label}
                                </Label>
                                <Input
                                    id={`stream-${field}`}
                                    type="number"
                                    step="any"
                                    value={formData[field]}
                                    onChange={(e) =>
                                        setField(field, e.target.value)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stream-parameters">Parameters</Label>
                        {formData.parameters.length > 0 && (
                            <ul className="flex flex-wrap gap-1.5">
                                {formData.parameters.map((name) => (
                                    <li key={name}>
                                        <Badge
                                            variant="outline"
                                            className="gap-1"
                                        >
                                            {name}
                                            <button
                                                type="button"
                                                aria-label={`Remove ${name}`}
                                                className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                onClick={() =>
                                                    setField(
                                                        "parameters",
                                                        formData.parameters.filter(
                                                            (p) => p !== name,
                                                        ),
                                                    )
                                                }
                                            >
                                                <X
                                                    aria-hidden
                                                    className="size-3"
                                                />
                                            </button>
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Input
                            id="stream-parameters"
                            list={listId}
                            value={paramText}
                            placeholder="Select or type parameter names"
                            onChange={(e) => setParamText(e.target.value)}
                            onKeyDown={onParamKeyDown}
                            onBlur={() => addParameters(paramText)}
                        />
                        <datalist id={listId}>
                            {parameterOptions.map((p) => (
                                <option key={p.id} value={p.name} />
                            ))}
                        </datalist>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stream-props">Properties (JSON)</Label>
                        <Textarea
                            id="stream-props"
                            rows={3}
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
                            {isSubmitting ? "Creating…" : "Create stream"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default StreamForm;
