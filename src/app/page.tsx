'use client'

import React, { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ParkingResults from '@/components/ParkingResults';
import { ParkingCalculation } from '@/types/parking';
import { loadParkingData } from '@/utils/dataLoader';
import { geocodeAddress } from '@/utils/geocoding';
import { filterParkingSpotsWithinRadius } from '@/utils/distance';
import { calculateParkingCost } from '@/utils/parkingCalculator';

export default function HomePage() {
  const [results, setResults] = useState<ParkingCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [lastMaxDistance, setLastMaxDistance] = useState(1);
  const [error, setError] = useState<string | null>(null);  const handleSearch = async (address: string, arrivalDate: string, departureDate: string, maxDistance: number) => {
    setIsLoading(true);
    setError(null);
    setSearchAddress(address);
    setLastMaxDistance(maxDistance);
    
    try {
      // Geocode the address
      const geocodeResult = await geocodeAddress(address);
      if (!geocodeResult) {
        throw new Error('Could not find location for the provided address');
      }
      
      // Load parking data
      const parkingData = await loadParkingData();
      
      // Filter spots within specified radius
      const nearbySpots = filterParkingSpotsWithinRadius(
        geocodeResult.latitude,
        geocodeResult.longitude,
        parkingData.parking_spots,
        maxDistance
      );
      
      // Calculate costs for each spot
      const arrival = new Date(arrivalDate);
      const departure = new Date(departureDate);
      
      if (departure <= arrival) {
        throw new Error('Departure time must be after arrival time');
      }
        const calculations: ParkingCalculation[] = nearbySpots.map(spot => {
        const calculation = calculateParkingCost(spot, arrival, departure);
        return {
          ...calculation,
          distance: spot.distance,
          searchLocation: {
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude
          }
        };
      });
      
      setResults(calculations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        {error && (
          <div className="glass-card p-6 w-full max-w-2xl mx-auto mt-8">
            <div className="text-center text-red-200">
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {results.length > 0 && (
          <ParkingResults results={results} searchAddress={searchAddress} />
        )}
        
        {!isLoading && results.length === 0 && !error && searchAddress && (
          <div className="glass-card p-8 w-full max-w-2xl mx-auto mt-8">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">No Results</h3>              <p className="text-white/80">
                No parking spots found within {lastMaxDistance}km of "{searchAddress}". 
                Try increasing the distance or a different location in Copenhagen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
