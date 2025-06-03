import { Coordinate, ParkingSpot } from '@/types/parking';

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

// Calculate distance to the closest point of a parking area
export function calculateDistanceToParkingSpot(targetLat: number, targetLon: number, spot: ParkingSpot): number {
  const areaType = spot.area_type || 'points';
  
  switch (areaType) {
    case 'circle':
      if (spot.circle_area) {
        const distanceToCenter = calculateDistance(
          targetLat, targetLon, 
          spot.circle_area.center.latitude, 
          spot.circle_area.center.longitude
        );
        // Distance to edge of circle (subtract radius, but convert to km first)
        const radiusKm = spot.circle_area.radius / 1000;
        return Math.max(0, distanceToCenter - radiusKm);
      }
      break;
      
    case 'rectangle':
      if (spot.bounds) {
        // Find closest point on rectangle to target
        const closestLat = Math.max(spot.bounds.south, Math.min(targetLat, spot.bounds.north));
        const closestLon = Math.max(spot.bounds.west, Math.min(targetLon, spot.bounds.east));
        return calculateDistance(targetLat, targetLon, closestLat, closestLon);
      }
      break;
      
    case 'polygon':
      if (spot.polygon_coordinates && spot.polygon_coordinates.length > 0) {
        // For polygon, find distance to closest vertex (simplified approach)
        // For more accuracy, you could implement point-to-polygon distance
        return findClosestDistance(targetLat, targetLon, spot.polygon_coordinates);
      }
      break;
      
    case 'points':
    default:
      if (spot.coordinates && spot.coordinates.length > 0) {
        return findClosestDistance(targetLat, targetLon, spot.coordinates);
      }
      break;
  }
  
  return Infinity; // No valid coordinates found
}

// Find the closest distance from a point to any of the coordinates
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

// Filter parking spots within radius
export function filterParkingSpotsWithinRadius(
  targetLat: number, 
  targetLon: number, 
  parkingSpots: ParkingSpot[], 
  radiusKm: number = 1
) {
  return parkingSpots.filter(spot => {
    const distance = calculateDistanceToParkingSpot(targetLat, targetLon, spot);
    return distance <= radiusKm;
  }).map(spot => ({
    ...spot,
    distance: calculateDistanceToParkingSpot(targetLat, targetLon, spot)
  }));
}
