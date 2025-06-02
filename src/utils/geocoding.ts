export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
}

// Real geocoding function using OpenStreetMap Nominatim API
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    // Clean and format the address for better results
    const cleanAddress = address.trim();
    if (!cleanAddress) {
      return null;
    }

    // Add Copenhagen to the search if not already included
    const searchQuery = cleanAddress.toLowerCase().includes('copenhagen') || 
                       cleanAddress.toLowerCase().includes('københavn') || 
                       cleanAddress.toLowerCase().includes('denmark') || 
                       cleanAddress.toLowerCase().includes('danmark')
      ? cleanAddress
      : `${cleanAddress}, Copenhagen, Denmark`;

    // Use Nominatim API with parameters optimized for Danish addresses
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodedQuery}&` +
      `format=json&` +
      `limit=5&` +
      `countrycodes=dk&` +
      `addressdetails=1&` +
      `bounded=1&` +
      `viewbox=12.2,55.5,12.8,55.8&` + // Bounding box for Copenhagen area
      `email=parkincph@example.com`; // Required by Nominatim terms of use

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ParkInCPH/1.0 (Copenhagen Parking App)'
      }
    });

    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText);
      return getDefaultLocation();
    }

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) {
      console.warn('No geocoding results found for:', address);
      return getDefaultLocation();
    }

    // Return the best result (Nominatim sorts by relevance/importance)
    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name
    };

  } catch (error) {
    console.error('Geocoding error:', error);
    return getDefaultLocation();
  }
}

// Fallback to Copenhagen city center if geocoding fails
function getDefaultLocation(): GeocodeResult {
  return {
    latitude: 55.6761,
    longitude: 12.5683,
    address: 'Copenhagen, Denmark'
  };
}
