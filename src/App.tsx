// README: 建立 .env.local 並設定 Google Maps API Key
// VITE_GOOGLE_MAPS_API_KEY=你的金鑰
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CssBaseline,
  Snackbar,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { APIProvider } from "@vis.gl/react-google-maps";
import MapCanvas from "./components/MapCanvas";
import NearbyCourtsPanel, {
  type NearbyCourt,
} from "./components/panels/NearbyCourtsPanel";
import RegistrationPanel from "./components/panels/RegistrationPanel";
import { courts } from "./data/courts";
import type { LatLng, MapBounds, SkillLevel } from "./types";
import { haversineKm, inBounds } from "./utils/geo";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#0c111a",
      paper: "#f5f7fb",
    },
  },
  shape: { borderRadius: 14 },
});

const DEFAULT_HEADCOUNT = 4;

const App = () => {
  const initialCourt = courts[0];
  const [selectedCourtId, setSelectedCourtId] = useState(initialCourt.id);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(
    initialCourt.timeSlots[0]?.id ?? ""
  );
  const [headcount, setHeadcount] = useState(DEFAULT_HEADCOUNT);
  const [nicknames, setNicknames] = useState<string[]>(
    Array.from({ length: DEFAULT_HEADCOUNT }, () => "")
  );
  const [mapCenter, setMapCenter] = useState<LatLng>({
    lat: initialCourt.lat,
    lng: initialCourt.lng,
  });
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [onlyVisible, setOnlyVisible] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);

  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === selectedCourtId) ?? initialCourt,
    [selectedCourtId]
  );

  const selectedTimeSlot = useMemo(
    () =>
      selectedCourt.timeSlots.find((t) => t.id === selectedTimeSlotId) ??
      selectedCourt.timeSlots[0] ??
      null,
    [selectedCourt, selectedTimeSlotId]
  );

  useEffect(() => {
    if (!selectedCourt.timeSlots.length) return;
    const hasSlot = selectedCourt.timeSlots.some(
      (slot) => slot.id === selectedTimeSlotId
    );
    if (!hasSlot) {
      setSelectedTimeSlotId(selectedCourt.timeSlots[0].id);
    }
  }, [selectedCourt, selectedTimeSlotId]);

  useEffect(() => {
    setNicknames((prev) => adjustNicknames(prev, headcount));
  }, [headcount, selectedCourtId]);

  const filteredCourts = useMemo(() => {
    if (onlyVisible && mapBounds) {
      return courts.filter((court) =>
        inBounds({ lat: court.lat, lng: court.lng }, mapBounds)
      );
    }
    return courts;
  }, [onlyVisible, mapBounds]);

  const nearbyCourts: NearbyCourt[] = useMemo(
    () =>
      filteredCourts
        .map((court) => ({
          court,
          distanceKm: haversineKm(mapCenter, {
            lat: court.lat,
            lng: court.lng,
          }),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [filteredCourts, mapCenter]
  );

  const topNearbyCourts = useMemo(
    () => nearbyCourts.slice(0, 12),
    [nearbyCourts]
  );

  const handleSelectCourt = useCallback((courtId: string) => {
    const next = courts.find((c) => c.id === courtId);
    if (!next) return;
    setSelectedCourtId(courtId);
    setMapCenter({ lat: next.lat, lng: next.lng });
    setInfoOpen(true);
  }, []);

  const handleSubmit = () => {
    if (!selectedCourt || !selectedTimeSlot) return;
    const payload = {
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      date: selectedDate,
      timeSlotId: selectedTimeSlot.id,
      level: selectedTimeSlot.level,
      headcount,
      nicknames,
    };
    // eslint-disable-next-line no-console
    console.log("Registration payload", payload);
    setSnackbarOpen(true);
  };

  const overlayGrid = {
    position: "absolute" as const,
    inset: 0,
    display: "grid",
    gridTemplateColumns: "360px 360px",
    justifyContent: "space-between",
    gap: 2,
    p: 2,
    pointerEvents: "none" as const,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}>
        <Box
          sx={{ position: "relative", minHeight: "100vh", bgcolor: "#0c111a" }}
        >
          <MapCanvas
            courts={courts}
            selectedCourtId={selectedCourtId}
            selectedCourt={selectedCourt}
            mapCenter={mapCenter}
            onSelectCourt={handleSelectCourt}
            onCameraChange={(center, bounds) => {
              setMapCenter(center);
              setMapBounds(bounds);
            }}
            showInfo={infoOpen}
            onCloseInfo={() => setInfoOpen(false)}
            selectedTimeSlotId={selectedTimeSlot?.id ?? ""}
            onSelectTimeSlot={setSelectedTimeSlotId}
          />

          <Box sx={overlayGrid}>
            <Box
              sx={{
                pointerEvents: "auto",
                maxHeight: "50vh",
                overflow: "hidden",
              }}
            >
              <RegistrationPanel
                court={selectedCourt}
                selectedDate={selectedDate}
                selectedTimeSlotId={selectedTimeSlot?.id ?? ""}
                selectedLevel={
                  (selectedTimeSlot?.level ?? "mixed") as SkillLevel
                }
                headcount={headcount}
                nicknames={nicknames}
                onDateChange={setSelectedDate}
                onTimeSlotChange={setSelectedTimeSlotId}
                onHeadcountChange={setHeadcount}
                onNicknamesChange={setNicknames}
                onSubmit={handleSubmit}
              />
            </Box>

            <Box
              sx={{
                pointerEvents: "auto",
                maxHeight: "100vh",
                overflow: "hidden",
              }}
            >
              <NearbyCourtsPanel
                items={topNearbyCourts}
                selectedCourtId={selectedCourtId}
                onlyVisible={onlyVisible}
                totalCount={courts.length}
                visibleCount={filteredCourts.length}
                onToggleVisible={setOnlyVisible}
                onSelectCourt={handleSelectCourt}
              />
            </Box>
          </Box>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              severity="success"
              onClose={() => setSnackbarOpen(false)}
              // sx={{ width: "100%" }}
            >
              報名已送出
            </Alert>
          </Snackbar>
        </Box>
      </APIProvider>
    </ThemeProvider>
  );
};

const adjustNicknames = (current: string[], target: number): string[] => {
  if (current.length === target) return current;
  if (current.length < target) {
    return [
      ...current,
      ...Array.from({ length: target - current.length }, () => ""),
    ];
  }
  return current.slice(0, target);
};

export default App;
