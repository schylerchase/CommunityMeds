import { supabase, type DrugDetail } from '../lib/supabase';
import { formatDrugName, formatSentence, toTitleCase, cleanFDAText, cleanFDAList } from '../utils/textFormatting';

const OPENFDA_BASE_URL = 'https://api.fda.gov/drug';

export interface DrugSearchResult {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  purpose: string;
  ndcCodes: string[];
  source: 'supabase' | 'openfda';
  canonicalKey?: string; // Used for grouping related medications
}

// Normalize generic name for deduplication
// This groups medications with the same active ingredient(s)
function normalizeGenericName(name: string): string {
  if (!name) return '';

  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()
    // Remove parenthetical content (often contains salt form or strength)
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    // Remove common salt forms and suffixes that don't change the medication identity
    .replace(/\s*(HYDROCHLORIDE|HCL|SULFATE|SODIUM|POTASSIUM|ACETATE|TARTRATE|MALEATE|FUMARATE|SUCCINATE|MESYLATE|BESYLATE|CITRATE|PHOSPHATE|NITRATE|BROMIDE|CHLORIDE|MONOHYDRATE|DIHYDRATE|TRIHYDRATE|ANHYDROUS|CALCIUM|MAGNESIUM|ZINC|OXIDE|CARBONATE)(\s+|$)/gi, ' ')
    // Remove formulation markers - only as whole words
    .replace(/\s*(USP|BP|NF|EP|ER|XR|CR|SR|DR|IR|LA|EC|ODT|XL|CD|PM|AM|PLUS|EXTRA|STRENGTH|FORMULA|MAXIMUM|REGULAR|ADVANCED)(\s+|$)/gi, ' ')
    // Remove dosage/strength info (e.g., "500 MG", "10MG", "0.5%")
    .replace(/\s*\d+\.?\d*\s*(MG|MCG|UG|G|GR|ML|L|%|IU|UNITS?)(\s+|$)/gi, ' ')
    // Remove common dosage form descriptors
    .replace(/\s*(TABLETS?|CAPSULES?|PILLS?|ORAL|INJECTION|SOLUTION|SUSPENSION|SYRUP|CREAM|OINTMENT|GEL|PATCH|SPRAY|DROPS?|POWDER|GRANULES?)(\s+|$)/gi, ' ')
    // Remove quantity descriptors
    .replace(/\s*\d+\s*(COUNT|CT|PACK|PK|BOX|BOTTLE|VIAL)S?(\s+|$)/gi, ' ')
    // Clean up multiple spaces and trim
    .replace(/\s+/g, ' ')
    .trim();
}

