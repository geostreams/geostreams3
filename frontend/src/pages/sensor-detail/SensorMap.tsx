import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { Sensor } from "../../types/api";
import { describePoint } from "./SensorHeader";

/** Leaflet map of a point sensor; renders nothing for other geometries. */
const SensorMap = ({ sensor }: { sensor: Sensor }) => {
    const coords = sensor.geometry?.coordinates;
    if (!describePoint(sensor) || !Array.isArray(coords)) return null;
    const position: [number, number] = [coords[1], coords[0]];

    return (
        <section
            aria-label="Sensor location"
            className="mb-6 overflow-hidden rounded-lg border border-border"
        >
            <MapContainer
                center={position}
                zoom={9}
                scrollWheelZoom={false}
                className="h-56 w-full bg-muted md:h-72"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CircleMarker
                    center={position}
                    radius={9}
                    pathOptions={{
                        color: "#14303a",
                        weight: 2,
                        fillColor: "#d9a21b",
                        fillOpacity: 1,
                    }}
                />
            </MapContainer>
        </section>
    );
};

export default SensorMap;
