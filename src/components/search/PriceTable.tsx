import { useTranslation } from 'react-i18next';
import { formatPrice, calculateSavings } from '../../services/pricing';
import type { DrugPrice } from '../../services/pricing';

interface PriceTableProps {
  priceInfo: DrugPrice;
}

export function PriceTable({ priceInfo }: PriceTableProps) {
  const { t } = useTranslation();

  const priceRows = [
    {
      label: t('drug.cashPrice'),
      price: priceInfo.prices.cash,
      highlight: false,
    },
    {
      label: t('drug.withInsurance'),
      price: priceInfo.prices.withInsurance,
      highlight: false,
    },
    ...(priceInfo.prices.goodrx
      ? [{
          label: 'GoodRx Coupon',
          price: priceInfo.prices.goodrx,
          highlight: true,
          savings: calculateSavings(priceInfo.prices.cash, priceInfo.prices.goodrx),
        }]
      : []),
    ...(priceInfo.prices.costco
      ? [{
          label: 'Costco',
          price: priceInfo.prices.costco,
          highlight: true,
          savings: calculateSavings(priceInfo.prices.cash, priceInfo.prices.costco),
        }]
      : []),
    ...(priceInfo.prices.walmart
      ? [{
          label: 'Walmart',
          price: priceInfo.prices.walmart,
          highlight: true,
          savings: calculateSavings(priceInfo.prices.cash, priceInfo.prices.walmart),
        }]
      : []),
  ];

  // Sort by price
  priceRows.sort((a, b) => a.price - b.price);

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
            key={row.label}
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
              {'savings' in row && row.savings && (
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
      </div>
    </div>
  );
}
