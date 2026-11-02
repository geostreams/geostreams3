import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "../../api/apiClient";
import { useParamNames } from "../../contexts/ParametersContext";
import useSensors from "../../hooks/useSensors";
import type { Sensor, SensorInput } from "../../types/api";
import SensorRow from "./SensorRow";
import SensorForm from "../forms/SensorForm";
import LoadingSpinner from "../ui/LoadingSpinner";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const SensorsTab = () => {
    const paramNameMap = useParamNames();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [query, setQuery] = useState("");
    const {
        sensors,
        pagination,
        isLoading,
        error,
        createSensor,
        updateSensor,
        deleteSensor,
    } = useSensors(page, rowsPerPage);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Sensor | null>(null);
    const [deleting, setDeleting] = useState<Sensor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const totalCount = pagination?.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const firstRow = totalCount === 0 ? 0 : page * rowsPerPage + 1;
    const lastRow = page * rowsPerPage + sensors.length;

    // Deleting the last row of a later page leaves it empty: step back.
    useEffect(() => {
        if (!isLoading && sensors.length === 0 && totalCount > 0 && page > 0) {
            setPage(Math.min(page, pageCount) - 1);
        }
    }, [isLoading, sensors.length, totalCount, page, pageCount]);

    // The API only filters on exact names, so search narrows the loaded page.
    const visibleSensors = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return sensors;
        return sensors.filter((s) =>
            [String(s.id), s.name, s.source].some((field) =>
                field?.toLowerCase().includes(needle),
            ),
        );
    }, [sensors, query]);

    const openCreate = () => {
        setEditing(null);
        setIsFormOpen(true);
    };

    const openEdit = (sensor: Sensor) => {
        setEditing(sensor);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditing(null);
    };

    const handleSubmit = async (payload: SensorInput) => {
        if (editing) {
            await updateSensor(editing.id, payload);
            toast.success("Sensor updated");
        } else {
            await createSensor(payload);
            toast.success("Sensor created");
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setIsDeleting(true);
        try {
            await deleteSensor(deleting.id);
            toast.success("Sensor deleted");
            setDeleting(null);
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to delete sensor"));
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading && sensors.length === 0) {
        return <LoadingSpinner message="Loading sensors..." />;
    }

    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                    <Search
                        aria-hidden
                        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="search"
                        aria-label="Search sensors on this page"
                        placeholder="Search this page…"
                        className="pl-8"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button onClick={openCreate}>
                    <Plus aria-hidden /> Create sensor
                </Button>
            </div>

            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}

            <div className="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Parameters</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-24 text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleSensors.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    {query.trim()
                                        ? "No sensors on this page match your search."
                                        : totalCount === 0
                                          ? "No sensors found. Create your first sensor to get started."
                                          : "No sensors on this page."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleSensors.map((sensor) => (
                                <SensorRow
                                    key={sensor.id}
                                    sensor={sensor}
                                    paramNameMap={paramNameMap}
                                    onEdit={openEdit}
                                    onDelete={setDeleting}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
                {totalCount > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
                        <p aria-live="polite" className="text-muted-foreground">
                            {query.trim()
                                ? `${visibleSensors.length} of ${sensors.length} on this page match`
                                : `${firstRow}–${lastRow} of ${totalCount}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-muted-foreground">
                                Rows per page
                                <Select
                                    value={String(rowsPerPage)}
                                    onValueChange={(v) => {
                                        setRowsPerPage(Number(v));
                                        setPage(0);
                                    }}
                                >
                                    <SelectTrigger
                                        size="sm"
                                        aria-label="Rows per page"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROWS_PER_PAGE_OPTIONS.map((n) => (
                                            <SelectItem
                                                key={n}
                                                value={String(n)}
                                            >
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Previous page"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft aria-hidden />
                                </Button>
                                <span className="px-2 text-muted-foreground">
                                    Page {page + 1} of {pageCount}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Next page"
                                    disabled={page + 1 >= pageCount}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight aria-hidden />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <SensorForm
                open={isFormOpen}
                onClose={closeForm}
                onSubmit={handleSubmit}
                sensor={editing}
            />

            <Dialog
                open={deleting !== null}
                onOpenChange={(next) => !next && setDeleting(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete sensor</DialogTitle>
                        <DialogDescription>
                            Delete {deleting?.name ?? `sensor ${deleting?.id}`}?
                            Its streams and datapoints are removed too. This
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleting(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleDelete}
                        >
                            {isDeleting ? "Deleting…" : "Delete sensor"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SensorsTab;