// Create a canonical key for a drug based on its generic name
function createCanonicalKey(genericName: string, brandName: string): string {
  const normalizedGeneric = normalizeGenericName(genericName);
  // If generic name is too short or empty, use brand name
  if (normalizedGeneric.length < 3) {
    return brandName.toUpperCase().trim();
  }
  return normalizedGeneric;
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

// Search Supabase - combines drug_details with medications table
async function searchSupabase(query: string, limit = 20): Promise<DrugSearchResult[]> {
  try {
    // First search drug_details with joined medication data
    const { data: detailsData, error: detailsError } = await supabase
      .from('drug_details')
      .select(`
        *,
        medications:medication_id (
          name,
          generic_name,
          quantity,
          unit
        )
      `)
      .or(`drug_name.ilike.%${query}%,generic_name.ilike.%${query}%`)
      .limit(limit * 2);

    if (detailsError) {
      console.error('Supabase drug_details search error:', detailsError.message);
    }

    // Also search medications table directly for better coverage
    const { data: medsData, error: medsError } = await supabase
      .from('medications')
      .select('*')
      .or(`name.ilike.%${query}%,generic_name.ilike.%${query}%`)
      .limit(limit * 2);

    if (medsError) {
      console.error('Supabase medications search error:', medsError.message);
    }

    const results: DrugSearchResult[] = [];
    const seenCanonical = new Set<string>();
    const seenBrands = new Set<string>();

    // Process drug_details results
    if (detailsData) {
      for (const drug of detailsData as (DrugDetail & { medications?: { name: string; generic_name: string; quantity: number; unit: string } })[]) {
        const brandKey = drug.drug_name.toLowerCase();
        if (seenBrands.has(brandKey)) continue;

        const genericName = drug.generic_name || drug.medications?.generic_name || drug.drug_name;
        const canonicalKey = createCanonicalKey(genericName, drug.drug_name);

        if (seenCanonical.has(canonicalKey)) continue;

        seenBrands.add(brandKey);
        seenCanonical.add(canonicalKey);

        const description = drug.description || drug.uses?.[0];

        results.push({
          id: drug.id,
          brandName: formatDrugName(drug.drug_name),
          genericName: formatDrugName(genericName),
          manufacturer: toTitleCase(drug.drug_class || ''),
          purpose: description ? formatSentence(description) : `Generic: ${formatDrugName(genericName)}`,
          ndcCodes: [],
          source: 'supabase' as const,
          canonicalKey,
        });
      }
    }

    // Add medications that weren't in drug_details
    if (medsData) {
      for (const med of medsData as { id: string; name: string; generic_name: string; quantity: number; unit: string }[]) {
        const brandKey = med.name.toLowerCase();
        if (seenBrands.has(brandKey)) continue;

        const genericName = med.generic_name || med.name;
        const canonicalKey = createCanonicalKey(genericName, med.name);

        if (seenCanonical.has(canonicalKey)) continue;

        seenBrands.add(brandKey);
        seenCanonical.add(canonicalKey);

        results.push({
          id: med.id,
          brandName: formatDrugName(med.name),
          genericName: formatDrugName(genericName),
          manufacturer: '',
          purpose: med.generic_name ? `Generic: ${formatDrugName(med.generic_name)}` : '',
          ndcCodes: [],
          source: 'supabase' as const,
          canonicalKey,
        });
      }
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error('searchSupabase error:', error);
    return [];
  }
}

// Helper to extract drug name from spl_product_data_elements (fallback)
function extractNameFromSplData(splData: string | undefined): string | null {
  if (!splData) return null;
  // The first part before any ingredient names is usually the brand name
  const parts = splData.split(/\s+/);
  // Take first 1-3 words as potential brand name
  const potentialName = parts.slice(0, 3).join(' ');
  // Filter out generic chemical names
  if (potentialName.length > 3 && !/^[A-Z]+$/.test(potentialName)) {
    return potentialName;
  }
  return null;
}

// Helper to parse OpenFDA results
function parseOpenFDAResults(results: Record<string, unknown>[]): DrugSearchResult[] {
  const parsed = results.map((result: Record<string, unknown>) => {
      const openfda = result.openfda as Record<string, string[]> | undefined;

      // Try multiple sources for brand name
      let brandNameRaw = openfda?.brand_name?.[0] ||
                (result.brand_name as string[])?.[0];

      // Fallback: extract from spl_product_data_elements
      if (!brandNameRaw || brandNameRaw === 'Unknown') {
        const splData = (result.spl_product_data_elements as string[])?.[0];
        brandNameRaw = extractNameFromSplData(splData) || 'Unknown';
      }

      const genericNameRaw = openfda?.generic_name?.[0] ||
                (result.generic_name as string[])?.[0] ||
                openfda?.substance_name?.[0] ||
                brandNameRaw; // Use brand name as fallback

      const manufacturerRaw = openfda?.manufacturer_name?.[0] ||
                (result.manufacturer_name as string[])?.[0] ||
                openfda?.labeler_name?.[0] ||
                '';

      const purposeRaw = (result.purpose as string[])?.[0] ||
              (result.indications_and_usage as string[])?.[0]?.substring(0, 200) ||
              '';

      // Use spl_id or set_id as the unique identifier - skip results without valid IDs
      const drugId = openfda?.spl_id?.[0] || (result.set_id as string);
      if (!drugId) return null;

      // Skip results where we couldn't extract a proper name
      if (brandNameRaw === 'Unknown' && genericNameRaw === 'Unknown') return null;

      // Clean the purpose text from FDA formatting artifacts
      const cleanPurpose = cleanFDAText(purposeRaw);

      return {
        id: drugId,
        brandName: formatDrugName(brandNameRaw),
        genericName: formatDrugName(genericNameRaw),
        manufacturer: toTitleCase(manufacturerRaw),
        purpose: cleanPurpose || `Generic: ${formatDrugName(genericNameRaw)}`,
        ndcCodes: openfda?.product_ndc || [],
        source: 'openfda' as const,
      };
    });

  return parsed.filter((r): r is NonNullable<typeof r> => r !== null) as DrugSearchResult[];
}

// Search OpenFDA with multiple strategies
async function searchOpenFDA(query: string, limit = 15): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];

  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  // Add wildcard for partial matching
  const wildcardQuery = `${cleanQuery}*`;

  // Try multiple search strategies in order of reliability
  const searchStrategies = [
    // Strategy 1: Search brand_name with wildcard (most common)
    `${OPENFDA_BASE_URL}/label.json?search=openfda.brand_name:${wildcardQuery}&limit=${limit}`,
    // Strategy 2: Search generic_name with wildcard
    `${OPENFDA_BASE_URL}/label.json?search=openfda.generic_name:${wildcardQuery}&limit=${limit}`,
    // Strategy 3: Search substance_name with wildcard (active ingredient)
    `${OPENFDA_BASE_URL}/label.json?search=openfda.substance_name:${wildcardQuery}&limit=${limit}`,
  ];

  for (const url of searchStrategies) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return parseOpenFDAResults(data.results);
        }
      }
    } catch {
      // Try next strategy
      continue;
    }
  }

  return [];
}

