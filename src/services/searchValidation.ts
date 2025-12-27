/**
 * Search result validation to ensure quality data reaches users
 * This module prevents issues like "Unknown" drug names from appearing in the UI
 */

import type { DrugSearchResult } from './drugSearch';

// Strings that indicate missing/invalid data
const INVALID_NAME_PATTERNS = [
  'unknown',
  'n/a',
  'null',
  'undefined',
  'none',
  'not available',
  'not specified',
];

/**
 * Validates a single search result to ensure it has quality data
 * @returns true if the result is valid and should be shown to users
 */
export function validateSearchResult(result: DrugSearchResult): boolean {
  // Must have an ID
  if (!result.id || result.id.trim() === '') {
    return false;
  }

  // Brand name validation
  if (!isValidDrugName(result.brandName)) {
    return false;
  }

  // If generic name exists, it should also be valid (but can match brand name)
  if (result.genericName && result.genericName !== result.brandName) {
    if (!isValidDrugName(result.genericName)) {
      // Allow if brand name is valid - generic can be missing
      // but don't allow garbage generic names
      if (looksLikeGarbage(result.genericName)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates an array of search results, filtering out invalid ones
 * This is the primary function to use before displaying results to users
 */
export function validateSearchResults(results: DrugSearchResult[]): DrugSearchResult[] {
  return results.filter(validateSearchResult);
}

/**
 * Checks if a drug name is valid
 */
function isValidDrugName(name: string | undefined | null): boolean {
  if (!name) return false;

  const trimmed = name.trim();

  // Too short (likely garbage)
  if (trimmed.length < 3) return false;

  // Check against known invalid patterns
  const lowerName = trimmed.toLowerCase();
  if (INVALID_NAME_PATTERNS.some(pattern => lowerName === pattern)) {
    return false;
  }

  // Just numbers (likely NDC or other code)
  if (/^\d+$/.test(trimmed)) return false;

  // Just whitespace or punctuation
  if (/^[\s\p{P}]+$/u.test(trimmed)) return false;

  return true;
}

/**
 * Detects strings that look like garbage/placeholder data
 */
function looksLikeGarbage(str: string): boolean {
  if (!str) return true;

  const trimmed = str.trim().toLowerCase();

  // Empty or too short
  if (trimmed.length < 2) return true;

  // Known garbage patterns
  if (INVALID_NAME_PATTERNS.includes(trimmed)) return true;

  // Just numbers
  if (/^\d+$/.test(trimmed)) return true;

  // Just special characters
  if (/^[^a-z0-9]+$/i.test(trimmed)) return true;

  return false;
}

/**
 * Log validation failures for monitoring (can be connected to analytics)
 */
export function logValidationFailure(result: Partial<DrugSearchResult>, reason: string): void {
  if (import.meta.env.DEV) {
    console.warn('[SearchValidation] Rejected result:', {
      id: result.id,
      brandName: result.brandName,
      genericName: result.genericName,
      reason,
    });
  }
}
