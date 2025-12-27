/**
 * Self-healing data service
 * Automatically detects and fixes bad data by re-fetching from FDA API
 */

import { cleanFDAText, cleanFDAList, formatDrugName, toTitleCase } from '../utils/textFormatting';

const OPENFDA_BASE_URL = 'https://api.fda.gov/drug';

// Track healing attempts to avoid infinite loops
const healingAttempts = new Map<string, number>();
const MAX_HEALING_ATTEMPTS = 2;

interface HealedDrugData {
  brandName: string;
  genericName: string;
  manufacturer: string;
  purpose: string;
  uses: string[];
  warnings: string[];
  sideEffects: string[];
}

/**
 * Known patterns that indicate bad/unprocessed FDA data
 */
const BAD_DATA_PATTERNS = [
  // Section numbers like "1 )", "7 )]", "( 5"
  /\d+\s*\)\]?/,
  /\(\s*\d+\s*\)?/,

  // Section headers like "6 ADVERSE REACTIONS", "11 DESCRIPTION"
  /^\d+\.?\d*\s+[A-Z][A-Z\s]{3,}/m,

  // Cross-references like "[see Warnings and Precautions (5.1)]"
  /\[see\s+[^\]]+\]/i,
  /\(see\s+[^)]+\)/i,

  // Subsection numbers like "(5.1)", "(6.2)"
  /\(\s*\d+\.\d+\s*\)/,

  // Chemical formulas mixed with text (indicates raw FDA data)
  /C\s*\d+\s*H\s*\d+.*molecular/i,

  // Bullet artifacts
  /^[•·▪▸►]\s*/m,

  // Orphaned brackets
  /\[\s*\]/,
  /\(\s*\)/,

  // Multiple consecutive numbers/punctuation (section markers)
  /\d+\s*\.\s*\d+\s*[A-Z]/,
];

/**
 * Quality issues detected in data
 */
