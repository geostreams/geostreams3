import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Sensor } from "../../types/api";

const VISIBLE_PARAMETERS = 2;

interface SensorRowProps {
    sensor: Sensor;
    paramNameMap: Record<string, string>;
    onEdit: (sensor: Sensor) => void;
    onDelete: (sensor: Sensor) => void;
}

const SensorRow = ({
    sensor,
    paramNameMap,
    onEdit,
    onDelete,
}: SensorRowProps) => {
    const parameters = sensor.parameters ?? [];
    const label = sensor.name ?? `sensor ${sensor.id}`;
    return (
        <TableRow>
            <TableCell>{sensor.id}</TableCell>
            <TableCell>
                <Link
                    to={`/dashboard/sensors/${sensor.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    {sensor.name}
                </Link>
            </TableCell>
            <TableCell>
                <Badge variant="outline">{sensor.source || "N/A"}</Badge>
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {parameters.slice(0, VISIBLE_PARAMETERS).map((p) => (
                        <Badge key={p} variant="outline" title={p}>
                            {paramNameMap[p] || p}
                        </Badge>
                    ))}
                    {parameters.length > VISIBLE_PARAMETERS && (
                        <Badge variant="secondary">
                            +{parameters.length - VISIBLE_PARAMETERS}
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell>
                {sensor.created
                    ? new Date(sensor.created).toLocaleDateString()
                    : "N/A"}
            </TableCell>
            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${label}`}
                    onClick={() => onEdit(sensor)}
                >
                    <Pencil aria-hidden />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${label}`}
                    onClick={() => onDelete(sensor)}
                >
                    <Trash2 aria-hidden />
                </Button>
            </TableCell>
        </TableRow>
    );
};

export default SensorRow;
