import { getDistance } from 'geolib';

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const meters = getDistance({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
  return meters / 1000;
}

export function isWithinRadiusKm(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  return distanceKm(pointLat, pointLon, centerLat, centerLon) <= radiusKm;
}
