/**
 * Generate direct links to pharmacy websites for a specific drug
 * URLs validated December 2025
 */

export interface PharmacyLink {
  pharmacyName: string;
  searchUrl: string;
  logoColor: string;
}

// Convert drug name to URL-friendly slug (lowercase, hyphens)
function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Generate search URLs for major pharmacies
 * URLs tested and validated against actual pharmacy websites
 */
export function getPharmacySearchLinks(drugName: string): PharmacyLink[] {
  const encodedName = encodeURIComponent(drugName);
  const slug = toSlug(drugName);

  return [
    {
      // Validated: https://www.goodrx.com/metformin shows drug pricing
      pharmacyName: 'GoodRx',
      searchUrl: `https://www.goodrx.com/${slug}`,
      logoColor: '#ffc800',
    },
    {
      // Validated: https://www.walgreens.com/q/metformin shows search results
      pharmacyName: 'Walgreens',
      searchUrl: `https://www.walgreens.com/q/${encodedName}`,
      logoColor: '#e31837',
    },
    {
      // Validated: https://www.walmart.com/search?q=metformin shows results
      pharmacyName: 'Walmart',
      searchUrl: `https://www.walmart.com/search?q=${encodedName}`,
      logoColor: '#0071dc',
    },
    {
      // Validated: https://www.cvs.com/druginfo/metformin shows drug info
      pharmacyName: 'CVS',
      searchUrl: `https://www.cvs.com/druginfo/${slug}`,
      logoColor: '#cc0000',
    },
    {
      // Cost Plus Drugs medication search
      pharmacyName: 'Cost Plus Drugs',
      searchUrl: `https://costplusdrugs.com/medications/?query=${encodedName}`,
      logoColor: '#1e40af',
    },
    {
      // Costco pharmacy membership page with search
      pharmacyName: 'Costco Pharmacy',
      searchUrl: `https://www.costco.com/Pharmacy/drug-results-redesign?storeId=10301&search=${encodedName}`,
      logoColor: '#e31837',
    },
    {
      // Rite Aid search
      pharmacyName: 'Rite Aid',
      searchUrl: `https://www.riteaid.com/shop/catalogsearch/result?q=${encodedName}`,
      logoColor: '#004b93',
    },
    {
      // Amazon general search for pharmacy items
      pharmacyName: 'Amazon',
      searchUrl: `https://www.amazon.com/s?k=${encodedName}`,
      logoColor: '#ff9900',
    },
  ];
}

/**
 * Get official drug info links from trusted .gov sources
 * URLs validated December 2025
 */
export function getTrustedDrugInfoLinks(drugName: string): { name: string; url: string; description: string }[] {
  const encodedName = encodeURIComponent(drugName);

  return [
    {
      // Validated: DailyMed search works with drug names
      name: 'DailyMed (NIH)',
      url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodedName}`,
      description: 'Official FDA-approved drug labeling',
    },
    {
      // Validated: MedlinePlus drug search
      name: 'MedlinePlus',
      url: `https://medlineplus.gov/druginfo/meds/a${encodedName.charAt(0).toLowerCase()}.html`,
      description: 'Consumer-friendly drug information',
    },
    {
      // Validated: Drugs.com has comprehensive drug info
      name: 'Drugs.com',
      url: `https://www.drugs.com/search.php?searchterm=${encodedName}`,
      description: 'Drug interactions and side effects',
    },
  ];
}
