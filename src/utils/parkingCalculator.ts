import { ParkingSpot, PricingRule, ParkingCalculation } from '@/types/parking';

// Simple date utilities to replace date-fns
function format(date: Date, pattern: string): string {
  const month = date.toLocaleDateString('en', { month: 'short' });
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  return `${month} ${day} ${hours}:${minutes}`;
}

function getDay(date: Date): number {
  return date.getDay();
}

function differenceInHours(date1: Date, date2: Date): number {
  return Math.max(0, Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60)));
}

function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}

function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

// Parse time string (e.g., "08:00") to hours
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

// Parse time range (e.g., "08:00-18:00") 
function parseTimeRange(rangeStr: string): { start: number; end: number } {
  const [startStr, endStr] = rangeStr.split('-');
  let start = parseTime(startStr);
  let end = parseTime(endStr);
  
  // Handle overnight ranges (e.g., "23:00-08:00")
  if (end <= start) {
    end += 24;
  }
  
  return { start, end };
}

// Get day type for pricing rules
function getDayType(date: Date): 'weekdays' | 'saturday' | 'sunday' | 'weekend' {
  const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  if (dayOfWeek === 0) return 'sunday';
  if (dayOfWeek === 6) return 'saturday';
  if (dayOfWeek >= 1 && dayOfWeek <= 5) return 'weekdays';
  return 'weekend';
}

// Calculate cost for a specific time period using hourly rates
function calculateHourlyRateCost(hours: number, hourlyRates: { [hour: number]: number }, maxDaily?: number): number {
  let totalCost = 0;
  let remainingHours = hours;
  let hourCount = 1;
  
  while (remainingHours > 0 && hourlyRates[hourCount]) {
    const hoursAtThisRate = Math.min(1, remainingHours);
    totalCost += hoursAtThisRate * hourlyRates[hourCount];
    remainingHours -= hoursAtThisRate;
    hourCount++;
  }
  
  // If there are remaining hours and we have a rate for hour 6+, use that
  if (remainingHours > 0) {
    const lastRate = hourlyRates[Math.max(...Object.keys(hourlyRates).map(Number))];
    totalCost += remainingHours * lastRate;
  }
  
  // Apply daily maximum if specified
  if (maxDaily && totalCost > maxDaily) {
    totalCost = maxDaily;
  }
  
  return totalCost;
}

// Find applicable pricing rule for a given time on a specific day
function findApplicablePricingRule(date: Date, hour: number, spot: ParkingSpot): PricingRule | null {
  const dayType = getDayType(date);
  const pricing = spot.pricing_standardized;
  
  // Try different rule types in order of specificity
  const ruleTypes = [dayType, 'weekend', 'other_times'];
  
  for (const ruleType of ruleTypes) {
    const rules = pricing[ruleType as keyof typeof pricing];
    if (!rules) continue;
    
    for (const rule of rules) {
      const { start, end } = parseTimeRange(rule.times);
      
      // Check if the hour falls within this time range
      if ((hour >= start && hour < end) || (end > 24 && (hour >= start || hour < (end - 24)))) {
        return rule;
      }
    }
  }
  
  return null;
}

// Calculate parking cost for a specific parking spot
export function calculateParkingCost(
  spot: ParkingSpot,
  arrivalDate: Date,
  departureDate: Date
): ParkingCalculation {
  const costBreakdown: { period: string; hours: number; rate: number; cost: number }[] = [];
  let totalCost = 0;
  
  let currentTime = new Date(arrivalDate);
  const endTime = new Date(departureDate);
  
  while (currentTime < endTime) {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const rule = findApplicablePricingRule(currentTime, currentHour, spot);
    
    if (!rule) {
      // No applicable rule found, assume free
      currentTime = addHours(currentTime, 1);
      continue;
    }
    
    // Calculate how many hours this rule applies
    const { start, end } = parseTimeRange(rule.times);
    const dayStart = startOfDay(currentTime);
    const dayEnd = endOfDay(currentTime);
    
    let ruleEndTime: Date;
    if (end > 24) {
      // Overnight rule
      ruleEndTime = new Date(dayStart);
      ruleEndTime.setHours(end - 24, 0, 0, 0);
      if (ruleEndTime <= currentTime) {
        ruleEndTime = addHours(ruleEndTime, 24);
      }
    } else {
      ruleEndTime = new Date(dayStart);
      ruleEndTime.setHours(end, 0, 0, 0);
    }
    
    const periodEndTime = new Date(Math.min(ruleEndTime.getTime(), endTime.getTime()));
    const hoursInPeriod = Math.max(0, differenceInHours(periodEndTime, currentTime));
    
    if (hoursInPeriod > 0) {
      let periodCost = 0;
      
      if (rule.hourly_rates) {
        // Use hourly rates
        periodCost = calculateHourlyRateCost(hoursInPeriod, rule.hourly_rates, rule.max_daily);
      } else if (rule.rate !== undefined) {
        // Use flat rate
        periodCost = hoursInPeriod * rule.rate;
      }
      
      costBreakdown.push({
        period: `${format(currentTime, 'MMM dd HH:mm')} - ${format(periodEndTime, 'MMM dd HH:mm')}`,
        hours: hoursInPeriod,
        rate: rule.rate || 0,
        cost: periodCost
      });
      
      totalCost += periodCost;
    }
    
    currentTime = periodEndTime;
  }
  
  return {
    spot,
    totalCost,
    costBreakdown,
    distance: 0 // Will be set by the calling function
  };
}
