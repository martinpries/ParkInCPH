export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface HourlyRates {
  [hour: number]: number;
}

export interface PricingRule {
  times: string;
  rate?: number;
  hourly_rates?: HourlyRates;
  currency: string;
  max_daily?: number;
}

export interface PricingStandardized {
  weekdays?: PricingRule[];
  saturday?: PricingRule[];
  sunday?: PricingRule[];
  weekend?: PricingRule[];
  weekend_nights?: PricingRule[];
  other_times?: PricingRule[];
}

export interface ParkingSpot {
  name: string;
  coordinates: Coordinate[];
  pricing_description: string;
  pricing_standardized: PricingStandardized;
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
}
