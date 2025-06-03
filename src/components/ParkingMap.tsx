'use client'

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Rectangle, Circle } from 'react-leaflet';
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

export default function ParkingMap({ parkingSpot, searchLocation, distance }: ParkingMapProps) {  // Helper function to get center coordinate from different area types
  const getParkingCenter = (spot: ParkingSpot): Coordinate => {
    if (spot.circle_area) {
      return spot.circle_area.center;
    }
    
    if (spot.bounds) {
      return {
        latitude: (spot.bounds.north + spot.bounds.south) / 2,
        longitude: (spot.bounds.east + spot.bounds.west) / 2
      };
    }
    
    if (spot.polygon_coordinates && spot.polygon_coordinates.length > 0) {
      const avgLat = spot.polygon_coordinates.reduce((sum, coord) => sum + coord.latitude, 0) / spot.polygon_coordinates.length;
      const avgLng = spot.polygon_coordinates.reduce((sum, coord) => sum + coord.longitude, 0) / spot.polygon_coordinates.length;
      return { latitude: avgLat, longitude: avgLng };
    }
    
    // Fallback to legacy coordinates
    if (spot.coordinates && spot.coordinates.length > 0) {
      return spot.coordinates[0];
    }
    
    // Default fallback
    return { latitude: 55.676, longitude: 12.568 }; // Copenhagen center
  };

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
  }) : undefined;  // Calculate the center point between search location and parking spot
  const parkingCoordinates = getParkingCenter(parkingSpot);
  
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

  // Helper function to render parking areas based on type
  const renderParkingArea = (spot: ParkingSpot) => {
    const areaType = spot.area_type || 'points';
    
    const popupContent = (
      <div className="text-center">
        <strong>{spot.name}</strong>
        <br />
        <span className="text-sm text-gray-600">
          {distance.toFixed(2)}km away
        </span>
      </div>
    );

    switch (areaType) {
      case 'polygon':
        if (spot.polygon_coordinates && spot.polygon_coordinates.length >= 3) {
          const positions: [number, number][] = spot.polygon_coordinates.map(coord => 
            [coord.latitude, coord.longitude]
          );
          return (
            <Polygon
              key={`polygon-${spot.name}`}
              positions={positions}
              color="#3b82f6"
              fillColor="#3b82f6"
              fillOpacity={0.2}
              weight={2}
            >
              <Popup>{popupContent}</Popup>
            </Polygon>
          );
        }
        break;
        
      case 'rectangle':
        if (spot.bounds) {
          const bounds: [[number, number], [number, number]] = [
            [spot.bounds.south, spot.bounds.west],
            [spot.bounds.north, spot.bounds.east]
          ];
          return (
            <Rectangle
              key={`rectangle-${spot.name}`}
              bounds={bounds}
              color="#3b82f6"
              fillColor="#3b82f6"
              fillOpacity={0.2}
              weight={2}
            >
              <Popup>{popupContent}</Popup>
            </Rectangle>
          );
        }        break;
        
      case 'triangle':
        if (spot.triangle_coordinates && spot.triangle_coordinates.length === 3) {
          const positions: [number, number][] = spot.triangle_coordinates.map(coord => 
            [coord.latitude, coord.longitude]
          );
          return (
            <Polygon
              key={`triangle-${spot.name}`}
              positions={positions}
              color="#10b981"
              fillColor="#10b981"
              fillOpacity={0.2}
              weight={2}
            >
              <Popup>{popupContent}</Popup>
            </Polygon>
          );
        }
        break;
        
      case 'circle':
        if (spot.circle_area) {
          return (
            <Circle
              key={`circle-${spot.name}`}
              center={[spot.circle_area.center.latitude, spot.circle_area.center.longitude]}
              radius={spot.circle_area.radius}
              color="#3b82f6"
              fillColor="#3b82f6"
              fillOpacity={0.2}
              weight={2}
            >
              <Popup>{popupContent}</Popup>
            </Circle>
          );
        }
        break;
        
      case 'points':
      default:
        // Legacy point-based markers
        if (spot.coordinates) {
          return spot.coordinates.map((coord, index) => (
            <Marker 
              key={`point-${spot.name}-${index}`}
              position={[coord.latitude, coord.longitude]} 
              icon={parkingIcon}
            >
              <Popup>{popupContent}</Popup>
            </Marker>
          ));
        }
        break;
    }
    
    return null;
  };

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
        />        {/* Search location marker */}
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
        
        {/* Parking area (polygon, rectangle, circle, or points) */}
        {renderParkingArea(parkingSpot)}
        
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
