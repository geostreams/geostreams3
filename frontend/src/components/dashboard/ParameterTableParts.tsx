/* eslint-disable react/no-multi-comp -- small table helpers that only make sense together */
import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";

interface SectionProps {
    title: string;
    count: number;
    action: ReactNode;
    children: ReactNode;
}

export const Section = ({ title, count, action, children }: SectionProps) => (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
                {title}{" "}
                <span className="font-normal text-muted-foreground">
                    ({count})
                </span>
            </h2>
            {action}
        </div>
        <div className="rounded-lg border border-border bg-card">
            {children}
        </div>
    </section>
);

export const EmptyRow = ({
    colSpan,
    text,
}: {
    colSpan: number;
    text: string;
}) => (
    <TableRow>
        <TableCell
            colSpan={colSpan}
            className="py-8 text-center text-muted-foreground"
        >
            {text}
        </TableCell>
    </TableRow>
);

interface RowActionsProps {
    label: string;
    onEdit?: () => void;
    onDelete: () => void;
}

export const RowActions = ({ label, onEdit, onDelete }: RowActionsProps) => (
    <TableCell className="text-right">
        {onEdit && (
            <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${label}`}
                onClick={onEdit}
            >
                <Pencil aria-hidden />
            </Button>
        )}
        <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${label}`}
            onClick={onDelete}
        >
            <Trash2 aria-hidden />
        </Button>
    </TableCell>
);

export const ActionsHead = () => (
    <TableHead className="w-24 text-right">
        <span className="sr-only">Actions</span>
    </TableHead>
);
