import { ParkingData } from '@/types/parking';

export async function loadParkingData(): Promise<ParkingData> {
  try {
    // In a real application, this would load from the YAML file
    // For now, we'll return the data that matches our YAML structure
    const parkingData: ParkingData = {
      parking_spots: [
        {
          name: "København Vesterbro",
          coordinates: [
            { latitude: 55.66519526124639, longitude: 12.54353968489107 },
            { latitude: 55.66531808872339, longitude: 12.53922885081022 }
          ],
          pricing_description: "P-takst dag (kl.08-18): 26 kr./time\nP-takst aften (kl.18-23): 17 kr./time\nP-takst nat (kl.23-08): 6 kr./time\nFørste time gratis fra lørdag kl. 17.00 til mandag kl. 8.00\nHelligdage er gratis (Juleaftensdag og Nytårsdag)",
          pricing_rules: {
            base_rates: {
              "08:00-18:00": 26,
              "18:00-23:00": 17,
              "23:00-08:00": 6
            },
            special_periods: {
              free_first_hour: [
                {
                  period: "saturday_17:00_to_monday_08:00",
                  description: "Lørdag 17:00 til Mandag 08:00"
                }
              ],
              free_periods: [
                {
                  dates: ["12-24", "01-01"],
                  description: "Helligdage (Juleaftensdag og Nytårsdag)"
                }
              ]
            }
          }
        },
        {
          name: "Carlsberg Byen",
          coordinates: [
            { latitude: 55.66675509070274, longitude: 12.536756465807024 }
          ],
          pricing_description: "Timeprisen er pr. påbegyndt time:\nMandag-fredag kl. 00-24: kr. 27\nLørdag-søndag kl. 00-24: kr. 14,50",
          pricing_rules: {
            base_rates: {
              weekdays: {
                "00:00-24:00": 27
              },
              weekends: {
                "00:00-24:00": 14.50
              }
            }
          }
        },
        {
          name: "Frederiksberg",
          coordinates: [
            { latitude: 55.668866103512826, longitude: 12.530515569648486 }
          ],
          pricing_description: "Mandag til Fredag 07:00 til 24:00\nLørdag 07:00 til 17:00\nAndre tider er gratis.\nMaks 110 kr per dag og 550 kr per uge\n1. time: 5 kr, 2. time: 10 kr, 3. time: 15 kr\n4. time: 20 kr, 5. time: 25 kr, 6+ time: 25 kr",
          pricing_rules: {
            hourly_progression: {
              weekdays: {
                active_hours: "07:00-24:00",
                rates: [5, 10, 15, 20, 25, 25],
                max_daily: 110
              },
              saturday: {
                active_hours: "07:00-17:00",
                rates: [5, 10, 15, 20, 25, 25]
              }
            },
            free_periods: [
              {
                times: ["00:00-07:00", "17:00-24:00"],
                days: ["saturday", "sunday"]
              }
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
