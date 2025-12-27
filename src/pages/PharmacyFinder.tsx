import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { searchPharmacyLocationsByCoords } from '../services/pharmacyLocations';
import type { PharmacyLocation } from '../services/pharmacyLocations';
import { PharmacyLocationCard } from '../components/pharmacy/PharmacyLocationCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy load the map component
const PharmacyLocationsMap = lazy(() =>
  import('../components/pharmacy/PharmacyLocationsMap').then((module) => ({
    default: module.PharmacyLocationsMap,
  }))
);

// Brand filter options - dynamically populated based on results
const MAJOR_BRANDS = [
  'CVS',
  'Walgreens',
  'Walmart',
  'Costco',
  'Rite Aid',
  'Kroger',
  'Kinney Drugs',
  'Hannaford',
  'Shaws',
  'Independent',
];

export function PharmacyFinder() {
  const { t } = useTranslation();
  const [zipCode, setZipCode] = useState('');
  const [locations, setLocations] = useState<PharmacyLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [brandFilter, setBrandFilter] = useState('All');
  const [searchRadius, setSearchRadius] = useState(25); // miles

  // Search by ZIP code
  const handleZipSearch = async (zip?: string, coords?: { lat: number; lng: number }) => {
    const searchZip = zip || zipCode;

    if (!coords && (!searchZip || searchZip.length < 5)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      let searchCoords = coords;

      // If no coords provided, geocode the ZIP
      if (!searchCoords) {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${searchZip}&country=US&format=json&limit=1`,
          { headers: { 'User-Agent': 'PublicRx/1.0' } }
        );

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData && geoData[0]) {
            searchCoords = {
              lat: parseFloat(geoData[0].lat),
              lng: parseFloat(geoData[0].lon),
            };
            setUserLocation(searchCoords);
          }
        }
      }

      if (!searchCoords) {
        setError('Could not find location for this ZIP code.');
        setLoading(false);
        return;
      }

      // Search for pharmacy locations (convert miles to km for API)
      const radiusKm = searchRadius * 1.60934;
      const results = await searchPharmacyLocationsByCoords(searchCoords.lat, searchCoords.lng, radiusKm);
      setLocations(results);

      if (results.length === 0) {
        setError(`No pharmacies found within ${searchRadius} miles. Try increasing the search radius.`);
      }
    } catch (err) {
      setError('Failed to search pharmacies. Please try again.');
      console.error('Pharmacy search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleZipSearch();
  };

  // Use geolocation
  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGeoLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      // Get ZIP code for display
      const geoResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        if (geoData.postcode) {
          setZipCode(geoData.postcode.substring(0, 5));
        }
      }

      setGeoLoading(false);
      await handleZipSearch(undefined, { lat: latitude, lng: longitude });
    } catch (err) {
      console.error('Geolocation error:', err);
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enter your ZIP code.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Please enter your ZIP code.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please enter your ZIP code.');
            break;
          default:
            setError('Could not get location. Please enter your ZIP code.');
        }
      } else {
        setError('Could not determine your location. Please enter your ZIP code.');
      }
      setGeoLoading(false);
    }
  };

  // Filter locations by brand
  const filteredLocations = brandFilter === 'All'
    ? locations
    : locations.filter((loc) => loc.brand === brandFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('pharmacy.title')}
        </h1>
        <p className="text-gray-600">{t('pharmacy.subtitle')}</p>
      </div>

      {/* Search Controls */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button
            variant="secondary"
            onClick={handleUseLocation}
            loading={geoLoading}
            disabled={geoLoading || loading}
            className="sm:w-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('pharmacy.useLocation')}
          </Button>

          <form onSubmit={handleFormSubmit} className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder={t('pharmacy.enterZip')}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="flex-1"
            />
            <Button type="submit" loading={loading} disabled={loading || geoLoading}>
              {t('pharmacy.search')}
            </Button>
          </form>
        </div>

        {/* Radius Selector */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-600">Search radius:</span>
          <div className="flex gap-1">
            {[10, 25, 50, 100].map((radius) => (
              <button
                key={radius}
                onClick={() => setSearchRadius(radius)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  searchRadius === radius
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {radius} mi
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Toggle & Filters - Show when we have results */}
      {searched && !loading && !geoLoading && locations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Brand Filter - show only brands present in results */}
          <div className="flex flex-wrap gap-2">
            {['All', ...MAJOR_BRANDS.filter(b =>
              b === 'Independent'
                ? locations.some(loc => loc.brand === 'Independent')
                : locations.some(loc => loc.brand === b)
            )].map((brand) => (
              <button
                key={brand}
                onClick={() => setBrandFilter(brand)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  brandFilter === brand
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Map
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && !geoLoading && (
        <div className="text-center py-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {(loading || geoLoading) && (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {geoLoading ? 'Getting your location...' : 'Finding pharmacies near you...'}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !geoLoading && searched && (
        <>
          {/* Results Header */}
          {filteredLocations.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredLocations.length} pharmacies found
                {brandFilter !== 'All' && ` (${brandFilter})`}
              </h2>
            </div>
          )}

          {/* Map View */}
          {viewMode === 'map' && filteredLocations.length > 0 && (
            <div className="mb-8">
              <Suspense
                fallback={
                  <div className="w-full h-[400px] sm:h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                }
              >
                <PharmacyLocationsMap
                  locations={filteredLocations}
                  center={userLocation || undefined}
                />
              </Suspense>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && filteredLocations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((location) => (
                <PharmacyLocationCard key={location.id} location={location} />
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredLocations.length === 0 && !error && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <p className="text-gray-600">
                {brandFilter !== 'All'
                  ? `No ${brandFilter} pharmacies found. Try selecting "All".`
                  : 'No pharmacies found in this area.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!searched && !loading && !geoLoading && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('pharmacy.findPharmacies', 'Find pharmacies near you')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('pharmacy.enterZipToStart', 'Enter your ZIP code or use your location to get started')}
          </p>
          <p className="text-sm text-gray-500">
            Find addresses, hours, and contact info for pharmacies near you
          </p>
        </div>
      )}
    </div>
  );
}
