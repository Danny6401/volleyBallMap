import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import {
  AdvancedMarker,
  InfoWindow,
  Map,
  type MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { useCallback, useMemo } from "react";
import type { Court, LatLng, MapBounds } from "../types";
import volleyballImg from "../assets/volleyball.png";

type MapCanvasProps = {
  courts: Court[];
  selectedCourtId: string;
  selectedCourt: Court | null;
  mapCenter: LatLng;
  onSelectCourt: (courtId: string) => void;
  onCameraChange: (center: LatLng, bounds: MapBounds | null) => void;
  showInfo: boolean;
  onCloseInfo: () => void;
  selectedTimeSlotId: string;
  onSelectTimeSlot: (id: string) => void;
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: "greedy",
  clickableIcons: false,
};

const MapCanvas = ({
  courts,
  selectedCourtId,
  selectedCourt,
  mapCenter,
  onSelectCourt,
  onCameraChange,
  showInfo,
  onCloseInfo,
  selectedTimeSlotId,
  onSelectTimeSlot,
}: MapCanvasProps) => {
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

  const handleCameraChanged = useCallback(
    (ev: MapCameraChangedEvent) => {
      const { center, bounds } = ev.detail;
      if (center) {
        const nextCenter = { lat: center.lat, lng: center.lng };
        const nextBounds = bounds
          ? {
              north: bounds.north,
              south: bounds.south,
              east: bounds.east,
              west: bounds.west,
            }
          : null;
        onCameraChange(nextCenter, nextBounds);
      }
    },
    [onCameraChange]
  );

  const markers = useMemo(
    () =>
      courts.map((court) => {
        const active = court.id === selectedCourtId;
        return (
          <AdvancedMarker
            key={court.id}
            position={{ lat: court.lat, lng: court.lng }}
            onClick={() => onSelectCourt(court.id)}
            zIndex={active ? 1000 : 1}
          >
            <Pin active={active} />
          </AdvancedMarker>
        );
      }),
    [courts, onSelectCourt, selectedCourtId]
  );

  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={mapCenter}
        center={mapCenter}
        defaultZoom={13}
        mapId={mapId}
        options={mapOptions}
        onCameraChanged={handleCameraChanged}
      >
        {markers}

        {selectedCourt && showInfo ? (
          <InfoWindow
            position={{ lat: selectedCourt.lat, lng: selectedCourt.lng }}
            onCloseClick={onCloseInfo}
          >
            <Stack spacing={1.25} sx={{ width: 280 }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={800}>
                  {selectedCourt.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCourt.address}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {selectedCourt.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Stack>
              <Box
                sx={{
                  borderRadius: 1.5,
                  overflow: "hidden",
                  bgcolor: "#e9edf5",
                  height: 140,
                  position: "relative",
                }}
              >
                {selectedCourt.images[0] ? (
                  <Box
                    component="img"
                    src={selectedCourt.images[0]}
                    alt={selectedCourt.name}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Stack
                    sx={{
                      position: "absolute",
                      inset: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                      fontSize: 12,
                    }}
                  >
                    暫無照片
                  </Stack>
                )}
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  時段
                </Typography>
                <Stack spacing={0.5}>
                  {selectedCourt.timeSlots.map((slot) => {
                    const active = slot.id === selectedTimeSlotId;
                    return (
                      <Button
                        key={slot.id}
                        variant={active ? "contained" : "outlined"}
                        size="small"
                        onClick={() => onSelectTimeSlot(slot.id)}
                        sx={{ justifyContent: "space-between" }}
                      >
                        <span>{slot.label}</span>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.8, ml: 1 }}
                        >
                          {slot.level}
                        </Typography>
                      </Button>
                    );
                  })}
                </Stack>
              </Stack>
              <Button
                variant="text"
                size="small"
                color="primary"
                href={`https://www.google.com/maps/search/?api=1&query=${selectedCourt.lat},${selectedCourt.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                在 Google Maps 開啟
              </Button>
            </Stack>
          </InfoWindow>
        ) : null}
      </Map>
    </Box>
  );
};

const Pin = ({ active }: { active: boolean }) => {
  const border = active ? "#f97316" : "#1d4ed8";
  return (
    <Box
      sx={{
        width: 56,
        height: 72,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        // transform: "translate(-50%, -100%)",
        pointerEvents: "auto",
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "white",
          boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
        }}
      >
        <Box
          component="img"
          src={volleyballImg}
          alt="volleyball marker"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "contain",
            border: `3px solid ${border}`,
            transform: active ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.2s ease, border-color 0.2s ease",
          }}
        />
      </Box>
      <Box
        sx={{
          width: 0,
          height: 0,
          borderLeft: "11px solid transparent",
          borderRight: "11px solid transparent",
          borderTop: `14px solid ${border}`,
          mt: "-4px",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
        }}
      />
    </Box>
  );
};

export default MapCanvas;
