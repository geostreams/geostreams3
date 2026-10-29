import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography, Chip } from "@mui/material";
import useSensors from "../../hooks/useSensors";
import LoadingSpinner from "../ui/LoadingSpinner";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/**
 * Leaflet map showing sensor locations as markers.
 * @param {{ onSensorSelect?: Function }} props
 */
const SensorMap = ({ onSensorSelect }) => {
    const { sensors, isLoading } = useSensors();

    // Compute map center from sensor locations
    const { center, zoom } = useMemo(() => {
        const validSensors = sensors.filter(
            (s) => s.geometry?.coordinates?.length >= 2,
        );
        if (validSensors.length === 0) {
            return { center: [40.0, -89.0], zoom: 4 }; // Default US center
        }

        const lats = validSensors.map((s) => s.geometry.coordinates[1]);
        const lngs = validSensors.map((s) => s.geometry.coordinates[0]);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        const latSpan = Math.max(...lats) - Math.min(...lats);
        const lngSpan = Math.max(...lngs) - Math.min(...lngs);
        const span = Math.max(latSpan, lngSpan);
        let zoomLevel = 4;
        if (span < 0.01) zoomLevel = 14;
        else if (span < 0.1) zoomLevel = 11;
        else if (span < 1) zoomLevel = 9;
        else if (span < 5) zoomLevel = 7;
        else if (span < 20) zoomLevel = 5;

        return { center: [centerLat, centerLng], zoom: zoomLevel };
    }, [sensors]);

    if (isLoading) return <LoadingSpinner message="Loading map data..." />;

    return (
        <Box
            sx={{
                height: 500,
                width: "100%",
                borderRadius: 2,
                overflow: "hidden",
                border: 1,
                borderColor: "divider",
            }}
        >
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {sensors
                    .filter((s) => s.geometry?.coordinates?.length >= 2)
                    .map((sensor) => (
                        <Marker
                            key={sensor.id}
                            position={[
                                sensor.geometry.coordinates[1],
                                sensor.geometry.coordinates[0],
                            ]}
                            eventHandlers={{
                                click: () => {
                                    if (onSensorSelect) onSensorSelect(sensor);
                                },
                            }}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 150 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {sensor.name}
                                    </Typography>
                                    {sensor.source && (
                                        <Chip
                                            label={sensor.source}
                                            size="small"
                                            sx={{ mt: 0.5, mb: 0.5 }}
                                        />
                                    )}
                                    <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                    >
                                        ID: {sensor.id}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                    >
                                        Type: {sensor.geoType}
                                    </Typography>
                                </Box>
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>
        </Box>
    );
};

export default SensorMap;
