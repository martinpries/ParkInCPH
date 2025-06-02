import { ParkingSpot, ParkingCalculation } from '@/types/parking';

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

// Check if a date is a holiday
function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  // Christmas Eve (December 24) and New Year's Day (January 1)
  return (month === 12 && day === 24) || (month === 1 && day === 1);
}

// Check if a date is completely free (holiday for spots that have free holiday periods)
function isCompletelyFree(date: Date, spot: ParkingSpot): boolean {
  const pricing = spot.pricing_rules;
  if (!pricing?.special_periods?.free_periods) return false;
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // Check if this date is in the free periods
  for (const freePeriod of pricing.special_periods.free_periods) {
    if (freePeriod.dates && freePeriod.dates.includes(dateStr)) {
      return true;
    }
  }
  
  return false;
}

// Check if parking qualifies for free first hour
function qualifiesForFreeFirstHour(arrivalDate: Date, spot: ParkingSpot): boolean {
  const pricing = spot.pricing_rules;
  if (!pricing?.special_periods?.free_first_hour) return false;
  
  const dayOfWeek = getDay(arrivalDate);
  const hour = arrivalDate.getHours();
  
  // Check for Saturday 17:00 to Monday 08:00 period
  for (const freeFirstHourRule of pricing.special_periods.free_first_hour) {
    if (freeFirstHourRule.period === "saturday_17:00_to_monday_08:00") {
      // Saturday after 17:00
      if (dayOfWeek === 6 && hour >= 17) return true;
      // Sunday (all day)
      if (dayOfWeek === 0) return true;
      // Monday before 08:00
      if (dayOfWeek === 1 && hour < 8) return true;
    }
  }
  
  return false;
}

// Get rate for a specific time and day
function getRate(date: Date, hour: number, spot: ParkingSpot): number {
  const pricing = spot.pricing_rules;
  
  // First check if it's completely free (holiday)
  if (isCompletelyFree(date, spot)) {
    return 0;
  }
    // Check base rates
  if (pricing.base_rates) {
    // Check if it's the simple time-based structure
    if (typeof Object.values(pricing.base_rates)[0] === 'number') {
      // Simple time-based rates (like Vesterbro)
      const rates = pricing.base_rates as { [timeRange: string]: number };
      for (const [timeRange, rate] of Object.entries(rates)) {
        const { start, end } = parseTimeRange(timeRange);
        if ((hour >= start && hour < end) || (end > 24 && (hour >= start || hour < (end - 24)))) {
          return rate;
        }
      }
    } else {
      // Day-specific rates (like Carlsberg)
      const dayBasedRates = pricing.base_rates as { weekdays?: { [timeRange: string]: number }; weekends?: { [timeRange: string]: number } };
      const dayType = getDayType(date);
      
      if ((dayType === 'saturday' || dayType === 'sunday') && dayBasedRates.weekends) {
        for (const [timeRange, rate] of Object.entries(dayBasedRates.weekends)) {
          const { start, end } = parseTimeRange(timeRange);
          if ((hour >= start && hour < end) || (end > 24 && (hour >= start || hour < (end - 24)))) {
            return rate;
          }
        }
      } else if (dayBasedRates.weekdays) {
        for (const [timeRange, rate] of Object.entries(dayBasedRates.weekdays)) {
          const { start, end } = parseTimeRange(timeRange);
          if ((hour >= start && hour < end) || (end > 24 && (hour >= start || hour < (end - 24)))) {
            return rate;
          }
        }
      }
    }
  }
  
  return 0; // Default to free if no rate found
}

