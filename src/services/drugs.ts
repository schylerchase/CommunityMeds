import { supabase, type DrugDetail } from '../lib/supabase';

export interface DrugSearchResult {
  id: string;
  name: string;
  genericName: string | null;
  drugClass: string | null;
  description: string | null;
  availability: string | null;
  hasDetails: boolean;
}

export interface DrugFullDetail {
  id: string;
  name: string;
  genericName: string | null;
  brandNames: string[];
  drugClass: string | null;
  description: string | null;
  uses: string[];
  warnings: string[];
  beforeTaking: string[];
  sideEffects: {
    emergency: string[];
    common: string[];
  };
  dosageNotes: string | null;
  interactionsNote: string | null;
  pregnancyCategory: string | null;
  controlledSubstance: string | null;
  availability: string | null;
  sourceUrl: string | null;
  // Price info if linked to medication
  prices?: {
    pharmacyName: string;
    price: number;
    quantity: number | null;
  }[];
}

/**
 * Search drugs by name
 */
export async function searchDrugs(query: string, limit = 20): Promise<DrugSearchResult[]> {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery || normalizedQuery.length < 2) return [];

  const { data, error } = await supabase
    .from('drug_details')
    .select('id, drug_name, generic_name, drug_class, description, availability')
    .or(`drug_name.ilike.%${normalizedQuery}%,generic_name.ilike.%${normalizedQuery}%`)
    .order('drug_name')
    .limit(limit);

  if (error) {
    console.error('Error searching drugs:', error.message);
    return [];
  }

  return (data as DrugDetail[]).map(drug => ({
    id: drug.id,
    name: drug.drug_name,
    genericName: drug.generic_name,
    drugClass: drug.drug_class,
    description: drug.description,
    availability: drug.availability,
    hasDetails: !!drug.description,
  }));
}

/**
 * Get full drug details by ID
 */
export async function getDrugById(id: string): Promise<DrugFullDetail | null> {
  const { data: drug, error } = await supabase
    .from('drug_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !drug) {
    console.error('Error fetching drug:', error?.message);
    return null;
  }

  const d = drug as DrugDetail;

  // Try to get prices if linked to a medication
  let prices: DrugFullDetail['prices'] = undefined;
  if (d.medication_id) {
    const { data: priceData } = await supabase
      .from('prices')
      .select('pharmacy_name, price, quantity')
      .eq('medication_id', d.medication_id)
      .eq('is_current', true);

    if (priceData && priceData.length > 0) {
      prices = priceData.map(p => ({
        pharmacyName: p.pharmacy_name,
        price: p.price,
        quantity: p.quantity,
      }));
    }
  }

  return {
    id: d.id,
    name: d.drug_name,
    genericName: d.generic_name,
    brandNames: d.brand_names || [],
    drugClass: d.drug_class,
    description: d.description,
    uses: d.uses || [],
    warnings: d.warnings || [],
    beforeTaking: d.before_taking || [],
    sideEffects: {
      emergency: d.side_effects_emergency || [],
      common: d.side_effects_common || [],
    },
    dosageNotes: d.dosage_notes,
    interactionsNote: d.interactions_note,
    pregnancyCategory: d.pregnancy_category,
    controlledSubstance: d.controlled_substance,
    availability: d.availability,
    sourceUrl: d.source_url,
    prices,
  };
}

/**
 * Get drug details by name (case-insensitive)
 */
export async function getDrugByName(name: string): Promise<DrugFullDetail | null> {
  const { data: drug, error } = await supabase
    .from('drug_details')
    .select('*')
    .ilike('drug_name', name)
    .limit(1)
    .single();

  if (error || !drug) {
    // Try partial match
    const { data: partialMatch } = await supabase
      .from('drug_details')
      .select('*')
      .ilike('drug_name', `%${name}%`)
      .limit(1)
      .single();

    if (!partialMatch) return null;
    return getDrugById(partialMatch.id);
  }

  return getDrugById(drug.id);
}

/**
 * Get all drugs with details (paginated)
 */
export async function getDrugsWithDetails(
  page = 1,
  pageSize = 50
): Promise<{ drugs: DrugSearchResult[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('drug_details')
    .select('id, drug_name, generic_name, drug_class, description, availability', { count: 'exact' })
    .not('description', 'is', null)
    .order('drug_name')
    .range(from, to);

  if (error) {
    console.error('Error fetching drugs:', error.message);
    return { drugs: [], total: 0 };
  }

  return {
    drugs: (data as DrugDetail[]).map(drug => ({
      id: drug.id,
      name: drug.drug_name,
      genericName: drug.generic_name,
      drugClass: drug.drug_class,
      description: drug.description,
      availability: drug.availability,
      hasDetails: true,
    })),
    total: count || 0,
  };
}

/**
 * Get drugs by class
 */
export async function getDrugsByClass(drugClass: string): Promise<DrugSearchResult[]> {
  const { data, error } = await supabase
    .from('drug_details')
    .select('id, drug_name, generic_name, drug_class, description, availability')
    .ilike('drug_class', `%${drugClass}%`)
    .not('description', 'is', null)
    .order('drug_name')
    .limit(100);

  if (error) {
    console.error('Error fetching drugs by class:', error.message);
    return [];
  }

  return (data as DrugDetail[]).map(drug => ({
    id: drug.id,
    name: drug.drug_name,
    genericName: drug.generic_name,
    drugClass: drug.drug_class,
    description: drug.description,
    availability: drug.availability,
    hasDetails: true,
  }));
}

/**
 * Get unique drug classes
 */
export async function getDrugClasses(): Promise<string[]> {
  const { data, error } = await supabase
    .from('drug_details')
    .select('drug_class')
    .not('drug_class', 'is', null);

  if (error) {
    console.error('Error fetching drug classes:', error.message);
    return [];
  }

  const classes = [...new Set((data as { drug_class: string }[]).map(d => d.drug_class))];
  return classes.sort();
}
