import { describe, it, expect } from 'vitest';
import { analyzeDataQuality, needsHealing } from './dataHealing';

describe('Data Quality Detection', () => {
  describe('analyzeDataQuality', () => {
    it('should detect missing brand name', () => {
      const result = analyzeDataQuality({ brandName: '' });
      expect(result.needsHealing).toBe(true);
      expect(result.issues).toContain('Missing or unknown brand name');
      expect(result.severity).toBe('high');
    });

    it('should detect "Unknown" brand name', () => {
      const result = analyzeDataQuality({ brandName: 'Unknown' });
      expect(result.needsHealing).toBe(true);
      expect(result.issues).toContain('Missing or unknown brand name');
    });

    it('should detect section number markers like "7 )"', () => {
      const result = analyzeDataQuality({
        brandName: 'ValidDrug',
        description: 'This medication 7 ) is used for pain.',
      });
      expect(result.needsHealing).toBe(true);
      expect(result.issues.some(i => i.includes('Section number'))).toBe(true);
    });

    it('should detect section number markers like "7 )]"', () => {
      const result = analyzeDataQuality({
        brandName: 'ValidDrug',
        uses: ['Common uses include 7 )] treatment of infections.'],
      });
      expect(result.needsHealing).toBe(true);
    });

    it('should detect cross-reference brackets like "[see Warnings (5.1)]"', () => {
      const result = analyzeDataQuality({
        brandName: 'ValidDrug',
        warnings: ['Do not use if allergic [see Warnings and Precautions (5.1)]'],
      });
      expect(result.needsHealing).toBe(true);
      expect(result.issues.some(i => i.includes('Cross-reference'))).toBe(true);
    });

    it('should detect section headers like "6 ADVERSE REACTIONS"', () => {
      const result = analyzeDataQuality({
        brandName: 'ValidDrug',
        sideEffects: ['6 ADVERSE REACTIONS The following adverse reactions...'],
      });
      expect(result.needsHealing).toBe(true);
      expect(result.issues.some(i => i.includes('Section headers'))).toBe(true);
    });

    it('should detect subsection numbers like "(5.1)"', () => {
      const result = analyzeDataQuality({
        brandName: 'ValidDrug',
        description: 'See section ( 5.1 ) for more information.',
      });
      expect(result.needsHealing).toBe(true);
    });

    it('should accept clean data without artifacts', () => {
      const result = analyzeDataQuality({
        brandName: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        description: 'Used to treat type 2 diabetes by helping control blood sugar levels.',
        uses: ['Treatment of type 2 diabetes mellitus'],
        warnings: ['Do not use if you have kidney problems'],
      });
      expect(result.needsHealing).toBe(false);
      expect(result.issues).toHaveLength(0);
    });

    it('should determine medium severity for 2-3 issues', () => {
      const result = analyzeDataQuality({
        brandName: 'ValidDrug',
        description: '11 DESCRIPTION The drug 7 ) contains [see section (5.1)]',
      });
      expect(result.severity).toBe('medium');
      expect(result.issues.length).toBeGreaterThan(1);
    });

    it('should determine high severity for 4+ issues or missing name', () => {
      const result = analyzeDataQuality({
        brandName: 'Unknown', // high severity trigger
        description: '11 DESCRIPTION The drug contains info',
      });
      expect(result.severity).toBe('high');
    });
  });

  describe('needsHealing (simple check)', () => {
    it('should return true for bad data', () => {
      expect(needsHealing({ brandName: 'Unknown' })).toBe(true);
      expect(needsHealing({ brandName: '', uses: ['1 ) First use'] })).toBe(true);
    });

    it('should return false for clean data', () => {
      expect(needsHealing({
        brandName: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        description: 'Pain reliever and fever reducer.',
      })).toBe(false);
    });
  });
});

describe('Real-world FDA data patterns', () => {
  it('should detect the pattern from Prednisone data: "11 DESCRIPTION Trametinib..."', () => {
    const result = analyzeDataQuality({
      brandName: 'Prednisone',
      description: '11 DESCRIPTION Trametinib dimethyl sulfoxide is a kinase inhibitor.',
    });
    expect(result.needsHealing).toBe(true);
  });

  it('should detect "1 INDICATIONS AND USAGE" pattern', () => {
    const result = analyzeDataQuality({
      brandName: 'TestDrug',
      uses: ['1 INDICATIONS AND USAGE MEKINIST is a kinase inhibitor indicated...'],
    });
    expect(result.needsHealing).toBe(true);
  });

  it('should detect molecular formula artifacts', () => {
    const result = analyzeDataQuality({
      brandName: 'TestDrug',
      description: 'It has a molecular formula C 26 H 23 FIN 5 O 4 with a molecular mass of 693.53 g/mol.',
    });
    expect(result.needsHealing).toBe(true);
    expect(result.issues.some(i => i.includes('chemical formula'))).toBe(true);
  });
});
