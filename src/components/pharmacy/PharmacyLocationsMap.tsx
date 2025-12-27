import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PharmacyLocation } from '../../services/pharmacyLocations';

// Fix for default marker icons in Leaflet with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface PharmacyLocationsMapProps {
  locations: PharmacyLocation[];
  center?: { lat: number; lng: number };
  onLocationClick?: (location: PharmacyLocation) => void;
}

export function PharmacyLocationsMap({ locations, center, onLocationClick }: PharmacyLocationsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] = center
      ? [center.lat, center.lng]
      : [39.8283, -98.5795]; // Center of US

    const map = L.map(mapRef.current).setView(defaultCenter, center ? 12 : 4);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Invalidate size after a short delay to ensure container is visible
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center?.lat, center?.lng]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    const bounds: L.LatLngBounds | null = locations.length > 0 ? L.latLngBounds([]) : null;

    locations.forEach((location) => {
      if (location.lat && location.lng) {
        // Build popup content
        const fullAddress = [location.address, location.city, location.state, location.zip]
          .filter(Boolean)
          .join(', ');

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress || `${location.lat},${location.lng}`)}`;

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <strong class="block text-sm mb-1">${location.name}</strong>
            <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 mb-2">${location.brand}</span>
            ${location.address ? `<p class="text-xs text-gray-600 mb-1">${location.address}</p>` : ''}
            ${location.city ? `<p class="text-xs text-gray-600 mb-1">${location.city}, ${location.state} ${location.zip}</p>` : ''}
            ${location.phone ? `<p class="text-xs mb-1"><a href="tel:${location.phone}" class="text-blue-600 hover:underline">${location.phone}</a></p>` : ''}
            ${location.hours ? `<p class="text-xs text-gray-500 mb-2">${location.hours}</p>` : ''}
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
               class="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 mt-1">
              Get Directions
            </a>
          </div>
        `;

        const marker = L.marker([location.lat, location.lng])
          .addTo(mapInstanceRef.current!)
          .bindPopup(popupContent, { maxWidth: 280 });

        if (onLocationClick) {
          marker.on('click', () => onLocationClick(location));
        }

        markersRef.current.push(marker);
        bounds?.extend([location.lat, location.lng]);
      }
    });

    // Fit map to bounds if we have locations
    if (bounds && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 12);
    }
  }, [locations, center, onLocationClick]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 12);
    }
  }, [center]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[350px] sm:h-[450px] lg:h-[500px] rounded-xl border border-gray-200 z-0"
      role="application"
      aria-label="Pharmacy locations map"
    />
  );
}
