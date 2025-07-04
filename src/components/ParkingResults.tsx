'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { ParkingCalculation } from '@/types/parking';

// Dynamically import the map component to avoid SSR issues
const ParkingMap = dynamic(() => import('./ParkingMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
});

interface ParkingResultsProps {
  results: ParkingCalculation[];
  searchAddress: string;
  arrivalDate: string;
  departureDate: string;
}

export default function ParkingResults({ results, searchAddress, arrivalDate, departureDate }: ParkingResultsProps) {
  // Calculate duration information
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const durationMs = departure.getTime() - arrival.getTime();
  const totalHours = Math.floor(durationMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format dates for display
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('da-DK', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDuration = (hours: number, minutes: number) => {
    if (hours === 0) {
      return `${minutes} minutter`;
    } else if (minutes === 0) {
      return `${hours} time${hours !== 1 ? 'r' : ''}`;
    } else {
      return `${hours} time${hours !== 1 ? 'r' : ''} og ${minutes} minutter`;
    }
  };
  if (results.length === 0) {
    return (
      <div className="glass-card p-8 w-full max-w-4xl mx-auto mt-8">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Parking Found</h2>          <p className="text-white/80">
            No parking spots found within 1km of &quot;{searchAddress}&quot;. 
            Try searching for a different location in Copenhagen.
          </p>
        </div>
      </div>
    );
  }

  return (    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="glass-card p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Parking Options Near &quot;{searchAddress}&quot;
        </h2>
        <p className="text-white/80 mb-4">
          Found {results.length} parking spot{results.length !== 1 ? 's' : ''} within 1km
        </p>
        
        {/* Time Summary Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-sm">Fra:</span>
                <span className="text-white font-medium">{formatDateTime(arrival)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-sm">Til:</span>
                <span className="text-white font-medium">{formatDateTime(departure)}</span>
              </div>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <div className="text-center md:text-right">
                <div className="text-white/70 text-sm">Total varighed</div>
                <div className="text-xl font-bold text-white">
                  {formatDuration(totalHours, totalMinutes)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results
          .sort((a, b) => a.totalCost - b.totalCost)
          .map((result, index) => (
            <ParkingCard key={index} result={result} rank={index + 1} />
          ))}
      </div>
    </div>
  );
}

function ParkingCard({ result, rank }: { result: ParkingCalculation; rank: number }) {
  const { spot, totalCost, costBreakdown, distance } = result;
  
  const getRankBadge = (rank: number) => {
    const badges = {
      1: { text: '🥇 Best Value', color: 'bg-yellow-500' },
      2: { text: '🥈 Second Best', color: 'bg-gray-400' },
      3: { text: '🥉 Third Best', color: 'bg-amber-600' },
    };
    return badges[rank as keyof typeof badges] || { text: `#${rank}`, color: 'bg-blue-500' };
  };
  
  const badge = getRankBadge(rank);
  
  return (
    <div className="parking-card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium mb-2 ${badge.color}`}>
            {badge.text}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{spot.name}</h3>
          <p className="text-gray-600">
            📍 {distance.toFixed(2)}km away
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">
            {totalCost.toFixed(0)} kr
          </div>
          <div className="text-gray-600 text-sm">total cost</div>
        </div>
      </div>
        <div className="border-t pt-4">
        {costBreakdown.length > 0 && (
          <div className="mb-4">
            <details className="mb-3">
              <summary className="cursor-pointer text-blue-600 font-medium hover:text-blue-800">
                View Cost Breakdown
              </summary>
              <div className="mt-2 space-y-1">
                {costBreakdown.map((period, idx) => (
                  <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{period.period}</span>
                    <span>{period.hours}h × {period.rate}kr = {period.cost.toFixed(0)}kr</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
        
        <h4 className="font-semibold text-gray-700 mb-2">Pricing Details:</h4>
        <div className="text-sm text-gray-600 whitespace-pre-line mb-3">
          {spot.pricing_description}
        </div>
      </div>
        <div className="mt-4 pt-4 border-t">
        <h4 className="font-semibold text-gray-700 mb-3">Location & Distance</h4>
        <ParkingMap 
          parkingSpot={spot}
          searchLocation={result.searchLocation}
          distance={distance}
        />
      </div>
        <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500">
          {/* Display coordinates based on area type */}
          {spot.coordinates && (
            <>Coordinates: {spot.coordinates.map(c => `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`).join(' | ')}</>
          )}
          {spot.polygon_coordinates && (
            <>Area: {spot.polygon_coordinates.length} points</>
          )}
          {spot.bounds && (
            <>Rectangle: {spot.bounds.south.toFixed(4)}-{spot.bounds.north.toFixed(4)}, {spot.bounds.west.toFixed(4)}-{spot.bounds.east.toFixed(4)}</>
          )}
          {spot.circle_area && (
            <>Circle: {spot.circle_area.center.latitude.toFixed(4)}, {spot.circle_area.center.longitude.toFixed(4)} (r:{spot.circle_area.radius}m)</>
          )}
        </div>
      </div>
    </div>
  );
}
