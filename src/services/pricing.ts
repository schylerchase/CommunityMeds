import pricingData from '../data/pricing.json';

export interface DrugPrice {
  drugId: string;
  drugName: string;
  genericName?: string;
  quantity: number;
  unit: string;
  prices: {
    cash: number;
    withInsurance: number;
    goodrx?: number;
    costco?: number;
    walmart?: number;
    costplus?: number;
  };
  assistancePrograms?: {
    name: string;
    url: string;
    description: string;
  }[];
}

// Helper to convert null values to undefined for TypeScript compatibility
function cleanPrices(prices: Record<string, number | null>): DrugPrice['prices'] {
  return {
    cash: prices.cash ?? 0,
    withInsurance: prices.withInsurance ?? 0,
    goodrx: prices.goodrx ?? undefined,
    costco: prices.costco ?? undefined,
    walmart: prices.walmart ?? undefined,
    costplus: prices.costplus ?? undefined,
  };
}

export function getPriceForDrug(drugName: string): DrugPrice | null {
  const normalizedName = drugName.toLowerCase().trim();

  const drug = pricingData.drugs.find(
    (d) =>
      d.name.toLowerCase() === normalizedName ||
      d.genericName?.toLowerCase() === normalizedName
  );

  if (!drug) return null;

  return {
    drugId: drug.id,
    drugName: drug.name,
    genericName: drug.genericName,
    quantity: drug.quantity,
    unit: drug.unit,
    prices: cleanPrices(drug.prices as Record<string, number | null>),
    assistancePrograms: drug.assistancePrograms,
  };
}

export function searchPrices(query: string): DrugPrice[] {
  const normalizedQuery = query.toLowerCase().trim();

  return pricingData.drugs
    .filter(
      (d) =>
        d.name.toLowerCase().includes(normalizedQuery) ||
        d.genericName?.toLowerCase().includes(normalizedQuery)
    )
    .map((drug) => ({
      drugId: drug.id,
      drugName: drug.name,
      genericName: drug.genericName,
      quantity: drug.quantity,
      unit: drug.unit,
      prices: cleanPrices(drug.prices as Record<string, number | null>),
      assistancePrograms: drug.assistancePrograms,
    }));
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
  const amount = cashPrice - discountPrice;
  const percentage = Math.round((amount / cashPrice) * 100);
  return { amount, percentage };
}
