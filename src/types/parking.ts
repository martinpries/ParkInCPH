export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CircleArea {
  center: Coordinate;
  radius: number; // in meters
}

// Simplified pricing structure
export interface PricingRules {
  base_rates?: 
    | { [timeRange: string]: number }
    | {
        weekdays?: { [timeRange: string]: number };
        weekends?: { [timeRange: string]: number };
      };
  hourly_progression?: {
    weekdays?: {
      active_hours: string;
      rates: number[];
      max_daily?: number;
    };
    saturday?: {
      active_hours: string;
      rates: number[];
    };
  };
  special_periods?: {
    free_first_hour?: Array<{
      period: string;
      description: string;
    }>;
    free_periods?: Array<{
      dates?: string[];
      times?: string[];
      days?: string[];
      description: string;
    }>;
  };
  free_periods?: Array<{
    times: string[];
    days: string[];
  }>;
}

export interface ParkingSpot {
  name: string;
  // Support different area types
  area_type?: 'points' | 'polygon' | 'rectangle' | 'circle';
  // Legacy support for point-based coordinates
  coordinates?: Coordinate[];
  // New area definitions
  polygon_coordinates?: Coordinate[];
  triangle_coordinates?: [Coordinate, Coordinate, Coordinate]; // Exactly 3 points for triangle
  bounds?: Bounds;
  circle_area?: CircleArea;
  pricing_description: string;
  pricing_rules: PricingRules;
}

export interface ParkingData {
  parking_spots: ParkingSpot[];
}

export interface ParkingCalculation {
  spot: ParkingSpot;
  totalCost: number;
  costBreakdown: {
    period: string;
    hours: number;
    rate: number;
    cost: number;
  }[];
  distance: number;
  searchLocation?: Coordinate;
}
