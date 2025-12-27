import { supabase, type Medication, type Price } from '../lib/supabase';

export interface DrugPrice {
  drugId: string;
  drugName: string;
  genericName?: string;
  category?: string;
  quantity: number;
  unit: string;
  prices: {
    cash?: number;
    insurance?: number;
    goodrx?: number;
    costco?: number;
    walmart?: number;
    costplus?: number;
    [key: string]: number | undefined;
  };
  lastUpdated?: string;
  assistancePrograms?: {
    name: string;
    url: string;
    description: string;
  }[];
}

// Map pharmacy names from DB to our price keys
const pharmacyMapping: Record<string, string> = {
  'cash': 'cash',
  'retail': 'cash',
  'insurance': 'insurance',
  'with_insurance': 'insurance',
  'goodrx': 'goodrx',
  'costco': 'costco',
  'walmart': 'walmart',
  'cost_plus': 'costplus',
  'costplus': 'costplus',
  'mark cuban cost plus': 'costplus',
};

function mapMedicationToDrugPrice(
  med: Medication & { category?: { name: string }; prices?: Price[] }
): DrugPrice {
  const prices: DrugPrice['prices'] = {};
  let lastUpdated: string | undefined;

  // Map prices from the prices array
  if (med.prices) {
    for (const price of med.prices) {
      const key = pharmacyMapping[price.pharmacy_name.toLowerCase()] || price.pharmacy_name.toLowerCase();
      prices[key] = price.price;

      // Track most recent update
      if (price.last_verified_at) {
        if (!lastUpdated || price.last_verified_at > lastUpdated) {
          lastUpdated = price.last_verified_at;
        }
      }
    }
  }

  return {
    drugId: med.id,
    drugName: med.name,
    genericName: med.generic_name ?? undefined,
    category: med.category?.name ?? undefined,
    quantity: med.quantity ?? 30,
    unit: med.unit ?? 'tablets',
    prices,
    lastUpdated,
  };
}

export async function getPriceForDrug(drugName: string): Promise<DrugPrice | null> {
  const normalizedName = drugName.toLowerCase().trim();

  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      category:categories(*),
      prices(*)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${normalizedName}%,generic_name.ilike.%${normalizedName}%`)
    .eq('prices.is_current', true)
    .limit(1)
    .single();

  if (error || !data) {
    // Try without the prices filter in case there are no current prices
    const { data: dataWithoutPrices, error: error2 } = await supabase
      .from('medications')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${normalizedName}%,generic_name.ilike.%${normalizedName}%`)
      .limit(1)
      .single();

    if (error2 || !dataWithoutPrices) {
      return null;
    }

    return mapMedicationToDrugPrice(dataWithoutPrices as Medication & { category?: { name: string } });
  }

  return mapMedicationToDrugPrice(data as Medication & { category?: { name: string }; prices?: Price[] });
}

export async function searchPrices(query: string): Promise<DrugPrice[]> {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return [];

  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      category:categories(*),
      prices(*)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${normalizedQuery}%,generic_name.ilike.%${normalizedQuery}%`)
    .limit(50);

  if (error) {
    console.error('Error searching prices:', error.message);
    return [];
  }

  return (data as (Medication & { category?: { name: string }; prices?: Price[] })[])
    .map(mapMedicationToDrugPrice);
}

export async function getAllMedications(): Promise<DrugPrice[]> {
  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      category:categories(*),
      prices(*)
    `)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching all medications:', error.message);
    return [];
  }

  return (data as (Medication & { category?: { name: string }; prices?: Price[] })[])
    .map(mapMedicationToDrugPrice);
}

export async function getMedicationsByCategory(categorySlug: string): Promise<DrugPrice[]> {
  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      category:categories!inner(*),
      prices(*)
    `)
    .eq('is_active', true)
    .eq('category.slug', categorySlug)
    .order('name');

  if (error) {
    console.error('Error fetching medications by category:', error.message);
    return [];
  }

  return (data as (Medication & { category?: { name: string }; prices?: Price[] })[])
    .map(mapMedicationToDrugPrice);
}

export async function getCategories(): Promise<{ name: string; slug: string }[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error.message);
    return [];
  }

  return data || [];
}

export async function getLastPriceUpdate(): Promise<string | null> {
  const { data, error } = await supabase
    .from('prices')
    .select('last_verified_at')
    .eq('is_current', true)
    .order('last_verified_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.last_verified_at;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function calculateSavings(cashPrice: number, discountPrice: number): {
  amount: number;
  percentage: number;
} {
  if (cashPrice <= 0) return { amount: 0, percentage: 0 };
  const amount = cashPrice - discountPrice;
  const percentage = Math.round((amount / cashPrice) * 100);
  return { amount, percentage };
}

export function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
