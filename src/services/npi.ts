const NPI_BASE_URL = 'https://npiregistry.cms.hhs.gov/api';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  lat?: number;
  lng?: number;
  distance?: number;
  services: string[];
  hours?: string;
}

interface NPIResult {
  number: string;
  basic: {
    organization_name?: string;
    first_name?: string;
    last_name?: string;
  };
  addresses: Array<{
    address_purpose: string;
    address_1: string;
    city: string;
    state: string;
    postal_code: string;
    telephone_number: string;
  }>;
  taxonomies: Array<{
    desc: string;
    primary: boolean;
  }>;
}

export async function searchPharmacies(
  city: string,
  state: string,
  limit = 20
): Promise<Pharmacy[]> {
  try {
    const response = await fetch(
      `${NPI_BASE_URL}/?version=2.1&taxonomy_description=Pharmacy&city=${encodeURIComponent(city)}&state=${state}&limit=${limit}`
    );

    if (!response.ok) throw new Error('Failed to fetch pharmacy data');

    const data = await response.json();

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((result: NPIResult) => {
      const practiceAddress = result.addresses.find(
        (addr) => addr.address_purpose === 'LOCATION'
      ) || result.addresses[0];

      return {
        id: result.number,
        name: result.basic.organization_name ||
              `${result.basic.first_name} ${result.basic.last_name}`.trim() ||
              'Unknown Pharmacy',
        address: practiceAddress.address_1,
        city: practiceAddress.city,
        state: practiceAddress.state,
        zip: practiceAddress.postal_code.substring(0, 5),
        phone: formatPhone(practiceAddress.telephone_number),
        services: extractServices(result.taxonomies),
      };
    });
  } catch (error) {
    console.error('NPI search error:', error);
    return [];
  }
}

export async function searchPharmaciesByZip(
  zip: string,
  limit = 20
): Promise<Pharmacy[]> {
  try {
    const response = await fetch(
      `${NPI_BASE_URL}/?version=2.1&taxonomy_description=Pharmacy&postal_code=${zip}&limit=${limit}`
    );

    if (!response.ok) throw new Error('Failed to fetch pharmacy data');

    const data = await response.json();

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((result: NPIResult) => {
      const practiceAddress = result.addresses.find(
        (addr) => addr.address_purpose === 'LOCATION'
      ) || result.addresses[0];

      return {
        id: result.number,
        name: result.basic.organization_name ||
              `${result.basic.first_name} ${result.basic.last_name}`.trim() ||
              'Unknown Pharmacy',
        address: practiceAddress.address_1,
        city: practiceAddress.city,
        state: practiceAddress.state,
        zip: practiceAddress.postal_code.substring(0, 5),
        phone: formatPhone(practiceAddress.telephone_number),
        services: extractServices(result.taxonomies),
      };
    });
  } catch (error) {
    console.error('NPI search error:', error);
    return [];
  }
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

function extractServices(taxonomies: Array<{ desc: string; primary: boolean }>): string[] {
  const services: string[] = [];
  taxonomies.forEach((tax) => {
    if (tax.desc.toLowerCase().includes('community')) services.push('Community');
    if (tax.desc.toLowerCase().includes('retail')) services.push('Retail');
    if (tax.desc.toLowerCase().includes('mail order')) services.push('Mail Order');
    if (tax.desc.toLowerCase().includes('specialty')) services.push('Specialty');
    if (tax.desc.toLowerCase().includes('compounding')) services.push('Compounding');
  });
  return services.length > 0 ? services : ['Retail'];
}