// Combined search - searches both Supabase and OpenFDA in parallel
export async function searchDrugs(query: string, limit = 20): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();

  // Search both sources in parallel for speed
  const [supabaseResults, openFdaResults] = await Promise.all([
    searchSupabase(normalizedQuery, limit),
    searchOpenFDA(normalizedQuery, limit),
  ]);

  // Combine and deduplicate results using canonical keys
  const seenCanonical = new Set<string>();
  const seenBrands = new Set<string>();
  const combined: DrugSearchResult[] = [];

  // Prioritize Supabase results (our curated data)
  for (const result of supabaseResults) {
    const brandKey = result.brandName.toLowerCase();
    const canonicalKey = result.canonicalKey || createCanonicalKey(result.genericName, result.brandName);

    if (!seenBrands.has(brandKey) && !seenCanonical.has(canonicalKey)) {
      seenBrands.add(brandKey);
      seenCanonical.add(canonicalKey);
      combined.push(result);
    }
  }

  // Add OpenFDA results that aren't duplicates
  for (const result of openFdaResults) {
    const brandKey = result.brandName.toLowerCase();
    const canonicalKey = createCanonicalKey(result.genericName, result.brandName);

    if (!seenBrands.has(brandKey) && !seenCanonical.has(canonicalKey)) {
      seenBrands.add(brandKey);
      seenCanonical.add(canonicalKey);
      combined.push({
        ...result,
        canonicalKey,
      });
    }
  }

  return combined.slice(0, limit);
}

