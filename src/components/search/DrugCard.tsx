import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import type { DrugSearchResult } from '../../services/drugSearch';
import { getPriceForDrug, formatPrice } from '../../services/pricing';
import type { DrugPrice } from '../../services/pricing';

interface DrugCardProps {
  drug: DrugSearchResult;
}

export function DrugCard({ drug }: DrugCardProps) {
  const { t } = useTranslation();
  const [priceInfo, setPriceInfo] = useState<DrugPrice | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      let pricing = await getPriceForDrug(drug.brandName);
      if (!pricing) {
        pricing = await getPriceForDrug(drug.genericName);
      }
      setPriceInfo(pricing);
    };
    fetchPrice();
  }, [drug.brandName, drug.genericName]);

  return (
    <Card hover className="h-full">
      <Link to={`/drug/${drug.id}`} className="block h-full">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {drug.brandName}
            </h3>
            {drug.genericName && drug.genericName !== drug.brandName && (
              <p className="text-sm text-gray-500 mb-2">
                {t('drug.genericName')}: {drug.genericName}
              </p>
            )}
            {drug.purpose && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {drug.purpose}
              </p>
            )}
            {drug.manufacturer && (
              <p className="text-xs text-gray-400">
                {drug.manufacturer}
              </p>
            )}
          </div>

          {priceInfo && priceInfo.prices.cash !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{t('drug.cashPrice')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(priceInfo.prices.cash)}
                  </p>
                </div>
                {priceInfo.prices.goodrx !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-green-600">{t('drug.withCoupon')}</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(priceInfo.prices.goodrx)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <span className="inline-flex items-center text-blue-600 text-sm font-medium">
              {t('common.viewAll')}
              <svg
                className="w-4 h-4 ml-1 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
