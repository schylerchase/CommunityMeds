import { useTranslation } from 'react-i18next';
import { formatPrice, calculateSavings, formatLastUpdated } from '../../services/pricing';
import type { DrugPrice } from '../../services/pricing';

interface PriceTableProps {
  priceInfo: DrugPrice;
}

// Display names for pharmacy keys
const pharmacyLabels: Record<string, string> = {
  cash: 'Cash Price',
  insurance: 'With Insurance',
  goodrx: 'GoodRx Coupon',
  costco: 'Costco',
  walmart: 'Walmart',
  costplus: 'Cost Plus Drugs',
};

export function PriceTable({ priceInfo }: PriceTableProps) {
  const { t } = useTranslation();

  // Build price rows from available prices
  const priceRows = Object.entries(priceInfo.prices)
    .filter(([, price]) => price !== undefined && price !== null)
    .map(([key, price]) => ({
      label: pharmacyLabels[key] || key,
      price: price as number,
      key,
      highlight: !['cash', 'insurance'].includes(key),
      savings: key !== 'cash' && priceInfo.prices.cash
        ? calculateSavings(priceInfo.prices.cash, price as number)
        : undefined,
    }));

  // Sort by price (lowest first)
  priceRows.sort((a, b) => a.price - b.price);

  if (priceRows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-gray-500">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">{t('prices.title')}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {priceInfo.quantity} {priceInfo.unit}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {priceRows.map((row, index) => (
          <div
            key={row.key}
            className={`px-4 py-4 flex items-center justify-between ${
              index === 0 ? 'bg-green-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {index === 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Best Price
                </span>
              )}
              <span className={`font-medium ${index === 0 ? 'text-green-800' : 'text-gray-700'}`}>
                {row.label}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatPrice(row.price)}
              </span>
              {row.savings && row.savings.percentage > 0 && (
                <p className="text-sm text-green-600">
                  {t('drug.savings')} {row.savings.percentage}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">{t('prices.priceVaries')}</p>
        {priceInfo.lastUpdated && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated {formatLastUpdated(priceInfo.lastUpdated)}
          </p>
        )}
      </div>
    </div>
  );
}
