import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFullDrugDetails } from '../services/drugSearch';
import type { DrugFullDetails } from '../services/drugSearch';
import { getPriceForDrug } from '../services/pricing';
import type { DrugPrice } from '../services/pricing';
import { getPharmacySearchLinks, getTrustedDrugInfoLinks } from '../utils/pharmacyLinks';
import { getDrugLabel, getDailyMedSearchUrl, type DrugLabelInfo } from '../services/drugImages';
import { PillImages } from '../components/drug/PillImages';
import { PriceTable } from '../components/search/PriceTable';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';

export function DrugDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [drug, setDrug] = useState<DrugFullDetails | null>(null);
  const [priceInfo, setPriceInfo] = useState<DrugPrice | null>(null);
  const [labelInfo, setLabelInfo] = useState<DrugLabelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDrug = async () => {
      setLoading(true);
      setError(null);
      try {
        const drugData = await getFullDrugDetails(id);
        if (drugData) {
          setDrug(drugData);
          // Try to get pricing info from Supabase
          let pricing = await getPriceForDrug(drugData.brandName);
          if (!pricing) {
            pricing = await getPriceForDrug(drugData.genericName);
          }
          setPriceInfo(pricing);

          // Fetch drug label info from DailyMed (non-blocking)
          getDrugLabel(drugData.brandName).then(label => {
            if (label) {
              setLabelInfo(label);
            } else {
              // Try with generic name
              getDrugLabel(drugData.genericName).then(setLabelInfo);
            }
          });
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

            {drug.drugClass && (
              <p className="text-sm text-gray-500 mb-4">
                Drug Class: {drug.drugClass}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {drug.availability && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  drug.availability === 'OTC'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {drug.availability}
                </span>
              )}
              {drug.controlledSubstance && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {drug.controlledSubstance}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t('drug.description')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {drug.purpose}
              </p>
            </div>

            {/* Uses */}
            {drug.uses && drug.uses.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Uses
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {drug.uses.map((use, index) => (
                    <li key={index}>{use}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {drug.warnings && drug.warnings.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Warnings
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2 text-red-800">
                    {drug.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Side Effects */}
            {(drug.sideEffects.emergency.length > 0 || drug.sideEffects.common.length > 0) && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Side Effects
                </h2>

                {drug.sideEffects.emergency.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-red-700 mb-2">Seek immediate medical attention:</h3>
                    <ul className="list-disc list-inside space-y-1 text-red-700 bg-red-50 p-3 rounded-lg">
                      {drug.sideEffects.emergency.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {drug.sideEffects.common.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Common side effects:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {drug.sideEffects.common.slice(0, 10).map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Before Taking */}
            {drug.beforeTaking && drug.beforeTaking.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Before Taking This Medication
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {drug.beforeTaking.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dosage Notes */}
            {drug.dosageNotes && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Dosage Information
                </h2>
                <p className="text-gray-700">{drug.dosageNotes}</p>
              </div>
            )}

            {/* Drug Interactions */}
            {drug.interactionsNote && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-orange-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Drug Interactions
                </h2>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800">{drug.interactionsNote}</p>
                </div>
              </div>
            )}

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
          <div className="sticky top-24 space-y-6">
            {priceInfo ? (
              <PriceTable priceInfo={priceInfo} />
            ) : (
              <Card className="bg-gray-50">
                <div className="text-center py-6">
                  <svg
                    className="w-10 h-10 mx-auto text-gray-400 mb-3"
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
                  <p className="text-gray-600 text-sm">Compare prices at pharmacies below</p>
                </div>
              </Card>
            )}

            {/* Pill Images */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pill Identification
              </h3>
              <PillImages drugName={drug.genericName || drug.brandName} ndcCodes={drug.ndcCodes} />
            </Card>

            {/* Drug Label from DailyMed */}
            {labelInfo && (
              <Card className="bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Official Drug Label
                </h3>
                <p className="text-xs text-amber-700 mb-3">
                  From {labelInfo.labelerName}
                </p>
                {labelInfo.imageUrl && (
                  <img
                    src={labelInfo.imageUrl}
                    alt={`${drug.brandName} label`}
                    className="w-full rounded-lg mb-3 border border-amber-200"
                  />
                )}
                <a
                  href={labelInfo.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  View Full Drug Label
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </Card>
            )}

            {/* Shop at Pharmacies - Direct Links */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                Shop for {drug.brandName}
              </h3>
              <div className="space-y-2">
                {getPharmacySearchLinks(drug.brandName).slice(0, 6).map((link) => (
                  <a
                    key={link.pharmacyName}
                    href={link.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {link.pharmacyName}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </Card>

            {/* Official Drug Info Links */}
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Official Drug Info
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                Verified information from government sources
              </p>
              <div className="space-y-2">
                {getTrustedDrugInfoLinks(drug.brandName).map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-blue-800">
                      {link.name}
                    </span>
                    <p className="text-xs text-blue-600 mt-0.5">
                      {link.description}
                    </p>
                  </a>
                ))}
              </div>
            </Card>

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
      </div>
    </div>
  );
}
