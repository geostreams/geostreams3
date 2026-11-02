import { Plus, Trash2 } from "lucide-react";

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
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatUtcDay } from "./chartUtils";
import type { Stream } from "../../types/api";

const VISIBLE_PARAMETERS = 3;

interface StreamsSectionProps {
    streams: Stream[];
    isLoading: boolean;
    paramNameMap: Record<string, string>;
    onAdd: () => void;
    onDelete: (stream: Stream) => void;
}

const StreamsSection = ({
    streams,
    isLoading,
    paramNameMap,
    onAdd,
    onDelete,
}: StreamsSectionProps) => (
    <section
        aria-labelledby="streams-heading"
        className="mb-6 rounded-lg border border-border bg-card p-4 text-card-foreground md:p-6"
    >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2
                id="streams-heading"
                className="font-heading text-xl font-semibold"
            >
                Streams ({streams.length})
            </h2>
            <Button size="sm" onClick={onAdd}>
                <Plus aria-hidden />
                Add stream
            </Button>
        </div>
        {isLoading ? (
            <LoadingSpinner message="Loading streams..." />
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Parameters</TableHead>
                        <TableHead>Time range (UTC)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {streams.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="py-6 text-center text-muted-foreground"
                            >
                                No streams yet. Add a stream to start collecting
                                data.
                            </TableCell>
                        </TableRow>
                    ) : (
                        streams.map((stream) => {
                            const parameters = stream.parameters ?? [];
                            const label = stream.name ?? `stream ${stream.id}`;
                            return (
                                <TableRow key={stream.id}>
                                    <TableCell className="tabular-nums">
                                        {stream.id}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {stream.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {parameters
                                                .slice(0, VISIBLE_PARAMETERS)
                                                .map((p) => (
                                                    <Badge
                                                        key={p}
                                                        variant="outline"
                                                        title={p}
                                                    >
                                                        {paramNameMap[p] || p}
                                                    </Badge>
                                                ))}
                                            {parameters.length >
                                                VISIBLE_PARAMETERS && (
                                                <Badge variant="secondary">
                                                    +
                                                    {parameters.length -
                                                        VISIBLE_PARAMETERS}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                                        {formatUtcDay(stream.start_time)}{" "}
                                        &mdash; {formatUtcDay(stream.end_time)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${label}`}
                                            onClick={() => onDelete(stream)}
                                        >
                                            <Trash2 aria-hidden />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        )}
    </section>
);

export default StreamsSection;
