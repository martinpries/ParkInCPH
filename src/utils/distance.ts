import { Coordinate } from '@/types/parking';

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find the closest distance from a point to any of the parking spot coordinates
export function findClosestDistance(targetLat: number, targetLon: number, coordinates: Coordinate[]): number {
  let minDistance = Infinity;
  
  for (const coord of coordinates) {
    const distance = calculateDistance(targetLat, targetLon, coord.latitude, coord.longitude);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance;
}

// Filter parking spots within 1km radius
export function filterParkingSpotsWithinRadius(
  targetLat: number, 
  targetLon: number, 
  parkingSpots: any[], 
  radiusKm: number = 1
) {
  return parkingSpots.filter(spot => {
    const distance = findClosestDistance(targetLat, targetLon, spot.coordinates);
    return distance <= radiusKm;
  }).map(spot => ({
    ...spot,
    distance: findClosestDistance(targetLat, targetLon, spot.coordinates)
  }));
}
