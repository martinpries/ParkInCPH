export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
}

// Mock geocoding function - in a real app, you'd use a proper geocoding service
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  // For demo purposes, we'll provide some predefined Copenhagen addresses
  const mockAddresses: { [key: string]: GeocodeResult } = {
    'vesterbro': { latitude: 55.6663, longitude: 12.5419, address: 'Vesterbro, Copenhagen' },
    'copenhagen central': { latitude: 55.6761, longitude: 12.5683, address: 'Copenhagen Central Station' },
    'nyhavn': { latitude: 55.6796, longitude: 12.5912, address: 'Nyhavn, Copenhagen' },
    'tivoli': { latitude: 55.6738, longitude: 12.5681, address: 'Tivoli Gardens, Copenhagen' },
    'frederiksberg': { latitude: 55.6785, longitude: 12.5329, address: 'Frederiksberg, Copenhagen' },
    'carlsberg': { latitude: 55.6668, longitude: 12.5368, address: 'Carlsberg Byen, Copenhagen' }
  };
  
  // Simple matching - in a real app, this would call a geocoding API
  const searchKey = address.toLowerCase();
  
  for (const [key, result] of Object.entries(mockAddresses)) {
    if (searchKey.includes(key) || key.includes(searchKey)) {
      return result;
    }
  }
  
  // Default to Copenhagen center if no match found
  return {
    latitude: 55.6761,
    longitude: 12.5683,
    address: 'Copenhagen, Denmark'
  };
}
