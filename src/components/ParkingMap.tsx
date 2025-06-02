'use client'

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ParkingSpot, Coordinate } from '@/types/parking';

interface ParkingMapProps {
  parkingSpot: ParkingSpot;
  searchLocation?: Coordinate;
  distance: number;
}

// Fix for default markers in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export default function ParkingMap({ parkingSpot, searchLocation, distance }: ParkingMapProps) {
  // Create custom icons inside the component to avoid SSR issues
  const searchIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : undefined;

  const parkingIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : undefined;
  // Calculate the center point between search location and parking spot
  const parkingCoordinates = parkingSpot.coordinates[0]; // Use first coordinate for the main marker
  
  const centerLat = searchLocation 
    ? (searchLocation.latitude + parkingCoordinates.latitude) / 2
    : parkingCoordinates.latitude;
  const centerLng = searchLocation
    ? (searchLocation.longitude + parkingCoordinates.longitude) / 2
    : parkingCoordinates.longitude;

  const center: [number, number] = [centerLat, centerLng];

  // Calculate appropriate zoom level based on distance
  const getZoomLevel = (distance: number) => {
    if (distance < 0.2) return 16;
    if (distance < 0.5) return 15;
    if (distance < 1) return 14;
    return 13;
  };

  const zoom = getZoomLevel(distance);
  // Create polyline path if search location is available
  const pathCoordinates: [number, number][] = searchLocation ? [
    [searchLocation.latitude, searchLocation.longitude],
    [parkingCoordinates.latitude, parkingCoordinates.longitude]
  ] : [];

  // Only render on client side
  if (typeof window === 'undefined') {
    return <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>;
  }

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
          {/* Search location marker */}
        {searchLocation && searchIcon && (
          <Marker 
            position={[searchLocation.latitude, searchLocation.longitude]} 
            icon={searchIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Search Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Parking spot markers */}
        {parkingSpot.coordinates.map((coord, index) => (
          <Marker 
            key={index}
            position={[coord.latitude, coord.longitude]} 
            icon={parkingIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{parkingSpot.name}</strong>
                <br />
                <span className="text-sm text-gray-600">
                  {distance.toFixed(2)}km away
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Distance line */}
        {searchLocation && pathCoordinates.length > 0 && (
          <Polyline
            positions={pathCoordinates}
            color="#ef4444"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}
