import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pharmacy } from '../../services/npi';

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

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  center?: { lat: number; lng: number };
  onPharmacyClick?: (pharmacy: Pharmacy) => void;
}

export function PharmacyMap({ pharmacies, center, onPharmacyClick }: PharmacyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter: [number, number] = center
      ? [center.lat, center.lng]
      : [39.8283, -98.5795]; // Center of US

    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, center ? 12 : 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    const bounds: L.LatLngBounds | null = pharmacies.length > 0 ? L.latLngBounds([]) : null;

    pharmacies.forEach((pharmacy) => {
      if (pharmacy.lat && pharmacy.lng) {
        const marker = L.marker([pharmacy.lat, pharmacy.lng])
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
            <div class="p-2">
              <strong class="block text-sm">${pharmacy.name}</strong>
              <span class="text-xs text-gray-600">${pharmacy.address}</span>
              <br />
              <span class="text-xs text-gray-600">${pharmacy.city}, ${pharmacy.state} ${pharmacy.zip}</span>
              ${pharmacy.phone ? `<br /><a href="tel:${pharmacy.phone}" class="text-xs text-blue-600">${pharmacy.phone}</a>` : ''}
            </div>
          `);

        if (onPharmacyClick) {
          marker.on('click', () => onPharmacyClick(pharmacy));
        }

        markersRef.current.push(marker);
        bounds?.extend([pharmacy.lat, pharmacy.lng]);
      }
    });

    // Fit map to bounds if we have pharmacies
    if (bounds && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 12);
    }
  }, [pharmacies, center, onPharmacyClick]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 12);
    }
  }, [center]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl border border-gray-200 z-0"
      role="application"
      aria-label="Pharmacy locations map"
    />
  );
}
