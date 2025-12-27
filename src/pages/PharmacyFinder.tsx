import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { searchPharmaciesByZip } from '../services/npi';
import type { Pharmacy } from '../services/npi';
import { PharmacyCard } from '../components/pharmacy/PharmacyCard';
import { PharmacyChainCard } from '../components/pharmacy/PharmacyChainCard';
import { pharmacyChains } from '../data/pharmacyChains';
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
  const [zipCode, setZipCode] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Search by ZIP code
  const handleZipSearch = async (zip?: string) => {
    const searchZip = zip || zipCode;
    if (!searchZip || searchZip.length < 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const results = await searchPharmaciesByZip(searchZip.substring(0, 5));
      setPharmacies(results);
      // Don't show error for no results since we always show pharmacy chains
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

  // Use geolocation to find nearby pharmacies
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

      // Reverse geocode to get ZIP
      const geoResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (!geoResponse.ok) {
        throw new Error('Failed to determine location');
      }

      const geoData = await geoResponse.json();
      const detectedZip = geoData.postcode;

      if (detectedZip && /^\d{5}/.test(detectedZip)) {
        const zip = detectedZip.substring(0, 5);
        setZipCode(zip);
        setGeoLoading(false);
        // Search with detected ZIP
        await handleZipSearch(zip);
      } else {
        setError('Could not determine ZIP code from your location. Please enter it manually.');
        setGeoLoading(false);
      }
    } catch (err) {
      console.error('Geolocation error:', err);
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enter your ZIP code manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Please enter your ZIP code manually.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please enter your ZIP code manually.');
            break;
          default:
            setError('Could not get your location. Please enter your ZIP code manually.');
        }
      } else {
        setError('Could not determine your location. Please enter your ZIP code manually.');
      }
      setGeoLoading(false);
    }
  };

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
            disabled={geoLoading || loading}
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
      </div>

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
            {geoLoading ? 'Getting your location...' : t('common.loading')}
          </p>
        </div>
      )}

      {/* Map */}
      {!loading && !geoLoading && pharmacies.length > 0 && (
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
              center={userLocation || undefined}
            />
          </Suspense>
        </div>
      )}

      {/* Featured Pharmacy Chains - Always show when searched or has ZIP */}
      {!loading && !geoLoading && (searched || zipCode.length === 5) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('pharmacy.pharmaciesWithPrices', 'Pharmacies with Price Data')}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {t('pharmacy.pharmaciesWithPricesDesc', 'We have pricing data from these pharmacies. Click to find locations near you.')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacyChains.map((chain) => (
              <PharmacyChainCard
                key={chain.id}
                chain={chain}
                zipCode={zipCode.length === 5 ? zipCode : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Local Pharmacies from NPI */}
      {!loading && !geoLoading && pharmacies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('pharmacy.localPharmacies', 'Local Pharmacies')} ({pharmacies.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && !geoLoading && zipCode.length < 5 && (
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
            {t('pharmacy.findPharmacies', 'Find pharmacies near you')}
          </h2>
          <p className="text-gray-600">
            {t('pharmacy.enterZipToStart', 'Enter your ZIP code or use your location to get started')}
          </p>
        </div>
      )}
    </div>
  );
}