export interface DataQualityReport {
  needsHealing: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Detects if drug data needs healing and reports specific issues
 */
export function analyzeDataQuality(data: {
  brandName?: string;
  genericName?: string;
  description?: string;
  uses?: string[];
  warnings?: string[];
  sideEffects?: string[];
}): DataQualityReport {
  const issues: string[] = [];

  // Check for "Unknown" or missing names
  if (!data.brandName || data.brandName.toLowerCase() === 'unknown') {
    issues.push('Missing or unknown brand name');
  }
  if (data.brandName && data.brandName.length < 3) {
    issues.push('Brand name too short (likely invalid)');
  }

  // Check all text fields for FDA artifacts
  const allText = [
    data.description || '',
    ...(data.uses || []),
    ...(data.warnings || []),
    ...(data.sideEffects || []),
  ];

  for (const text of allText) {
    for (const pattern of BAD_DATA_PATTERNS) {
      if (pattern.test(text)) {
        const patternName = getPatternName(pattern);
        if (!issues.includes(patternName)) {
          issues.push(patternName);
        }
      }
    }
  }

  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (issues.some(i => i.includes('brand name'))) {
    severity = 'high';
  } else if (issues.length > 3) {
    severity = 'high';
  } else if (issues.length > 1) {
    severity = 'medium';
  }

  return {
    needsHealing: issues.length > 0,
    issues,
    severity,
  };
}

/**
 * Simple check for healing need (backwards compatible)
 */
export function needsHealing(data: {
  brandName?: string;
  genericName?: string;
  description?: string;
  uses?: string[];
}): boolean {
  return analyzeDataQuality(data).needsHealing;
}

/**
 * Get human-readable name for a pattern
 */
function getPatternName(pattern: RegExp): string {
  const patternStr = pattern.toString();
  if (patternStr.includes('\\d+\\s*\\)')) return 'Section number markers (e.g., "7 )")';
  if (patternStr.includes('\\[see')) return 'Cross-reference brackets';
  if (patternStr.includes('see\\s')) return 'Cross-reference parentheses';
  if (patternStr.includes('[A-Z][A-Z\\s]')) return 'Section headers (e.g., "6 ADVERSE REACTIONS")';
  if (patternStr.includes('\\d+\\.\\d+')) return 'Subsection numbers (e.g., "(5.1)")';
  if (patternStr.includes('molecular')) return 'Raw chemical formula data';
  if (patternStr.includes('•·▪▸►')) return 'Bullet markers';
  if (patternStr.includes('\\[\\s*\\]')) return 'Empty brackets';
  return 'Formatting artifacts';
}

/**
 * Fetch fresh data from OpenFDA for a drug
 */
export async function fetchFreshFromFDA(drugName: string): Promise<HealedDrugData | null> {
  try {
    const cleanName = drugName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Try brand name search first
    let response = await fetch(
      `${OPENFDA_BASE_URL}/label.json?search=openfda.brand_name:${cleanName}*&limit=1`
    );

    if (!response.ok) {
      // Try generic name
      response = await fetch(
        `${OPENFDA_BASE_URL}/label.json?search=openfda.generic_name:${cleanName}*&limit=1`
      );
    }

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const result = data.results[0];
    const openfda = result.openfda || {};

    // Helper to safely get array
    const toArray = (val: unknown): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [String(val)];
    };

    return {
      brandName: formatDrugName(openfda.brand_name?.[0] || drugName),
      genericName: formatDrugName(openfda.generic_name?.[0] || ''),
      manufacturer: toTitleCase(openfda.manufacturer_name?.[0] || ''),
      purpose: cleanFDAText(result.purpose?.[0] || result.indications_and_usage?.[0]?.substring(0, 500) || ''),
      uses: cleanFDAList(toArray(result.indications_and_usage)),
      warnings: cleanFDAList([...toArray(result.warnings), ...toArray(result.boxed_warning)]),
      sideEffects: cleanFDAList(toArray(result.adverse_reactions)),
    };
  } catch (error) {
    console.error('FDA fetch for healing failed:', error);
    return null;
  }
}

/**
 * Attempt to heal a drug record by fetching fresh FDA data
 * Returns healed data if successful, null if healing not possible
 */
export async function healDrugData(
  drugId: string,
  currentData: { brandName?: string; genericName?: string }
): Promise<HealedDrugData | null> {
  // Check if we've already tried healing this record too many times
  const attempts = healingAttempts.get(drugId) || 0;
  if (attempts >= MAX_HEALING_ATTEMPTS) {
    return null;
  }
  healingAttempts.set(drugId, attempts + 1);

  // Try fetching fresh data using the drug name we have
  const searchName = currentData.brandName || currentData.genericName || '';
  if (!searchName || searchName.toLowerCase() === 'unknown') {
    return null;
  }

  const freshData = await fetchFreshFromFDA(searchName);

  if (freshData && freshData.brandName.toLowerCase() !== 'unknown') {
    // Log successful healing for monitoring
    if (import.meta.env.DEV) {
      console.log('[DataHealing] Successfully healed drug:', drugId, freshData.brandName);
    }
    return freshData;
  }

  return null;
}

/**
 * Clean text on-the-fly for display
 * Use this when we can't heal the source data
 */
export function cleanForDisplay(text: string | null | undefined): string {
  if (!text) return '';
  return cleanFDAText(text);
}

/**
 * Clean array of text for display
 */
export function cleanArrayForDisplay(items: string[] | null | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];
  return cleanFDAList(items);
}

/**
 * Report bad data for later review (could be stored in Supabase)
 */
export function reportBadData(drugId: string, issues: string[]): void {
  if (import.meta.env.DEV) {
    console.warn('[DataHealing] Bad data detected:', { drugId, issues });
  }

  // In production, this could:
  // 1. Log to an analytics service
  // 2. Store in a "data_issues" table for review
  // 3. Trigger an alert for manual review
}
