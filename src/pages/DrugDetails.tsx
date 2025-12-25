import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDrugById } from '../services/openfda';
import type { DrugSearchResult } from '../services/openfda';
import { getPriceForDrug } from '../services/pricing';
import type { DrugPrice } from '../services/pricing';
import { PriceTable } from '../components/search/PriceTable';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';

export function DrugDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [drug, setDrug] = useState<DrugSearchResult | null>(null);
  const [priceInfo, setPriceInfo] = useState<DrugPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDrug = async () => {
      setLoading(true);
      setError(null);
      try {
        const drugData = await getDrugById(id);
        if (drugData) {
          setDrug(drugData);
          // Try to get pricing info
          const pricing = getPriceForDrug(drugData.brandName) || getPriceForDrug(drugData.genericName);
          setPriceInfo(pricing);
        } else {
          setError('Drug not found');
        }
      } catch (err) {
        setError(t('common.error'));
        console.error('Fetch drug error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrug();
  }, [id, t]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !drug) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-red-500 mb-4">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {error || 'Drug not found'}
        </h1>
        <Link to="/search">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/search"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg
          className="w-5 h-5 mr-2 rtl:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {t('common.back')}
      </Link>

      {/* Drug Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {drug.brandName}
            </h1>

            {drug.genericName && drug.genericName !== drug.brandName && (
              <p className="text-lg text-gray-600 mb-4">
                {t('drug.genericName')}: {drug.genericName}
              </p>
            )}

            {drug.manufacturer && (
              <p className="text-sm text-gray-500 mb-6">
                {t('drug.manufacturer')}: {drug.manufacturer}
              </p>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t('drug.description')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {drug.purpose}
              </p>
            </div>

            {/* Assistance Programs */}
            {priceInfo?.assistancePrograms && priceInfo.assistancePrograms.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('drug.assistancePrograms')}
                </h2>
                <div className="space-y-4">
                  {priceInfo.assistancePrograms.map((program) => (
                    <div
                      key={program.name}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <h3 className="font-medium text-green-800 mb-1">
                        {program.name}
                      </h3>
                      <p className="text-sm text-green-700 mb-2">
                        {program.description}
                      </p>
                      <a
                        href={program.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline inline-flex items-center"
                      >
                        {t('common.learnMore')}
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Price Sidebar */}
        <div className="lg:col-span-1">
          {priceInfo ? (
            <div className="sticky top-24">
              <PriceTable priceInfo={priceInfo} />

              <div className="mt-6">
                <Link to="/pharmacies">
                  <Button fullWidth size="lg">
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
                    {t('drug.findPharmacy')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Card className="bg-gray-50">
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
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
                <p className="text-gray-600">{t('common.noData')}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Check GoodRx or your pharmacy for current prices.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
