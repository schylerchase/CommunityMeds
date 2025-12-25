import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Pharmacy } from '../../services/npi';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const { t } = useTranslation();

  const getDirectionsUrl = () => {
    const address = encodeURIComponent(
      `${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state} ${pharmacy.zip}`
    );
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  return (
    <Card className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {pharmacy.name}
          </h3>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
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
              <span>
                {pharmacy.address}<br />
                {pharmacy.city}, {pharmacy.state} {pharmacy.zip}
              </span>
            </p>

            {pharmacy.phone && (
              <p className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href={`tel:${pharmacy.phone.replace(/\D/g, '')}`}
                  className="text-blue-600 hover:underline"
                >
                  {pharmacy.phone}
                </a>
              </p>
            )}

            {pharmacy.distance !== undefined && (
              <p className="flex items-center gap-2 text-gray-500">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                {pharmacy.distance.toFixed(1)} {t('pharmacy.distance')}
              </p>
            )}
          </div>

          {pharmacy.services && pharmacy.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pharmacy.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" fullWidth>
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
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              {t('pharmacy.getDirections')}
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
