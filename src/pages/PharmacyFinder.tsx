import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { searchPharmaciesByZip } from '../services/npi';
import type { Pharmacy } from '../services/npi';
import { useGeolocation } from '../hooks/useGeolocation';
import { PharmacyCard } from '../components/pharmacy/PharmacyCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy load the map component
const PharmacyMap = lazy(() =>
  import('../components/pharmacy/PharmacyMap').then((module) => ({
    default: module.PharmacyMap,
  }))
);

export function PharmacyFinder() {
  const { t } = useTranslation();
  const { latitude, longitude, loading: geoLoading, error: geoError, getLocation } = useGeolocation();
  const [zipCode, setZipCode] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Search by ZIP code
  const handleZipSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!zipCode || zipCode.length < 5) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const results = await searchPharmaciesByZip(zipCode.substring(0, 5));
      setPharmacies(results);
    } catch (err) {
      setError(t('common.error'));
      console.error('Pharmacy search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use geolocation to find nearby pharmacies
  const handleUseLocation = () => {
    getLocation();
  };

  // When we get location, do a reverse geocode and search (simplified for static site)
  useEffect(() => {
    if (latitude && longitude && !loading) {
      // For a static site, we'd need to use a geocoding API
      // For now, we'll just show a message
      setError('Location detected! Please enter your ZIP code to find pharmacies.');
    }
  }, [latitude, longitude, loading]);

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
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="secondary"
            onClick={handleUseLocation}
            loading={geoLoading}
            className="sm:w-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {t('pharmacy.useLocation')}
          </Button>

          <form onSubmit={handleZipSearch} className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder={t('pharmacy.enterZip')}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="flex-1"
            />
            <Button type="submit" loading={loading}>
              {t('pharmacy.search')}
            </Button>
          </form>
        </div>

        {geoError && (
          <p className="text-sm text-red-600 mt-2">{geoError}</p>
        )}
      </div>

      {/* Map */}
      {(searched || pharmacies.length > 0) && (
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <PharmacyMap
              pharmacies={pharmacies}
              center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
            />
          </Suspense>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && pharmacies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {pharmacies.length} pharmacies found
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && searched && pharmacies.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No pharmacies found
          </h2>
          <p className="text-gray-600">Try a different ZIP code</p>
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Find pharmacies near you
          </h2>
          <p className="text-gray-600">Enter your ZIP code or use your location to get started</p>
        </div>
      )}
    </div>
  );
}
