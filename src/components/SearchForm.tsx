'use client'

import React from 'react';

interface SearchFormProps {
  onSearch: (address: string, arrivalDate: string, departureDate: string, maxDistance: number) => void;
  isLoading: boolean;
  initialAddress?: string;
}

export default function SearchForm({ onSearch, isLoading, initialAddress = '' }: SearchFormProps) {  const [address, setAddress] = React.useState('');
  const [arrivalDate, setArrivalDate] = React.useState('');
  const [departureDate, setDepartureDate] = React.useState('');
  const [maxDistance, setMaxDistance] = React.useState(1); // Default 1 km

  React.useEffect(() => {
    // Set default dates to current time and 2 hours later
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDateTime = (date: Date) => {
      return date.toISOString().slice(0, 16);
    };
    
    setArrivalDate(formatDateTime(now));
    setDepartureDate(formatDateTime(later));
  }, []);
  
  // Set initial address when provided
  React.useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && arrivalDate && departureDate) {
      onSearch(address, arrivalDate, departureDate, maxDistance);
    }
  };

  return (
    <div className="glass-card p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        🅿️ ParkInCPH
      </h1>
      <p className="text-white/80 text-center mb-8">
        Find the best parking options in Copenhagen
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-white font-medium mb-2">
            Copenhagen Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., Vesterbro, Nyhavn, Tivoli..."
            className="w-full p-4 input-glass text-white placeholder-white/60"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="arrival" className="block text-white font-medium mb-2">
              Arrival Date & Time
            </label>
            <input
              id="arrival"
              type="datetime-local"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full p-4 input-glass text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="departure" className="block text-white font-medium mb-2">
              Departure Date & Time
            </label>
            <input
              id="departure"
              type="datetime-local"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full p-4 input-glass text-white"
              required
            />
          </div>        </div>
        
        <div>
          <label htmlFor="distance" className="block text-white font-medium mb-2">
            Maximum Distance: {maxDistance} km
          </label>
          <div className="relative">
            <input
              id="distance"
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-white/60 text-sm mt-1">
              <span>0.1 km</span>
              <span>5 km</span>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !address || !arrivalDate || !departureDate}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Find Parking Spots'}
        </button>
      </form>
    </div>
  );
}
