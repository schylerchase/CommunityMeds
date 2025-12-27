/**
 * Generate direct links to pharmacy websites for a specific drug
 */

export interface PharmacyLink {
  pharmacyName: string;
  searchUrl: string;
  logoColor: string;
}

/**
 * Generate search URLs for major pharmacies
 */
export function getPharmacySearchLinks(drugName: string): PharmacyLink[] {
  const encodedName = encodeURIComponent(drugName);

  return [
    {
      pharmacyName: 'Cost Plus Drugs',
      searchUrl: `https://costplusdrugs.com/medications/?q=${encodedName}`,
      logoColor: '#1e40af',
    },
    {
      pharmacyName: 'Costco',
      searchUrl: `https://www.costco.com/Pharmacy/drug-results?storeId=10301&catalogId=10701&langId=-1&search=${encodedName}`,
      logoColor: '#e31837',
    },
    {
      pharmacyName: 'Walmart',
      searchUrl: `https://www.walmart.com/search?q=${encodedName}+pharmacy`,
      logoColor: '#0071dc',
    },
    {
      pharmacyName: 'CVS',
      searchUrl: `https://www.cvs.com/search?searchTerm=${encodedName}`,
      logoColor: '#cc0000',
    },
    {
      pharmacyName: 'Walgreens',
      searchUrl: `https://www.walgreens.com/search/results.jsp?Ntt=${encodedName}`,
      logoColor: '#e31837',
    },
    {
      pharmacyName: 'Rite Aid',
      searchUrl: `https://www.riteaid.com/shop/catalogsearch/result?q=${encodedName}`,
      logoColor: '#004b93',
    },
    {
      pharmacyName: 'Amazon Pharmacy',
      searchUrl: `https://www.amazon.com/s?k=${encodedName}+pharmacy`,
      logoColor: '#ff9900',
    },
    {
      pharmacyName: 'GoodRx',
      searchUrl: `https://www.goodrx.com/search?search=${encodedName}`,
      logoColor: '#ffc800',
    },
  ];
}

/**
 * Get official drug info links from trusted .gov sources
 */
export function getTrustedDrugInfoLinks(drugName: string): { name: string; url: string; description: string }[] {
  const encodedName = encodeURIComponent(drugName);

  return [
    {
      name: 'FDA Drug Label',
      url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodedName}`,
      description: 'Official FDA-approved drug labeling from DailyMed (NIH)',
    },
    {
      name: 'MedlinePlus',
      url: `https://medlineplus.gov/druginformation.html`,
      description: 'Consumer-friendly drug info from National Library of Medicine',
    },
    {
      name: 'FDA Drug Info',
      url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=BasicSearch.process&ApplNo=${encodedName}`,
      description: 'FDA drug approval and safety information',
    },
  ];
}
