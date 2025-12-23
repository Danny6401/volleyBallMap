import type { LatLng, MapBounds } from "../types";

const EARTH_RADIUS_KM = 6371;

export const haversineKm = (a: LatLng, b: LatLng): number => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
};

export const inBounds = (
  point: LatLng,
  bounds: MapBounds | null | undefined
): boolean => {
  if (!bounds) return true;

  const withinLat = point.lat >= bounds.south && point.lat <= bounds.north;
  if (!withinLat) return false;

  const crossesDateline = bounds.east < bounds.west;
  const withinLng = crossesDateline
    ? point.lng >= bounds.west || point.lng <= bounds.east
    : point.lng >= bounds.west && point.lng <= bounds.east;

  return withinLng;
};

const toRadians = (deg: number): number => (deg * Math.PI) / 180;
