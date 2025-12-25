import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import { Button } from '../components/ui/Button';

const popularDrugs = [
  'Metformin',
  'Lisinopril',
  'Atorvastatin',
  'Omeprazole',
  'Amlodipine',
  'Levothyroxine',
];

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            {t('home.subtitle')}
          </p>
        </div>

        <div className="w-full max-w-2xl px-4">
          <SearchBar autoFocus />
        </div>

        {/* Popular Searches */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">{t('home.popularSearches')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularDrugs.map((drug) => (
              <Link
                key={drug}
                to={`/search?q=${encodeURIComponent(drug)}`}
                className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {drug}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Compare Prices */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Compare Prices
              </h3>
              <p className="text-gray-600">
                See prices with and without insurance, plus discount coupons to find the best deal.
              </p>
            </div>

            {/* Find Pharmacies */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Find Nearby Pharmacies
              </h3>
              <p className="text-gray-600">
                Locate pharmacies near you and get directions to pick up your prescriptions.
              </p>
            </div>

            {/* Get Help */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Patient Assistance
              </h3>
              <p className="text-gray-600">
                Discover programs that can help you get your medications for free or at reduced cost.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/pharmacies">
              <Button size="lg">
                {t('pharmacy.title')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
