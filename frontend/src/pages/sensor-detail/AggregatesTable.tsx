import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatValue } from "./chartUtils";

export interface AggregateTableRow {
    key: string;
    parameter: string;
    date: string;
    average: number | null | undefined;
}

const PAGE_SIZE = 25;

interface AggregatesTableProps {
    rows: AggregateTableRow[];
    /** Parameter the table is filtered to, shown in the caption. */
    selectedTitle: string | null;
}

/** The aggregated values behind the charts, newest first, shown a page at a time. */
const AggregatesTable = ({ rows, selectedTitle }: AggregatesTableProps) => {
    const [visible, setVisible] = useState(PAGE_SIZE);

    // Start from the first page again when the rows change.
    useEffect(() => setVisible(PAGE_SIZE), [rows]);

    return (
        <div className="mt-8">
            <h3 className="mb-2 font-heading text-lg font-semibold">
                Datapoints
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {selectedTitle ? `${selectedTitle} only` : "all parameters"}
                    , {rows.length} aggregated values
                </span>
            </h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date (UTC)</TableHead>
                        <TableHead>Parameter</TableHead>
                        <TableHead className="text-right">Average</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.slice(0, visible).map((row) => (
                        <TableRow key={row.key}>
                            <TableCell className="tabular-nums">
                                {row.date}
                            </TableCell>
                            <TableCell>{row.parameter}</TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatValue(row.average)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {visible < rows.length && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setVisible((n) => n + PAGE_SIZE)}
                >
                    Show more ({rows.length - visible} left)
                </Button>
            )}
        </div>
    );
};

export default AggregatesTable;
