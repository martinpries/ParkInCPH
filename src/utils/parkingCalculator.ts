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

function differenceInMinutes(date1: Date, date2: Date): number {
  return Math.max(0, Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60)));
}

function differenceInHours(date1: Date, date2: Date): number {
  return Math.max(0, Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60)));
}

function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}

function addMinutes(date: Date, minutes: number): Date {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
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

// Calculate cost based on billing method
function calculateCostForPeriod(
  minutes: number, 
  hourlyRate: number, 
  billingMethod: 'per_minute' | 'per_started_hour' | 'per_15_minutes' | 'per_30_minutes' = 'per_minute'
): number {
  if (hourlyRate === 0) return 0;
  
  switch (billingMethod) {
    case 'per_minute':
      return (minutes / 60) * hourlyRate;
      
    case 'per_started_hour':
      return Math.ceil(minutes / 60) * hourlyRate;
      
    case 'per_15_minutes':
      return Math.ceil(minutes / 15) * (hourlyRate / 4);
      
    case 'per_30_minutes':
      return Math.ceil(minutes / 30) * (hourlyRate / 2);
      
    default:
      return (minutes / 60) * hourlyRate;
  }
}

// Check if current time is in a free period
function isInFreePeriod(date: Date, hour: number, spot: ParkingSpot): boolean {
  const pricing = spot.pricing_rules;
  if (!pricing?.free_periods) return false;
  
  const dayType = getDayType(date);
  const dayNames = {
    'weekdays': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    'saturday': ['saturday'],
    'sunday': ['sunday'],
    'weekend': ['saturday', 'sunday']
  };
  
  for (const freePeriod of pricing.free_periods) {
    // Check if current day matches
    const currentDayMatches = freePeriod.days?.some(day => {
      if (day === 'weekdays' && dayType === 'weekdays') return true;
      if (day === 'weekend' && (dayType === 'saturday' || dayType === 'sunday')) return true;
      if (day === 'saturday' && dayType === 'saturday') return true;
      if (day === 'sunday' && dayType === 'sunday') return true;
      return false;
    });
    
    if (currentDayMatches && freePeriod.times) {
      // Check if current hour is within free time ranges
      for (const timeRange of freePeriod.times) {
        const { start, end } = parseTimeRange(timeRange);
        if ((hour >= start && hour < end) || (end > 24 && (hour >= start || hour < (end - 24)))) {
          return true;
        }
      }
    }
  }
  
  return false;
}
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
  const endTime = new Date(departureDate);  // Handle hourly progression pricing (like Frederiksberg)
  if (spot.pricing_rules?.hourly_progression) {
    let currentTime = new Date(arrivalDate);
    const endTime = new Date(departureDate);
    let totalCost = 0;
    let totalChargedMinutes = 0; // Track actual charged time for hourly progression
    let hourIndex = 0; // Track which hour rate we're on
    
    while (currentTime < endTime) {
      const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
      const dayType = getDayType(currentTime);
      
      // Check if we're in a free period
      const isInFree = isInFreePeriod(currentTime, currentHour, spot);
      
      // Get appropriate progression rules for current day
      let progression = spot.pricing_rules.hourly_progression.weekdays;
      if (dayType === 'saturday' && spot.pricing_rules.hourly_progression.saturday) {
        progression = spot.pricing_rules.hourly_progression.saturday;
      }
      
      // Check if we're within active hours for this day type
      let isInActiveHours = false;
      if (progression) {
        const { start: activeStart, end: activeEnd } = parseTimeRange(progression.active_hours);
        isInActiveHours = (currentHour >= activeStart && currentHour < activeEnd) || 
                         (activeEnd > 24 && (currentHour >= activeStart || currentHour < (activeEnd - 24)));
      }
      
      // Calculate time until next rate change or end time
      let nextTime = new Date(currentTime);
      nextTime.setMinutes(nextTime.getMinutes() + 1); // Move forward by 1 minute
      
      // Don't go past end time
      if (nextTime > endTime) {
        nextTime = new Date(endTime);
      }
      
      const minutesInPeriod = Math.max(0, (nextTime.getTime() - currentTime.getTime()) / (1000 * 60));
      
      if (minutesInPeriod > 0) {
        let shouldCharge = isInActiveHours && !isInFree && !isCompletelyFree(currentTime, spot);
        let periodCost = 0;
        
        if (shouldCharge && progression) {
          // Calculate which hour rate to use based on total charged time so far
          const currentHourRate = Math.floor(totalChargedMinutes / 60);
          const rateIndex = Math.min(currentHourRate, progression.rates.length - 1);
          const hourlyRate = progression.rates[rateIndex];
          
          // Calculate cost for this minute
          periodCost = (minutesInPeriod / 60) * hourlyRate;
          totalChargedMinutes += minutesInPeriod;
          
          // Add to breakdown if we haven't already added this hour rate
          const currentRateHour = Math.floor((totalChargedMinutes - minutesInPeriod) / 60) + 1;
          const newRateHour = Math.floor(totalChargedMinutes / 60) + 1;
          
          if (currentRateHour !== newRateHour || costBreakdown.length === 0 || 
              costBreakdown[costBreakdown.length - 1].rate !== hourlyRate) {
            costBreakdown.push({
              period: `Time ${currentRateHour} (${hourlyRate} kr/time)`,
              hours: 0, // Will be updated
              rate: hourlyRate,
              cost: 0 // Will be updated
            });
          }
          
          // Update the last breakdown entry
          if (costBreakdown.length > 0) {
            const lastEntry = costBreakdown[costBreakdown.length - 1];
            lastEntry.hours += Math.round((minutesInPeriod / 60) * 100) / 100;
            lastEntry.cost += Math.round(periodCost * 100) / 100;
          }
        } else if (!shouldCharge) {
          // Add free period to breakdown
          let reasonFree = '';
          if (isCompletelyFree(currentTime, spot)) {
            reasonFree = ' (helligdag)';
          } else if (isInFree) {
            reasonFree = ' (gratis periode)';
          } else if (!isInActiveHours) {
            reasonFree = ' (uden for aktive timer)';
          }
          
          if (costBreakdown.length === 0 || !costBreakdown[costBreakdown.length - 1].period.includes(reasonFree)) {
            costBreakdown.push({
              period: `${format(currentTime, 'MMM dd HH:mm')}${reasonFree}`,
              hours: 0,
              rate: 0,
              cost: 0
            });
          }
          
          // Update the last free entry
          if (costBreakdown.length > 0) {
            const lastEntry = costBreakdown[costBreakdown.length - 1];
            if (lastEntry.rate === 0) {
              lastEntry.hours += Math.round((minutesInPeriod / 60) * 100) / 100;
            }
          }
        }
        
        totalCost += periodCost;
      }
      
      currentTime = nextTime;
    }
    
    // Apply daily maximum if set
    if (spot.pricing_rules.hourly_progression.weekdays?.max_daily && totalCost > spot.pricing_rules.hourly_progression.weekdays.max_daily) {
      totalCost = spot.pricing_rules.hourly_progression.weekdays.max_daily;
      
      // Add note about daily maximum
      costBreakdown.push({
        period: 'Dagligt maksimum anvendt',
        hours: 0,
        rate: 0,
        cost: -(totalCost - spot.pricing_rules.hourly_progression.weekdays.max_daily)
      });
    }

    return {
      spot,
      totalCost: Math.round(totalCost * 100) / 100,
      costBreakdown,
      distance: 0
    };
  }
    // Handle standard hourly rates
  const billingMethod = spot.pricing_rules.billing_method || 'per_minute';
  
  while (currentTime < endTime) {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const rate = getRate(currentTime, currentHour, spot);
    
    // Calculate time until next rate change or end time
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
    const minutesInPeriod = Math.max(0, (periodEndTime.getTime() - currentTime.getTime()) / (1000 * 60));
    
    if (minutesInPeriod > 0) {
      let periodCost = 0;
      let actualMinutesToCharge = minutesInPeriod;
      
      // Apply free first hour if applicable (but not for completely free periods)
      if (isFirstHour && getsFreeFirstHour && rate > 0 && minutesInPeriod >= 60) {
        actualMinutesToCharge = Math.max(0, minutesInPeriod - 60);
      }
      
      periodCost = calculateCostForPeriod(actualMinutesToCharge, rate, billingMethod);
      
      // Create breakdown entry
      let periodDescription = `${format(currentTime, 'MMM dd HH:mm')} - ${format(periodEndTime, 'MMM dd HH:mm')}`;
      if (rate === 0) {
        periodDescription += ' (gratis)';
      } else if (isFirstHour && getsFreeFirstHour && minutesInPeriod >= 60) {
        periodDescription += ' (første time gratis)';
      }
      
      // Add billing method info to description for clarity
      if (rate > 0) {
        switch (billingMethod) {
          case 'per_started_hour':
            periodDescription += ` (${Math.ceil(actualMinutesToCharge / 60)} påbegyndte timer)`;
            break;
          case 'per_15_minutes':
            periodDescription += ` (${Math.ceil(actualMinutesToCharge / 15)} × 15 min)`;
            break;
          case 'per_30_minutes':
            periodDescription += ` (${Math.ceil(actualMinutesToCharge / 30)} × 30 min)`;
            break;
          case 'per_minute':
            periodDescription += ` (${Math.round(actualMinutesToCharge)} minutter)`;
            break;
        }
      }
        
      costBreakdown.push({
        period: periodDescription,
        hours: Math.round((minutesInPeriod / 60) * 10) / 10,
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
