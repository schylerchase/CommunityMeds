const BASE_URL = 'https://api.fda.gov/drug';

export interface DrugLabel {
  id: string;
  brand_name: string[];
  generic_name: string[];
  manufacturer_name: string[];
  purpose: string[];
  indications_and_usage: string[];
  warnings: string[];
  dosage_and_administration: string[];
  openfda: {
    product_ndc: string[];
    rxcui: string[];
    spl_id: string[];
  };
}

export interface DrugSearchResult {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  purpose: string;
  ndcCodes: string[];
}

export async function searchDrugs(query: string, limit = 10): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const searchTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const response = await fetch(
      `${BASE_URL}/label.json?search=(brand_name:"${searchTerms}"+OR+generic_name:"${searchTerms}")&limit=${limit}`
    );

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error('Failed to fetch drug data');
    }

    const data = await response.json();

    return data.results.map((result: DrugLabel) => ({
      id: result.openfda?.spl_id?.[0] || result.id || Math.random().toString(36).slice(2),
      brandName: result.brand_name?.[0] || 'Unknown',
      genericName: result.generic_name?.[0] || 'Unknown',
      manufacturer: result.manufacturer_name?.[0] || 'Unknown',
      purpose: result.purpose?.[0] || result.indications_and_usage?.[0]?.substring(0, 200) || 'No description available',
      ndcCodes: result.openfda?.product_ndc || [],
    }));
  } catch (error) {
    console.error('OpenFDA search error:', error);
    return [];
  }
}

export async function getDrugById(id: string): Promise<DrugSearchResult | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/label.json?search=openfda.spl_id:"${id}"&limit=1`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const result = data.results[0];
    return {
      id: result.openfda?.spl_id?.[0] || id,
      brandName: result.brand_name?.[0] || 'Unknown',
      genericName: result.generic_name?.[0] || 'Unknown',
      manufacturer: result.manufacturer_name?.[0] || 'Unknown',
      purpose: result.purpose?.[0] || result.indications_and_usage?.[0] || 'No description available',
      ndcCodes: result.openfda?.product_ndc || [],
    };
  } catch (error) {
    console.error('OpenFDA get drug error:', error);
    return null;
  }
}
