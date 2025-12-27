import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import type { PharmacyChain } from '../../data/pharmacyChains';

interface PharmacyChainCardProps {
  chain: PharmacyChain;
  zipCode?: string;
}

export function PharmacyChainCard({ chain, zipCode }: PharmacyChainCardProps) {
  const { t } = useTranslation();

  const storeLocatorUrl = zipCode
    ? chain.getStoreLocatorWithZip(zipCode)
    : chain.storeLocatorUrl;

  const priceTypeColors = {
    discount: 'bg-green-100 text-green-800',
    retail: 'bg-blue-100 text-blue-800',
    membership: 'bg-purple-100 text-purple-800',
  };

  const priceTypeLabels = {
    discount: t('pharmacy.discountPricing', 'Discount Pricing'),
    retail: t('pharmacy.retailPricing', 'Retail Pricing'),
    membership: t('pharmacy.membershipPricing', 'Membership Pricing'),
  };

  return (
    <Card hover className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{chain.name}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${priceTypeColors[chain.priceType]}`}
            >
              {priceTypeLabels[chain.priceType]}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{chain.description}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {chain.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <a
          href={storeLocatorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {chain.id === 'costplus' ? (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t('pharmacy.shopOnline', 'Shop Online')}
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
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
              {t('pharmacy.findStore', 'Find Store')}
            </>
          )}
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
    </Card>
  );
}