// Calculate parking cost for a specific parking spot
export function calculateParkingCost(
  spot: ParkingSpot,
  arrivalDate: Date,
  departureDate: Date
): ParkingCalculation {
  const costBreakdown: { period: string; hours: number; rate: number; cost: number }[] = [];
  let totalCost = 0;
  let isFirstHour = true;
  const getsFreeFirstHour = qualifiesForFreeFirstHour(arrivalDate, spot);
  
  let currentTime = new Date(arrivalDate);
  const endTime = new Date(departureDate);
    // Handle hourly progression pricing (like Frederiksberg)
  if (spot.pricing_rules?.hourly_progression) {
    const dayType = getDayType(arrivalDate);
    let progression = spot.pricing_rules.hourly_progression.weekdays;
    
    if (dayType === 'saturday' && spot.pricing_rules.hourly_progression.saturday) {
      progression = spot.pricing_rules.hourly_progression.saturday;
    }
    
    if (progression) {
      const { start: activeStart, end: activeEnd } = parseTimeRange(progression.active_hours);
      const arrivalHour = arrivalDate.getHours() + arrivalDate.getMinutes() / 60;
      const departureHour = departureDate.getHours() + departureDate.getMinutes() / 60;
      
      // Check if parking time overlaps with active hours
      if (arrivalHour < activeEnd && departureHour > activeStart) {
        const totalHours = Math.ceil(differenceInHours(departureDate, arrivalDate));
        let hourlyRate = 0;
        
        for (let h = 1; h <= totalHours; h++) {
          const rateIndex = Math.min(h - 1, progression.rates.length - 1);
          hourlyRate += progression.rates[rateIndex];
        }
        
        if (progression.max_daily && hourlyRate > progression.max_daily) {
          hourlyRate = progression.max_daily;
        }
          costBreakdown.push({
          period: `${format(arrivalDate, 'MMM dd HH:mm')} - ${format(departureDate, 'MMM dd HH:mm')}`,
          hours: Math.round(totalHours * 10) / 10,
          rate: Math.round((hourlyRate / totalHours) * 10) / 10,
          cost: Math.round(hourlyRate * 10) / 10
        });

        return {
          spot,
          totalCost: Math.round(hourlyRate * 10) / 10,
          costBreakdown,
          distance: 0
        };
      }
    }
  }
  
  // Handle standard hourly rates
  while (currentTime < endTime) {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const rate = getRate(currentTime, currentHour, spot);
    
    // Calculate hours until next rate change or end time
    let nextHour = Math.floor(currentHour) + 1;
    if (nextHour >= 24) nextHour = 0;
    
    const nextTime = new Date(currentTime);
    if (nextHour === 0) {
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(0, 0, 0, 0);
    } else {
      nextTime.setHours(nextHour, 0, 0, 0);
    }
    
    const periodEndTime = new Date(Math.min(nextTime.getTime(), endTime.getTime()));
    const hoursInPeriod = Math.max(0, (periodEndTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60));
    
    if (hoursInPeriod > 0) {
      let periodCost = 0;
      let actualHoursToCharge = hoursInPeriod;
      
      // Apply free first hour if applicable (but not for completely free periods)
      if (isFirstHour && getsFreeFirstHour && rate > 0 && Math.ceil(hoursInPeriod) >= 1) {
        actualHoursToCharge = Math.max(0, hoursInPeriod - 1);
      }
      
      periodCost = Math.ceil(actualHoursToCharge) * rate;
      
      // Create breakdown entry
      let periodDescription = `${format(currentTime, 'MMM dd HH:mm')} - ${format(periodEndTime, 'MMM dd HH:mm')}`;
      if (rate === 0) {
        periodDescription += ' (gratis)';
      } else if (isFirstHour && getsFreeFirstHour && Math.ceil(hoursInPeriod) >= 1) {
        periodDescription += ' (første time gratis)';
      }
        costBreakdown.push({
        period: periodDescription,
        hours: Math.round(hoursInPeriod * 10) / 10,
        rate: Math.round(rate * 10) / 10,
        cost: Math.round(periodCost * 10) / 10
      });
      
      totalCost += periodCost;
      isFirstHour = false;
    }
    
    currentTime = periodEndTime;
  }
    return {
    spot,
    totalCost: Math.round(totalCost * 10) / 10,
    costBreakdown,
    distance: 0 // Will be set by the calling function
  };
}