// Get drug by ID (checks Supabase first, then OpenFDA)
export async function getDrugById(id: string): Promise<DrugSearchResult | null> {
  // Try drug_details first with joined medication data
  const { data, error } = await supabase
    .from('drug_details')
    .select(`
      *,
      medications:medication_id (
        name,
        generic_name,
        quantity,
        unit
      )
    `)
    .eq('id', id)
    .single();

  if (!error && data) {
    const drug = data as DrugDetail & { medications?: { name: string; generic_name: string; quantity: number; unit: string } };
    const genericName = drug.generic_name || drug.medications?.generic_name || drug.drug_name;
    const description = drug.description || drug.uses?.[0];

    return {
      id: drug.id,
      brandName: drug.drug_name,
      genericName,
      manufacturer: drug.drug_class || '',
      purpose: description || `Generic: ${genericName}`,
      ndcCodes: [],
      source: 'supabase',
    };
  }

  // Try medications table directly
  const { data: medData, error: medError } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single();

  if (!medError && medData) {
    const med = medData as { id: string; name: string; generic_name: string; quantity: number; unit: string };
    return {
      id: med.id,
      brandName: med.name,
      genericName: med.generic_name || med.name,
      manufacturer: '',
      purpose: med.generic_name ? `Generic: ${med.generic_name}` : '',
      ndcCodes: [],
      source: 'supabase',
    };
  }

  // Fall back to OpenFDA (try both spl_id and set_id)
  try {
    let response = await fetch(
      `${OPENFDA_BASE_URL}/label.json?search=openfda.spl_id:${id}&limit=1`
    );

    let responseData = await response.json();

    // If spl_id didn't work, try set_id
    if (!responseData.results || responseData.results.length === 0) {
      response = await fetch(
        `${OPENFDA_BASE_URL}/label.json?search=set_id:${id}&limit=1`
      );
      responseData = await response.json();
    }

    if (!responseData.results || responseData.results.length === 0) return null;

    const result = responseData.results[0];
    const openfda = result.openfda || {};
    return {
      id: openfda.spl_id?.[0] || result.set_id || id,
      brandName: formatDrugName(openfda.brand_name?.[0] || result.brand_name?.[0] || 'Unknown'),
      genericName: formatDrugName(openfda.generic_name?.[0] || result.generic_name?.[0] || 'Unknown'),
      manufacturer: toTitleCase(openfda.manufacturer_name?.[0] || ''),
      purpose: result.purpose?.[0] || result.indications_and_usage?.[0]?.substring(0, 200) || '',
      ndcCodes: openfda.product_ndc || [],
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
  // First try Supabase
  const { data, error } = await supabase
    .from('drug_details')
    .select(`
      *,
      medications:medication_id (
        name,
        generic_name,
        quantity,
        unit
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    // Try OpenFDA for full details (try both spl_id and set_id)
    try {
      let response = await fetch(
        `${OPENFDA_BASE_URL}/label.json?search=openfda.spl_id:${id}&limit=1`
      );

      // If spl_id didn't work, try set_id
      if (!response.ok || (await response.clone().json()).results?.length === 0) {
        response = await fetch(
          `${OPENFDA_BASE_URL}/label.json?search=set_id:${id}&limit=1`
        );
      }

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.results && responseData.results.length > 0) {
          const result = responseData.results[0];
          const openfda = result.openfda || {};

          // Helper to safely get array
          const toArray = (val: unknown): string[] => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return [String(val)];
          };

          // Extract and clean warnings from various fields
          const rawWarnings = [
            ...toArray(result.boxed_warning),
            ...toArray(result.warnings),
          ];
          const warnings = cleanFDAList(rawWarnings);

          // Extract and clean uses/indications
          const rawUses = [
            ...toArray(result.indications_and_usage),
            ...toArray(result.purpose),
          ];
          const uses = cleanFDAList(rawUses);

          // Extract and clean side effects
          const rawSideEffects = [
            ...toArray(result.adverse_reactions),
            ...toArray(result.warnings_and_cautions),
          ];
          const sideEffects = cleanFDAList(rawSideEffects);

          // Extract and clean before taking info
          const rawBeforeTaking = [
            ...toArray(result.contraindications),
            ...toArray(result.do_not_use),
          ];
          const beforeTaking = cleanFDAList(rawBeforeTaking);

          // Clean purpose/description
          const purposeRaw = result.purpose?.[0] || result.indications_and_usage?.[0] || '';
          const purpose = cleanFDAText(purposeRaw.substring(0, 500));

          return {
            id: openfda.spl_id?.[0] || id,
            brandName: formatDrugName(openfda.brand_name?.[0] || result.brand_name?.[0] || 'Unknown'),
            genericName: formatDrugName(openfda.generic_name?.[0] || result.generic_name?.[0] || 'Unknown'),
            manufacturer: toTitleCase(openfda.manufacturer_name?.[0] || ''),
            purpose,
            ndcCodes: openfda.product_ndc || [],
            source: 'openfda',
            drugClass: cleanFDAText(openfda.pharm_class_epc?.[0] || ''),
            uses: uses.slice(0, 5),
            warnings: warnings.slice(0, 5),
            beforeTaking: beforeTaking.slice(0, 5),
            sideEffects: {
              emergency: [],
              common: sideEffects.slice(0, 5),
            },
            dosageNotes: cleanFDAText(result.dosage_and_administration?.[0] || ''),
            interactionsNote: cleanFDAText(result.drug_interactions?.[0] || ''),
            availability: openfda.product_type?.[0] === 'OTC' ? 'OTC' : 'Prescription',
            controlledSubstance: null,
          };
        }
      }
    } catch (err) {
      console.error('OpenFDA full details error:', err);
    }

    // Last resort - return basic info
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

  const drug = data as DrugDetail & { medications?: { name: string; generic_name: string; quantity: number; unit: string } };
  const genericName = drug.generic_name || drug.medications?.generic_name || drug.drug_name;
  const descriptionRaw = drug.description || drug.uses?.[0];

  // Clean all FDA text artifacts from Supabase data
  return {
    id: drug.id,
    brandName: formatDrugName(drug.drug_name),
    genericName: formatDrugName(genericName),
    manufacturer: drug.drug_class ? toTitleCase(drug.drug_class) : '',
    purpose: descriptionRaw ? cleanFDAText(descriptionRaw) : `Generic: ${formatDrugName(genericName)}`,
    ndcCodes: [],
    source: 'supabase',
    drugClass: drug.drug_class ? cleanFDAText(drug.drug_class) : null,
    uses: cleanFDAList(drug.uses || []),
    warnings: cleanFDAList(drug.warnings || []),
    beforeTaking: cleanFDAList(drug.before_taking || []),
    sideEffects: {
      emergency: cleanFDAList(drug.side_effects_emergency || []),
      common: cleanFDAList(drug.side_effects_common || []),
    },
    dosageNotes: drug.dosage_notes ? cleanFDAText(drug.dosage_notes) : null,
    interactionsNote: drug.interactions_note ? cleanFDAText(drug.interactions_note) : null,
    availability: drug.availability,
    controlledSubstance: drug.controlled_substance,
  };
}
