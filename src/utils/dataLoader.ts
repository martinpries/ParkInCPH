import { ParkingData } from '@/types/parking';

export async function loadParkingData(): Promise<ParkingData> {
  try {
    // In a real application, this would load from the YAML file
    // For now, we'll return the data that matches our YAML structure with area types
    const parkingData: ParkingData = {
      parking_spots: [        {
          name: "Vesterbro (Syd for Enghaveparken)",
          area_type: "polygon",
          polygon_coordinates: [
            { latitude: 55.66657874530429, longitude: 12.53916357748436 },
            { latitude: 55.66601830581306, longitude: 12.543367549621143 },
            { latitude: 55.66528541130379, longitude: 12.548316771288006 },
            { latitude: 55.66489740277168, longitude: 12.548469642999724 },
            { latitude: 55.66348545034776, longitude: 12.542221011759416 },
            { latitude: 55.66369024049546, longitude: 12.537806841062633 }
          ],
          pricing_description: "P-takst dag (kl.08-18): 26 kr./time\nP-takst aften (kl.18-23): 17 kr./time\nP-takst nat (kl.23-08): 6 kr./time\nFørste time gratis fra lørdag kl. 17.00 til mandag kl. 8.00\nHelligdage er gratis (Juleaftensdag og Nytårsdag)",
          pricing_rules: {
            billing_method: "per_minute",
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
        },        {
          name: "Carlsberg Byen",
          area_type: "polygon",
          polygon_coordinates: [
            { latitude: 55.66757526962066, longitude: 12.530455640504195 },
            { latitude: 55.66843125512814, longitude: 12.534772326693917 },
            { latitude: 55.667052775783056, longitude: 12.536290065664057 },
            { latitude: 55.666585860479536, longitude: 12.538793349420004 },
            { latitude: 55.66391766611661, longitude: 12.537137634177155 },
            { latitude: 55.66368419045506, longitude: 12.534870881143705 },
            { latitude: 55.6649293778716, longitude: 12.534634350395114 },
            { latitude: 55.66510725855417, longitude: 12.52931240855176 },
            { latitude: 55.667152828324305, longitude: 12.528267731048214 }
          ],
          pricing_description: "Timeprisen er pr. påbegyndt time:\nMandag-fredag kl. 00-24: kr. 27\nLørdag-søndag kl. 00-24: kr. 14,50",
          pricing_rules: {
            billing_method: "per_minute",
            base_rates: {
              weekdays: {
                "00:00-24:00": 27
              },
              weekends: {
                "00:00-24:00": 14.50
              }            }
          }
        },
        {
          name: "Humlebyen",
          area_type: "polygon",
          polygon_coordinates: [
            { latitude: 55.66832008925163, longitude: 12.536073245833675 },
            { latitude: 55.668308972645356, longitude: 12.536033824042244 },
            { latitude: 55.66922052387152, longitude: 12.539838026915454 },
            { latitude: 55.66822003968152, longitude: 12.539956292289753 },
            { latitude: 55.667686437653956, longitude: 12.538064046301004 },
            { latitude: 55.66681790926319, longitude: 12.53787432185593 },
            { latitude: 55.666880478421966, longitude: 12.537381266510387 },
            { latitude: 55.66760349255506, longitude: 12.53752918311405 }
          ],
          pricing_description: "P-takst dag (kl.08-18): 26 kr./time\nP-takst aften (kl.18-23): 17 kr./time\nP-takst nat (kl.23-08): 6 kr./time\nFørste time gratis fra lørdag kl. 17.00 til mandag kl. 8.00\nHelligdage er gratis (Juleaftensdag og Nytårsdag)",
          pricing_rules: {
            billing_method: "per_minute",
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
            }          }
        },
        {
          name: "Vesterbro Nord",
          area_type: "polygon",
          polygon_coordinates: [
            { latitude: 55.66784682158415, longitude: 12.529708232855512 },
            { latitude: 55.66749326188485, longitude: 12.530075191501234 },
            { latitude: 55.66691548672035, longitude: 12.527032492730442 },
            { latitude: 55.664043731315786, longitude: 12.528301558046438 },
            { latitude: 55.66397473761514, longitude: 12.521635142601433 },
            { latitude: 55.66653604763404, longitude: 12.521833911860423 }
          ],
          pricing_description: "P-takst dag (kl.08-18): 26 kr./time\nP-takst aften (kl.18-23): 17 kr./time\nP-takst nat (kl.23-08): 6 kr./time\nFørste time gratis fra lørdag kl. 17.00 til mandag kl. 8.00\nHelligdage er gratis (Juleaftensdag og Nytårsdag)",
          pricing_rules: {
            billing_method: "per_minute",
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
          name: "Frederiksberg (Pile Allé, Vesterbrogade, Rahbeks Allé)",
          area_type: "polygon",
          polygon_coordinates: [
            { latitude: 55.67018253538501, longitude: 12.538155141102894 },
            { latitude: 55.67085038622165, longitude: 12.531176047031677 },
            { latitude: 55.66809876750859, longitude: 12.530560244568413 }
          ],
          pricing_description: "Mandag til Fredag 07:00 til 24:00\nLørdag 07:00 til 17:00\nAndre tider er gratis.\nMaks 110 kr per dag og 550 kr per uge\n1. time: 5 kr, 2. time: 10 kr, 3. time: 15 kr\n4. time: 20 kr, 5. time: 25 kr, 6+ time: 25 kr",
          pricing_rules: {
            billing_method: "per_minute",
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
