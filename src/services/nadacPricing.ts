/**
 * NADAC (National Average Drug Acquisition Cost) Pricing Service
 *
 * Uses CMS/Medicaid public data updated weekly.
 * NADAC = what pharmacies pay. Retail is typically 20-50% higher.
 *
 * Source: https://data.medicaid.gov
 * Data updated: 2025-12-24
 */

import nadacData from '../data/nadacPrices.json';

export interface NADACDrugPrice {
  description: string;
  ndc: string;
  pricePerUnit: number;
  unit: string;
  isOTC: boolean;
}

export interface DrugPriceInfo {
  drugName: string;
  entryCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  lowestOptions: NADACDrugPrice[];
  // Estimated retail prices (NADAC + markup)
  estimated30DayLow: number;
  estimated30DayHigh: number;
  estimated30DayWithDiscount: number;
}

interface NADACEntry {
  d: string; // description
  n: string; // ndc
  p: number; // price
  u: string; // unit
  o: boolean; // otc
}

interface NADACDrugData {
  n: string; // name
  c: number; // count
  l: NADACEntry[]; // lowest prices
  min: number;
  max: number;
  avg: number;
}

interface NADACDataFile {
  date: string;
  src: string;
  url: string;
  cnt: number;
  d: Record<string, NADACDrugData>;
}

const data = nadacData as NADACDataFile;

/**
 * Search for drug prices by name
 */
export function getNADACPrice(drugName: string): DrugPriceInfo | null {
  const searchKey = drugName.toUpperCase().trim().split(/\s+/)[0];

  // Try exact match first
  let drugData = data.d[searchKey];

  // Try partial match if no exact match
  if (!drugData) {
    const keys = Object.keys(data.d);
    const partialMatch = keys.find(
      (k) => k.includes(searchKey) || searchKey.includes(k)
    );
    if (partialMatch) {
      drugData = data.d[partialMatch];
    }
  }

  if (!drugData) return null;

  const lowestOptions: NADACDrugPrice[] = drugData.l.map((entry) => ({
    description: entry.d,
    ndc: entry.n,
    pricePerUnit: entry.p,
    unit: entry.u,
    isOTC: entry.o,
  }));

  // Calculate 30-day estimates (assuming 1 dose/day)
  const quantity = 30;
  const pharmacyCost = drugData.min * quantity;

  return {
    drugName: drugData.n,
    entryCount: drugData.c,
    minPrice: drugData.min,
    maxPrice: drugData.max,
    avgPrice: drugData.avg,
    lowestOptions,
    // Retail markup estimates
    estimated30DayLow: pharmacyCost * 1.2, // 20% markup (discount pharmacy)
    estimated30DayHigh: pharmacyCost * 1.5, // 50% markup (retail)
    estimated30DayWithDiscount: pharmacyCost * 1.15, // 15% markup (Cost Plus style)
  };
}

/**
 * Search multiple drugs at once
 */
export function searchNADACPrices(query: string): DrugPriceInfo[] {
  const searchKey = query.toUpperCase().trim();
  const results: DrugPriceInfo[] = [];

  for (const [key, drugData] of Object.entries(data.d)) {
    if (key.includes(searchKey) || drugData.n.includes(searchKey)) {
      const info = getNADACPrice(key);
      if (info) results.push(info);
    }
  }

  return results.slice(0, 20);
}

/**
 * Get all available drug names
 */
export function getAvailableDrugs(): string[] {
  return Object.keys(data.d).sort();
}

/**
 * Format price for display
 */
export function formatNADACPrice(price: number): string {
  if (price < 0.01) {
    return `$${(price * 100).toFixed(2)}¢`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get data source info
 */
export function getNADACSourceInfo(): { date: string; source: string; url: string; drugCount: number } {
  return {
    date: data.date,
    source: data.src,
    url: data.url,
    drugCount: data.cnt,
  };
}
