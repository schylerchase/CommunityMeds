import { supabase, type DrugDetail } from '../lib/supabase';

const OPENFDA_BASE_URL = 'https://api.fda.gov/drug';

export interface DrugSearchResult {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  purpose: string;
  ndcCodes: string[];
  source: 'supabase' | 'openfda';
}

export interface DrugFullDetails extends DrugSearchResult {
  drugClass: string | null;
  uses: string[];
  warnings: string[];
  beforeTaking: string[];
  sideEffects: {
    emergency: string[];
    common: string[];
  };
  dosageNotes: string | null;
  interactionsNote: string | null;
  availability: string | null;
  controlledSubstance: string | null;
}

// Search Supabase drug_details table
async function searchSupabase(query: string, limit = 20): Promise<DrugSearchResult[]> {
  const { data, error } = await supabase
    .from('drug_details')
    .select('*')
    .or(`drug_name.ilike.%${query}%,generic_name.ilike.%${query}%,brand_names.cs.{${query}}`)
    .limit(limit);

  if (error) {
    console.error('Supabase search error:', error.message);
    return [];
  }

  return (data as DrugDetail[]).map((drug) => ({
    id: drug.id,
    brandName: drug.drug_name,
    genericName: drug.generic_name || drug.drug_name,
    manufacturer: drug.drug_class || 'Unknown',
    purpose: drug.description || drug.uses?.[0] || 'No description available',
    ndcCodes: [],
    source: 'supabase' as const,
  }));
}

// Search OpenFDA with improved query
async function searchOpenFDA(query: string, limit = 10): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    // Clean and prepare the query - use wildcards for partial matching
    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Try multiple search strategies
    const searches = [
      // Wildcard search on brand_name and generic_name
      `${OPENFDA_BASE_URL}/label.json?search=(openfda.brand_name:${cleanQuery}*+OR+openfda.generic_name:${cleanQuery}*)&limit=${limit}`,
      // Fallback: search in brand_name field directly
      `${OPENFDA_BASE_URL}/label.json?search=(brand_name:${cleanQuery}*+OR+generic_name:${cleanQuery}*)&limit=${limit}`,
    ];

    for (const url of searches) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            return data.results.map((result: Record<string, unknown>) => ({
              id: (result.openfda as Record<string, string[]>)?.spl_id?.[0] ||
                  (result as Record<string, string>).id ||
                  Math.random().toString(36).slice(2),
              brandName: (result.brand_name as string[])?.[0] ||
                        (result.openfda as Record<string, string[]>)?.brand_name?.[0] ||
                        'Unknown',
              genericName: (result.generic_name as string[])?.[0] ||
                          (result.openfda as Record<string, string[]>)?.generic_name?.[0] ||
                          'Unknown',
              manufacturer: (result.manufacturer_name as string[])?.[0] ||
                           (result.openfda as Record<string, string[]>)?.manufacturer_name?.[0] ||
                           'Unknown',
              purpose: (result.purpose as string[])?.[0] ||
                      (result.indications_and_usage as string[])?.[0]?.substring(0, 200) ||
                      'No description available',
              ndcCodes: (result.openfda as Record<string, string[]>)?.product_ndc || [],
              source: 'openfda' as const,
            }));
          }
        }
      } catch {
        // Try next search strategy
        continue;
      }
    }

    return [];
  } catch (error) {
    console.error('OpenFDA search error:', error);
    return [];
  }
}

// Combined search - searches both Supabase and OpenFDA
export async function searchDrugs(query: string, limit = 20): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();

  // Search both sources in parallel
  const [supabaseResults, openFdaResults] = await Promise.all([
    searchSupabase(normalizedQuery, limit),
    searchOpenFDA(normalizedQuery, Math.floor(limit / 2)),
  ]);

  // Combine and deduplicate results
  const seen = new Set<string>();
  const combined: DrugSearchResult[] = [];

  // Prioritize Supabase results (our curated data)
  for (const result of supabaseResults) {
    const key = result.brandName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(result);
    }
  }

  // Add OpenFDA results that aren't duplicates
  for (const result of openFdaResults) {
    const key = result.brandName.toLowerCase();
    const genericKey = result.genericName.toLowerCase();
    if (!seen.has(key) && !seen.has(genericKey)) {
      seen.add(key);
      seen.add(genericKey);
      combined.push(result);
    }
  }

  return combined.slice(0, limit);
}

// Get drug by ID (checks Supabase first, then OpenFDA)
export async function getDrugById(id: string): Promise<DrugSearchResult | null> {
  // Try Supabase first
  const { data, error } = await supabase
    .from('drug_details')
    .select('*')
    .eq('id', id)
    .single();

  if (!error && data) {
    const drug = data as DrugDetail;
    return {
      id: drug.id,
      brandName: drug.drug_name,
      genericName: drug.generic_name || drug.drug_name,
      manufacturer: drug.drug_class || 'Unknown',
      purpose: drug.description || drug.uses?.[0] || 'No description available',
      ndcCodes: [],
      source: 'supabase',
    };
  }

  // Fall back to OpenFDA
  try {
    const response = await fetch(
      `${OPENFDA_BASE_URL}/label.json?search=openfda.spl_id:"${id}"&limit=1`
    );

    if (!response.ok) return null;

    const responseData = await response.json();
    if (!responseData.results || responseData.results.length === 0) return null;

    const result = responseData.results[0];
    return {
      id: result.openfda?.spl_id?.[0] || id,
      brandName: result.brand_name?.[0] || 'Unknown',
      genericName: result.generic_name?.[0] || 'Unknown',
      manufacturer: result.manufacturer_name?.[0] || 'Unknown',
      purpose: result.purpose?.[0] || result.indications_and_usage?.[0] || 'No description available',
      ndcCodes: result.openfda?.product_ndc || [],
      source: 'openfda',
    };
  } catch (error) {
    console.error('OpenFDA get drug error:', error);
    return null;
  }
}

// Search by drug name (for pricing lookups)
export async function getDrugByName(name: string): Promise<DrugSearchResult | null> {
  const results = await searchDrugs(name, 1);
  return results[0] || null;
}

// Get full drug details including warnings, side effects, etc.
export async function getFullDrugDetails(id: string): Promise<DrugFullDetails | null> {
  const { data, error } = await supabase
    .from('drug_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    // Return basic info from getDrugById
    const basic = await getDrugById(id);
    if (!basic) return null;

    return {
      ...basic,
      drugClass: null,
      uses: [],
      warnings: [],
      beforeTaking: [],
      sideEffects: { emergency: [], common: [] },
      dosageNotes: null,
      interactionsNote: null,
      availability: null,
      controlledSubstance: null,
    };
  }

  const drug = data as DrugDetail;
  return {
    id: drug.id,
    brandName: drug.drug_name,
    genericName: drug.generic_name || drug.drug_name,
    manufacturer: drug.drug_class || 'Unknown',
    purpose: drug.description || drug.uses?.[0] || 'No description available',
    ndcCodes: [],
    source: 'supabase',
    drugClass: drug.drug_class,
    uses: drug.uses || [],
    warnings: drug.warnings || [],
    beforeTaking: drug.before_taking || [],
    sideEffects: {
      emergency: drug.side_effects_emergency || [],
      common: drug.side_effects_common || [],
    },
    dosageNotes: drug.dosage_notes,
    interactionsNote: drug.interactions_note,
    availability: drug.availability,
    controlledSubstance: drug.controlled_substance,
  };
}
