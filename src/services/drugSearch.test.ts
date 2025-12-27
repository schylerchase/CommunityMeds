import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSearchResult, validateSearchResults } from './searchValidation';

// Mock OpenFDA API responses for testing
const mockOpenFDAResults = {
  withValidData: {
    openfda: {
      brand_name: ['Metformin HCL'],
      generic_name: ['METFORMIN HYDROCHLORIDE'],
      manufacturer_name: ['Teva Pharmaceuticals'],
      spl_id: ['abc123'],
      product_ndc: ['12345-678-90'],
    },
    purpose: ['Treatment of type 2 diabetes'],
    set_id: 'set123',
  },
  withMissingBrandName: {
    openfda: {
      generic_name: ['CHLORHEXIDINE GLUCONATE'],
      spl_id: ['def456'],
    },
    spl_product_data_elements: ['ChloraPrep Swabstick Chlorhexidine gluconate'],
    set_id: 'set456',
  },
  withNoNames: {
    openfda: {
      spl_id: ['ghi789'],
    },
    set_id: 'set789',
  },
  withUnknownOnly: {
    openfda: {},
    set_id: 'set000',
  },
};

describe('Search Result Validation', () => {
  describe('validateSearchResult', () => {
    it('should accept results with valid brand and generic names', () => {
      const result = {
        id: 'test123',
        brandName: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        manufacturer: 'Teva',
        purpose: 'Diabetes treatment',
        ndcCodes: [],
        source: 'openfda' as const,
      };

      expect(validateSearchResult(result)).toBe(true);
    });

    it('should reject results with "Unknown" brand name', () => {
      const result = {
        id: 'test123',
        brandName: 'Unknown',
        genericName: 'Some Generic',
        manufacturer: '',
        purpose: '',
        ndcCodes: [],
        source: 'openfda' as const,
      };

      expect(validateSearchResult(result)).toBe(false);
    });

    it('should reject results with empty brand name', () => {
      const result = {
        id: 'test123',
        brandName: '',
        genericName: 'Some Generic',
        manufacturer: '',
        purpose: '',
        ndcCodes: [],
        source: 'openfda' as const,
      };

      expect(validateSearchResult(result)).toBe(false);
    });

    it('should reject results with missing id', () => {
      const result = {
        id: '',
        brandName: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        manufacturer: '',
        purpose: '',
        ndcCodes: [],
        source: 'openfda' as const,
      };

      expect(validateSearchResult(result)).toBe(false);
    });

    it('should reject results with very short names (likely garbage)', () => {
      const result = {
        id: 'test123',
        brandName: 'AB',
        genericName: 'CD',
        manufacturer: '',
        purpose: '',
        ndcCodes: [],
        source: 'openfda' as const,
      };

      expect(validateSearchResult(result)).toBe(false);
    });

    it('should reject results that are just numbers', () => {
      const result = {
        id: 'test123',
        brandName: '12345',
        genericName: '67890',
        manufacturer: '',
        purpose: '',
        ndcCodes: [],
        source: 'openfda' as const,
      };

      expect(validateSearchResult(result)).toBe(false);
    });
  });

  describe('validateSearchResults', () => {
    it('should filter out invalid results from array', () => {
      const results = [
        {
          id: 'valid1',
          brandName: 'Metformin',
          genericName: 'Metformin HCL',
          manufacturer: 'Teva',
          purpose: '',
          ndcCodes: [],
          source: 'openfda' as const,
        },
        {
          id: 'invalid1',
          brandName: 'Unknown',
          genericName: 'Unknown',
          manufacturer: '',
          purpose: '',
          ndcCodes: [],
          source: 'openfda' as const,
        },
        {
          id: 'valid2',
          brandName: 'Lisinopril',
          genericName: 'Lisinopril',
          manufacturer: 'Lupin',
          purpose: '',
          ndcCodes: [],
          source: 'openfda' as const,
        },
      ];

      const validated = validateSearchResults(results);

      expect(validated).toHaveLength(2);
      expect(validated[0].brandName).toBe('Metformin');
      expect(validated[1].brandName).toBe('Lisinopril');
    });

    it('should return empty array for all invalid results', () => {
      const results = [
        {
          id: '',
          brandName: 'Unknown',
          genericName: '',
          manufacturer: '',
          purpose: '',
          ndcCodes: [],
          source: 'openfda' as const,
        },
      ];

      const validated = validateSearchResults(results);
      expect(validated).toHaveLength(0);
    });
  });
});

describe('Drug Name Quality Checks', () => {
  it('should not allow common garbage strings', () => {
    const garbageStrings = [
      'Unknown',
      'N/A',
      'null',
      'undefined',
      '',
      '   ',
      '123',
      'AB',
    ];

    garbageStrings.forEach(garbage => {
      const result = {
        id: 'test',
        brandName: garbage,
        genericName: 'Valid Name',
        manufacturer: '',
        purpose: '',
        ndcCodes: [],
        source: 'openfda' as const,
      };

      expect(validateSearchResult(result)).toBe(false);
    });
  });
});
