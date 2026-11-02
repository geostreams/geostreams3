import { ArrowLeft, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sensor } from "../../types/api";

interface SensorHeaderProps {
    sensor: Sensor;
    onBack: () => void;
    onDelete: () => void;
}

/** Point coordinates as "lat°N, lon°E", or null when the geometry is not a point. */
export const describePoint = (sensor: Sensor): string | null => {
    const coords = sensor.geometry?.coordinates;
    if (
        sensor.geometry?.type !== "Point" ||
        !Array.isArray(coords) ||
        typeof coords[0] !== "number" ||
        typeof coords[1] !== "number"
    ) {
        return null;
    }
    return `${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E`;
};

const SensorHeader = ({ sensor, onBack, onDelete }: SensorHeaderProps) => {
    const point = describePoint(sensor);
    const properties = Object.entries(sensor.properties ?? {});
    return (
        <header className="mb-6 border-b border-border pb-4 md:mb-8">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-3">
                <ArrowLeft aria-hidden />
                Back to Dashboard
            </Button>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
                    {sensor.name ?? `Sensor ${sensor.id}`}
                </h1>
                <Button variant="outline" size="sm" onClick={onDelete}>
                    <Trash2 aria-hidden />
                    Delete sensor
                </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {sensor.source && (
                    <Badge variant="secondary">Source: {sensor.source}</Badge>
                )}
                {point && <Badge variant="outline">Point: {point}</Badge>}
                {sensor.created && (
                    <Badge variant="outline">
                        Created: {new Date(sensor.created).toLocaleDateString()}
                    </Badge>
                )}
                {properties.map(([key, value]) => (
                    <Badge key={key} variant="outline">
                        {key}: {String(value)}
                    </Badge>
                ))}
            </div>
        </header>
    );
};

export default SensorHeader;
