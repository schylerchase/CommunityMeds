/**
 * Text formatting utilities to ensure proper English language rules
 * for medication names, descriptions, and other content.
 */

/**
 * Capitalize the first letter of each word (Title Case)
 * Handles special cases for medication names
 */
export function toTitleCase(str: string): string {
  if (!str) return '';

  // Words that should remain lowercase in titles
  const lowerCaseWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor',
    'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with'
  ]);

  // Words/abbreviations that should stay uppercase
  const upperCaseWords = new Set([
    'OTC', 'RX', 'HCL', 'MG', 'ML', 'MCG', 'USP', 'ER', 'XR', 'CR',
    'SR', 'DR', 'IR', 'LA', 'EC', 'ODT', 'XL', 'CD', 'FDA', 'DEA',
    'NDC', 'NDA', 'ANDA', 'CVS', 'USA', 'UK', 'EU'
  ]);

  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      // Check if it's an uppercase abbreviation
      if (upperCaseWords.has(word.toUpperCase())) {
        return word.toUpperCase();
      }

      // First word always capitalized
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Keep articles/prepositions lowercase
      if (lowerCaseWords.has(word)) {
        return word;
      }

      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Capitalize only the first letter of a sentence
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format a drug name properly
 * Handles special cases like brand names and generic names
 */
export function formatDrugName(name: string): string {
  if (!name) return '';

  // Handle all-caps names (common in FDA data)
  if (name === name.toUpperCase() && name.length > 3) {
    return toTitleCase(name);
  }

  // Handle names with parenthetical content
  return name.replace(/\(([^)]+)\)/g, (_match, content) => {
    return `(${content.toLowerCase()})`;
  });
}

/**
 * Format a sentence to ensure proper punctuation
 */
export function formatSentence(str: string): string {
  if (!str) return '';

  let result = str.trim();

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Ensure proper ending punctuation
  if (!/[.!?]$/.test(result)) {
    result += '.';
  }

  // Fix double periods
  result = result.replace(/\.{2,}$/, '.');

  // Fix spacing after punctuation
  result = result.replace(/([.!?,;:])\s*/g, '$1 ').trim();

  // Remove trailing space before period
  result = result.replace(/\s+\.$/g, '.');

  return result;
}

/**
 * Format a list of items into proper sentences
 */
export function formatList(items: string[]): string[] {
  return items.map(item => {
    let formatted = item.trim();

    // Capitalize first letter
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    // Don't add period if it ends with punctuation
    if (!/[.!?:,]$/.test(formatted)) {
      // For short items (likely list items), don't add period
      if (formatted.length < 50 && !formatted.includes('. ')) {
        return formatted;
      }
      formatted += '.';
    }

    return formatted;
  });
}

/**
 * Format a phone number to standard US format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone; // Return original if we can't format
}

/**
 * Format an address consistently
 */
export function formatAddress(parts: {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}): string {
  const { address, city, state, zip } = parts;
  const components: string[] = [];

  if (address) {
    components.push(toTitleCase(address.trim()));
  }

  if (city) {
    components.push(toTitleCase(city.trim()));
  }

  if (state) {
    // State abbreviations should be uppercase
    const stateStr = state.trim();
    if (stateStr.length === 2) {
      components.push(stateStr.toUpperCase());
    } else {
      components.push(toTitleCase(stateStr));
    }
  }

  if (zip) {
    components.push(zip.trim());
  }

  return components.join(', ');
}

/**
 * Format price to USD currency
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Clean up text that may have inconsistent spacing or formatting
 */
export function cleanText(str: string): string {
  if (!str) return '';

  return str
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Fix spacing around punctuation
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,;:!?])(?=[a-zA-Z])/g, '$1 ')
    // Remove leading/trailing whitespace
    .trim();
}
