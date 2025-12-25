# CommunityMeds

A community-driven web app to help people find affordable medications, compare prices, and locate nearby pharmacies. Designed for users of all ages and tech comfort levels, with support for multiple languages.

## Features

- **Medication Search** - Search drugs by brand or generic name with autocomplete
- **Price Comparison** - Compare prices: cash, with insurance, and discount programs (GoodRx, Costco, Walmart)
- **Pharmacy Locator** - Find pharmacies near you with an interactive map
- **Patient Assistance Programs** - Links to manufacturer and government assistance programs
- **Multilingual** - Available in 6 languages: English, Spanish, Chinese, Tagalog, Vietnamese, Arabic (with RTL support)
- **Accessibility First** - Large text mode, high contrast mode, keyboard navigation, screen reader optimized

## Tech Stack

- **React 18** + TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **React Router** for navigation
- **react-i18next** for internationalization
- **Leaflet** + OpenStreetMap for maps
- **OpenFDA API** for drug information
- **NPI Registry API** for pharmacy data

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for GitHub Pages deployment. On push to `main`, the GitHub Actions workflow will automatically build and deploy the site.

### Manual Deployment

1. Push to GitHub
2. Go to Settings > Pages
3. Set source to "GitHub Actions"
4. The workflow will run automatically

## Project Structure

```
src/
├── components/
│   ├── layout/      # Header, Footer, LanguageSelector
│   ├── pharmacy/    # PharmacyMap, PharmacyCard
│   ├── search/      # SearchBar, DrugCard, PriceTable
│   └── ui/          # Button, Input, Card, etc.
├── pages/           # Home, SearchResults, DrugDetails, PharmacyFinder
├── hooks/           # useAccessibility, useGeolocation, useLocalStorage
├── services/        # API clients (OpenFDA, NPI, pricing)
├── i18n/            # Translations for 6 languages
└── data/            # Curated pricing data
```

## Data Sources

- **OpenFDA API** - Drug names, NDC codes, manufacturer info
- **NPI Registry API** - Pharmacy locations and details
- **Curated pricing data** - Sample pricing for common medications

## Contributing

Pricing data can be updated in `src/data/pricing.json`. Add new drugs or update prices as needed.

## License

Free for community use.
