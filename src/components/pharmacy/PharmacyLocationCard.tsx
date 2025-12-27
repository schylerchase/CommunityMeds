import { Card } from '../ui/Card';
import type { PharmacyLocation } from '../../services/pharmacyLocations';

interface PharmacyLocationCardProps {
  location: PharmacyLocation;
  onClick?: () => void;
}

export function PharmacyLocationCard({ location, onClick }: PharmacyLocationCardProps) {
  const brandColors: Record<string, string> = {
    CVS: 'bg-red-100 text-red-800',
    Walgreens: 'bg-red-100 text-red-800',
    Walmart: 'bg-blue-100 text-blue-800',
    Costco: 'bg-red-100 text-red-800',
    'Rite Aid': 'bg-blue-100 text-blue-800',
    Kroger: 'bg-blue-100 text-blue-800',
    'Kinney Drugs': 'bg-green-100 text-green-800',
    Hannaford: 'bg-orange-100 text-orange-800',
    Shaws: 'bg-purple-100 text-purple-800',
    'Price Chopper': 'bg-green-100 text-green-800',
    Target: 'bg-red-100 text-red-800',
    Independent: 'bg-gray-100 text-gray-800',
  };

  const badgeColor = brandColors[location.brand] || brandColors.Independent;

  // Build full address
  const fullAddress = [
    location.address,
    location.city,
    location.state,
    location.zip,
  ].filter(Boolean).join(', ');

  // Google Maps directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress || `${location.lat},${location.lng}`)}`;

  return (
    <Card hover className="h-full" onClick={onClick}>
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
            {location.name}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${badgeColor}`}>
            {location.brand}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mb-2">
          <svg
            className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
          <div className="text-sm text-gray-600">
            {location.address || location.city ? (
              <>
                {location.address && <p>{location.address}</p>}
                <p>{[location.city, location.state, location.zip].filter(Boolean).join(', ')}</p>
              </>
            ) : (
              <p className="text-gray-400 italic">See map for location</p>
            )}
          </div>
        </div>

        {/* Phone */}
        {location.phone && (
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <a
              href={`tel:${location.phone}`}
              className="text-sm text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {location.phone}
            </a>
          </div>
        )}

        {/* Hours */}
        {location.hours && (
          <div className="flex items-start gap-2 mb-2">
            <svg
              className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-600 line-clamp-2">{location.hours}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 space-y-2">
          <div className="flex gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Directions
            </a>
            {location.phone && (
              <a
                href={`tel:${location.phone}`}
                className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
                title="Call pharmacy"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </a>
            )}
          </div>
          {location.storeLocatorUrl && (
            <a
              href={location.storeLocatorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                />
              </svg>
              {location.brand} Store Locator
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
