import { ParkingData } from '@/types/parking';

export async function loadParkingData(): Promise<ParkingData> {
  try {
    // In a real application, this would load from the YAML file
    // For now, we'll embed the data directly
    const parkingData: ParkingData = {
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
    
    return parkingData;
  } catch (error) {
    console.error('Error loading parking data:', error);
    throw new Error('Failed to load parking data');
  }
}
