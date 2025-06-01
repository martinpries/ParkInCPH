// Core logic extracted from index.html for Node.js testing

const parkingData = {
    parking_spots: [
        {
            name: "København Vesterbro",
            coordinates: [
                { latitude: 55.66519526124639, longitude: 12.54353968489107 },
                { latitude: 55.66531808872339, longitude: 12.53922885081022 }
            ],
            pricing_description: "Mandag - Fredag 08:00-18:00 16kr\nMandag - Fredag 18:00-23:00 17kr\nMandag - Fredag 23:00-08:00 6kr\nLørdag 08:00 til 17:00 16kr\nLørdag 17:00 til Mandag 08:00 0kr",
            pricing_standardized: {
                weekdays: [
                    { times: "08:00-18:00", rate: 16, currency: "kr" },
                    { times: "18:00-23:00", rate: 17, currency: "kr" },
                    { times: "23:00-08:00", rate: 6, currency: "kr" }
                ],
                saturday: [
                    { times: "08:00-17:00", rate: 16, currency: "kr" }
                ],
                weekend_nights: [
                    { times: "17:00-08:00", rate: 0, currency: "kr" }
                ]
            }
        },
        {
            name: "Carlsberg Byen",
            coordinates: [
                { latitude: 55.66675509070274, longitude: 12.536756465807024 }
            ],
            pricing_description: "Timeprisen er pr. påbegyndt time:\nMandag-fredag kl. 00-24: kr. 27\nLørdag-søndag kl. 00-24: kr. 14,50",
            pricing_standardized: {
                weekdays: [
                    { times: "00:00-24:00", rate: 27.0, currency: "kr" }
                ],
                weekend: [
                    { times: "00:00-24:00", rate: 14.50, currency: "kr" }
                ]
            }
        },
        {
            name: "Frederiksberg",
            coordinates: [
                { latitude: 55.668866103512826, longitude: 12.530515569648486 }
            ],
            pricing_description: "Mandag til Fredag 07:00 til 24:00\nLørdag 07:00 til 17:00\nAndre tider er gratis.\nMaks 110 kr per dag og 550 kr per uge\n1. time: 5 kr\n2. time: 10 kr\n3. time: 15 kr\n4. time: 20 kr\n5. time: 25 kr\n6. time: 25 kr",
            pricing_standardized: {
                weekdays: [
                    {
                        times: "07:00-24:00",
                        hourly_rates: { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 25 },
                        currency: "kr",
                        max_daily: 110
                    }
                ],
                saturday: [
                    {
                        times: "07:00-17:00",
                        hourly_rates: { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 25 },
                        currency: "kr"
                    }
                ],
                other_times: [
                    { times: "00:00-07:00", rate: 0, currency: "kr" },
                    { times: "17:00-00:00", rate: 0, currency: "kr" }
                ]
            }
        }
    ]
};

const mockAddresses = {
    'vesterbro': { latitude: 55.6663, longitude: 12.5419, address: 'Vesterbro, Copenhagen' },
    'copenhagen central': { latitude: 55.6761, longitude: 12.5683, address: 'Copenhagen Central Station' },
    'nyhavn': { latitude: 55.6796, longitude: 12.5912, address: 'Nyhavn, Copenhagen' },
    'tivoli': { latitude: 55.6738, longitude: 12.5681, address: 'Tivoli Gardens, Copenhagen' },
    'frederiksberg': { latitude: 55.6785, longitude: 12.5329, address: 'Frederiksberg, Copenhagen' },
    'carlsberg': { latitude: 55.6668, longitude: 12.5368, address: 'Carlsberg Byen, Copenhagen' }
};

function geocodeAddress(address) {
    const searchKey = address.toLowerCase();
    for (const [key, result] of Object.entries(mockAddresses)) {
        if (searchKey.includes(key) || key.includes(searchKey)) {
            return result;
        }
    }
    return { latitude: 55.6761, longitude: 12.5683, address: 'Copenhagen, Denmark' };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function findClosestDistance(targetLat, targetLon, coordinates) {
    let minDistance = Infinity;
    for (const coord of coordinates) {
        const distance = calculateDistance(targetLat, targetLon, coord.latitude, coord.longitude);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    return minDistance;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
}

function parseTimeRange(rangeStr) {
    const [startStr, endStr] = rangeStr.split('-');
    let start = parseTime(startStr);
    let end = parseTime(endStr);
    if (end <= start) {
        end += 24;
    }
    return { start, end };
}

function getDayType(date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return 'sunday';
    if (dayOfWeek === 6) return 'saturday';
    if (dayOfWeek >= 1 && dayOfWeek <= 5) return 'weekdays';
    return 'weekend';
}

function calculateHourlyRateCost(hours, hourlyRates, maxDaily) {
    let totalCost = 0;
    let remainingHours = hours;
    let hourCount = 1;
    while (remainingHours > 0 && hourlyRates[hourCount]) {
        const hoursAtThisRate = Math.min(1, remainingHours);
        totalCost += hoursAtThisRate * hourlyRates[hourCount];
        remainingHours -= hoursAtThisRate;
        hourCount++;
    }
    if (remainingHours > 0) {
        const lastRate = hourlyRates[Math.max(...Object.keys(hourlyRates).map(Number))];
        totalCost += remainingHours * lastRate;
    }
    if (maxDaily && totalCost > maxDaily) {
        totalCost = maxDaily;
    }
    return totalCost;
}

function findApplicablePricingRule(date, hour, spot) {
    const dayType = getDayType(date);
    const pricing = spot.pricing_standardized;
    const ruleTypes = [dayType, 'weekend', 'other_times'];
    for (const ruleType of ruleTypes) {
        const rules = pricing[ruleType];
        if (!rules) continue;
        for (const rule of rules) {
            const { start, end } = parseTimeRange(rule.times);
            if ((hour >= start && hour < end) || (end > 24 && (hour >= start || hour < (end - 24)))) {
                return rule;
            }
        }
    }
    return null;
}

function calculateParkingCost(spot, arrivalDate, departureDate) {
    const costBreakdown = [];
    let totalCost = 0;
    const diffHours = Math.ceil((departureDate - arrivalDate) / (1000 * 60 * 60));
    const currentHour = arrivalDate.getHours() + arrivalDate.getMinutes() / 60;
    const rule = findApplicablePricingRule(arrivalDate, currentHour, spot);
    if (rule) {
        let periodCost = 0;
        if (rule.hourly_rates) {
            periodCost = calculateHourlyRateCost(diffHours, rule.hourly_rates, rule.max_daily);
        } else if (rule.rate !== undefined) {
            periodCost = diffHours * rule.rate;
        }
        costBreakdown.push({
            period: arrivalDate.toLocaleDateString() + ' - ' + departureDate.toLocaleDateString(),
            hours: diffHours,
            rate: rule.rate || 0,
            cost: periodCost
        });
        totalCost += periodCost;
    }
    return { spot, totalCost, costBreakdown, distance: 0 };
}

// Example test
if (require.main === module) {
    const address = 'Frederiksberg';
    const geocodeResult = geocodeAddress(address);
    const arrival = new Date('2025-06-01T10:00:00');
    const departure = new Date('2025-06-01T14:00:00');
    const spot = parkingData.parking_spots.find(s => s.name === 'Frederiksberg');
    const result = calculateParkingCost(spot, arrival, departure);
    console.log(`Parking at ${spot.name} from ${arrival} to ${departure}`);
    console.log('Total cost:', result.totalCost, 'kr');
    console.log('Breakdown:', result.costBreakdown);
}
