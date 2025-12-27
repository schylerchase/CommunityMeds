/**
 * Service to find actual pharmacy locations using Overpass API (OpenStreetMap)
 */

export interface PharmacyLocation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  lat: number;
  lng: number;
  hours: string | null;
  website: string | null;
}

// Major pharmacy chain brands to search for
const PHARMACY_BRANDS = [
  { search: 'CVS', brand: 'CVS' },
  { search: 'Walgreens', brand: 'Walgreens' },
  { search: 'Walmart', brand: 'Walmart' },
  { search: 'Costco', brand: 'Costco' },
  { search: 'Rite Aid', brand: 'Rite Aid' },
  { search: 'Kroger', brand: 'Kroger' },
  { search: 'Safeway', brand: 'Safeway' },
  { search: 'Publix', brand: 'Publix' },
];

/**
 * Convert ZIP code to approximate lat/lng using a free geocoding service
 */
async function zipToCoords(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'PublicRx/1.0 (https://publicrx.org)',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Search for pharmacies near a location using Overpass API
 */
export async function searchPharmacyLocations(
  zipCode: string,
  radiusKm: number = 15
): Promise<PharmacyLocation[]> {
  // First convert ZIP to coordinates
  const coords = await zipToCoords(zipCode);
  if (!coords) {
    console.error('Could not geocode ZIP code:', zipCode);
    return [];
  }

  return searchPharmacyLocationsByCoords(coords.lat, coords.lng, radiusKm);
}

/**
 * Search for pharmacies near coordinates using Overpass API
 */
export async function searchPharmacyLocationsByCoords(
  lat: number,
  lng: number,
  radiusKm: number = 15
): Promise<PharmacyLocation[]> {
  const radiusMeters = radiusKm * 1000;

  // Build Overpass query for pharmacies
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="pharmacy"](around:${radiusMeters},${lat},${lng});
      way["healthcare"="pharmacy"](around:${radiusMeters},${lat},${lng});
    );
    out center body;
  `;

  // Try multiple Overpass endpoints for reliability
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  try {
    console.log('Searching pharmacies at:', lat, lng, 'radius:', radiusKm, 'km');

    let response: Response | null = null;
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        response = await fetch(endpoint, {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        if (response.ok) break;
      } catch (e) {
        console.warn('Endpoint failed:', endpoint, e);
      }
    }

    if (!response) {
      console.error('All Overpass endpoints failed');
      return [];
    }

    console.log('Overpass response status:', response.status);
    if (!response.ok) {
      console.error('Overpass API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Overpass found elements:', data.elements?.length || 0);
    const locations: PharmacyLocation[] = [];

    for (const element of data.elements || []) {
      const tags = element.tags || {};
      const name = tags.name || tags.brand || 'Unknown Pharmacy';

      // Get coordinates (for ways, use center)
      const elLat = element.lat || element.center?.lat;
      const elLng = element.lon || element.center?.lon;

      if (!elLat || !elLng) continue;

      // Determine brand
      let brand = 'Independent';
      const nameLower = name.toLowerCase();
      for (const pb of PHARMACY_BRANDS) {
        if (nameLower.includes(pb.search.toLowerCase()) || tags.brand?.toLowerCase().includes(pb.search.toLowerCase())) {
          brand = pb.brand;
          break;
        }
      }

      // Build address
      const address = [
        tags['addr:housenumber'],
        tags['addr:street'],
      ].filter(Boolean).join(' ') || tags['addr:full'] || '';

      const city = tags['addr:city'] || '';
      const state = tags['addr:state'] || '';
      const zip = tags['addr:postcode'] || '';

      // Format hours if available
      let hours: string | null = null;
      if (tags.opening_hours) {
        hours = tags.opening_hours
          .replace(/;/g, ', ')
          .replace(/Mo/g, 'Mon')
          .replace(/Tu/g, 'Tue')
          .replace(/We/g, 'Wed')
          .replace(/Th/g, 'Thu')
          .replace(/Fr/g, 'Fri')
          .replace(/Sa/g, 'Sat')
          .replace(/Su/g, 'Sun');
      }

      locations.push({
        id: `osm-${element.id}`,
        name,
        brand,
        address,
        city,
        state,
        zip,
        phone: tags.phone || tags['contact:phone'] || null,
        lat: elLat,
        lng: elLng,
        hours,
        website: tags.website || tags['contact:website'] || null,
      });
    }

    // Sort by distance from search point
    locations.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2));
      const distB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2));
      return distA - distB;
    });

    return locations.slice(0, 50); // Limit to 50 results
  } catch (error) {
    console.error('Overpass API error:', error);
    return [];
  }
}

/**
 * Filter locations by brand
 */
export function filterByBrand(locations: PharmacyLocation[], brand: string): PharmacyLocation[] {
  if (brand === 'All') return locations;
  return locations.filter(loc => loc.brand === brand);
}
