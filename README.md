# ParkInCPH 🅿️

A modern web application to find and compare parking options in Copenhagen based on location, time, and cost.

## Features

- **Address Input**: Enter any Copenhagen address to find nearby parking
- **Smart Search**: Finds parking spots within 1km radius of your location
- **Time-Based Pricing**: Calculates accurate costs based on arrival and departure times
- **Cost Comparison**: Shows parking options sorted by price
- **Detailed Breakdown**: View exact cost calculations for each time period
- **Modern UI**: Sleek, glass-morphism design with responsive layout

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass-morphism effects
- **Deployment**: GitHub Pages with GitHub Actions
- **Data**: YAML-based parking spot database

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/ParkInCPH.git
cd ParkInCPH
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `out` folder, ready for deployment to GitHub Pages.

## Parking Data

The application uses a YAML file (`data/parking_spots.yaml`) containing:

- Parking spot names and coordinates
- Complex pricing schemas (hourly rates, daily maximums, time-based rules)
- Support for weekday/weekend/time-specific pricing

### Example Parking Spot Data

```yaml
- name: "København Vesterbro"
  coordinates:
    - latitude: 55.66519526124639
      longitude: 12.54353968489107
  pricing_standardized:
    weekdays:
      - times: "08:00-18:00"
        rate: 16
        currency: kr
```

## How It Works

1. **Address Input**: User enters a Copenhagen address
2. **Geocoding**: Address is converted to GPS coordinates (mock implementation)
3. **Proximity Search**: Finds all parking spots within 1km radius
4. **Cost Calculation**: Calculates parking cost based on:
   - Day of week (weekday/weekend)
   - Time of day
   - Duration
   - Special pricing rules (hourly rates, daily maximums)
5. **Results Display**: Shows sorted results with detailed cost breakdowns

## Deployment

The project is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is available at `https://your-username.github.io/ParkInCPH/`

## Future Enhancements

- **Map Integration**: Add interactive map with Leaflet.js
- **Real Geocoding**: Integrate with proper geocoding service
- **Live Data**: Connect to real parking APIs
- **User Preferences**: Save favorite locations and preferences
- **Mobile App**: React Native version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Parking data based on Copenhagen municipal parking information
- UI inspired by modern glass-morphism design trends
- Built with Next.js and TypeScript for type safety and performance
