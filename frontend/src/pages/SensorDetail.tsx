import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteDialog } from "../components/dashboard/ParameterDialogs";
import PageLayout from "../components/common/PageLayout";
import DatapointForm from "../components/forms/DatapointForm";
import StreamForm from "../components/forms/StreamForm";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatusMessage from "../components/ui/StatusMessage";
import {
    useParamNames,
    useParamUnits,
    useParametersList,
} from "../contexts/ParametersContext";
import useAggregates from "../hooks/useAggregates";
import useApiClient from "../hooks/useApiClient";
import useSensor from "../hooks/useSensor";
import useStreams from "../hooks/useStreams";
import type {
    DatapointInput,
    Stream,
    StreamInput,
    TimePeriod,
} from "../types/api";
import ChartSection from "./sensor-detail/ChartSection";
import SensorHeader from "./sensor-detail/SensorHeader";
import SensorMap from "./sensor-detail/SensorMap";
import StreamsSection from "./sensor-detail/StreamsSection";

dayjs.extend(utc);

interface Status {
    open: boolean;
    message: string;
    severity: "success" | "error";
}

const SensorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const authApi = useApiClient();

    const {
        sensor,
        isLoading: sensorLoading,
        error: sensorError,
    } = useSensor(id);
    const {
        streams,
        isLoading: streamsLoading,
        createStream,
        deleteStream,
    } = useStreams(id);
    const parameters = useParametersList();
    const paramNameMap = useParamNames();
    const paramUnitMap = useParamUnits();
    const {
        data: aggregateRows,
        isLoading: chartLoading,
        error: chartError,
        fetchAggregates,
    } = useAggregates();

    const [period, setPeriod] = useState<TimePeriod>("day");
    // The period of the last successful fetch, so chart labels only reformat
    // when new data loads, not when the dropdown changes.
    const [loadedPeriod, setLoadedPeriod] = useState<TimePeriod>("day");
    const [since, setSince] = useState<Dayjs | null>(null);
    const [until, setUntil] = useState<Dayjs | null>(null);
    const [rangeError, setRangeError] = useState<string | null>(null);

    const [isStreamFormOpen, setIsStreamFormOpen] = useState(false);
    const [streamDeleteTarget, setStreamDeleteTarget] = useState<Stream | null>(
        null,
    );
    const [isDatapointFormOpen, setIsDatapointFormOpen] = useState(false);
    const [isDeleteSensorOpen, setIsDeleteSensorOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [status, setStatus] = useState<Status>({
        open: false,
        message: "",
        severity: "success",
    });

    const notify = (message: string, severity: Status["severity"]) =>
        setStatus({ open: true, message, severity });

    // Once the sensor loads, seed since/until from its data range and auto-fetch.
    const autoLoadedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!sensor || autoLoadedRef.current === id) return;
        autoLoadedRef.current = id ?? null;

        const defaultSince = sensor.min_start_time
            ? dayjs.utc(sensor.min_start_time)
            : null;
        const defaultUntil = sensor.max_end_time
            ? dayjs.utc(sensor.max_end_time)
            : null;
        setSince(defaultSince);
        setUntil(defaultUntil);

        fetchAggregates({
            sensorId: id,
            timePeriod: period,
            since: defaultSince?.toISOString(),
            until: defaultUntil?.toISOString(),
        });
        setLoadedPeriod(period);
    }, [sensor]);

    const handleLoadChart = () => {
        if (!id) return;
        if (since && until && since.isAfter(until)) {
            setRangeError("Since must be before until.");
            return;
        }
        setRangeError(null);
        fetchAggregates({
            sensorId: id,
            timePeriod: period,
            since: since?.toISOString(),
            until: until?.toISOString(),
        });
        setLoadedPeriod(period);
    };

    const handleCreateStream = async (data: StreamInput) => {
        await createStream(data);
        notify("Stream created successfully", "success");
    };

    const handleDeleteStream = async () => {
        if (!streamDeleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteStream(streamDeleteTarget.id);
            notify("Stream deleted successfully", "success");
        } catch {
            notify("Failed to delete stream", "error");
        } finally {
            setIsDeleting(false);
            setStreamDeleteTarget(null);
        }
    };

    const handleCreateDatapoint = async (data: DatapointInput) => {
        await authApi.post("data/datapoints/", data);
        notify("Datapoint added successfully", "success");
    };

    const handleDeleteSensor = async () => {
        setIsDeleting(true);
        try {
            await authApi.delete(`data/sensors/${id}/`);
            setIsDeleteSensorOpen(false);
            navigate("/dashboard");
        } catch {
            notify("Failed to delete sensor", "error");
            setIsDeleteSensorOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    if (sensorLoading) return <LoadingSpinner message="Loading sensor..." />;

    if (sensorError || !sensor) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
                <p
                    role="alert"
                    className="text-lg font-medium text-destructive"
                >
                    {sensorError || "Sensor not found"}
                </p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft aria-hidden />
                    Back
                </Button>
            </div>
        );
    }

    return (
        <PageLayout maxWidth="xl">
            <SensorHeader
                sensor={sensor}
                onBack={() => navigate(-1)}
                onDelete={() => setIsDeleteSensorOpen(true)}
            />
            <SensorMap sensor={sensor} />
            <StreamsSection
                streams={streams}
                isLoading={streamsLoading}
                paramNameMap={paramNameMap}
                onAdd={() => setIsStreamFormOpen(true)}
                onDelete={setStreamDeleteTarget}
            />
            <ChartSection
                rows={aggregateRows}
                isLoading={chartLoading}
                error={rangeError ?? chartError}
                loadedPeriod={loadedPeriod}
                period={period}
                onPeriodChange={setPeriod}
                since={since}
                until={until}
                onSinceChange={setSince}
                onUntilChange={setUntil}
                onLoad={handleLoadChart}
                onAddDatapoint={() => setIsDatapointFormOpen(true)}
                paramNameMap={paramNameMap}
                paramUnitMap={paramUnitMap}
            />

            <StreamForm
                open={isStreamFormOpen}
                onClose={() => setIsStreamFormOpen(false)}
                onSubmit={handleCreateStream}
                lockedSensor={sensor}
                parameterOptions={parameters}
            />
            <DatapointForm
                open={isDatapointFormOpen}
                onClose={() => setIsDatapointFormOpen(false)}
                onSubmit={handleCreateDatapoint}
                lockedSensor={{ id: Number(id), name: sensor.name }}
                streams={streams}
                parameters={parameters}
            />
            <DeleteDialog
                open={Boolean(streamDeleteTarget)}
                onClose={() => setStreamDeleteTarget(null)}
                noun="stream"
                name={streamDeleteTarget?.name ?? undefined}
                isDeleting={isDeleting}
                onConfirm={handleDeleteStream}
            />
            <DeleteDialog
                open={isDeleteSensorOpen}
                onClose={() => setIsDeleteSensorOpen(false)}
                noun="sensor"
                name={sensor.name ?? undefined}
                isDeleting={isDeleting}
                onConfirm={handleDeleteSensor}
            />

            <StatusMessage
                open={status.open}
                message={status.message}
                severity={status.severity}
                onClose={() => setStatus((prev) => ({ ...prev, open: false }))}
            />
        </PageLayout>
    );
};

export default SensorDetail;
