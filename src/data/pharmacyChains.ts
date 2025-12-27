export interface PharmacyChain {
  id: string;
  name: string;
  logo?: string;
  description: string;
  storeLocatorUrl: string;
  getStoreLocatorWithZip: (zip: string) => string;
  priceType: 'discount' | 'retail' | 'membership';
  features: string[];
}

export const pharmacyChains: PharmacyChain[] = [
  {
    id: 'costplus',
    name: 'Cost Plus Drugs',
    description: 'Mark Cuban\'s transparent pricing pharmacy - online only with flat 15% markup',
    storeLocatorUrl: 'https://costplusdrugs.com',
    getStoreLocatorWithZip: () => 'https://costplusdrugs.com',
    priceType: 'discount',
    features: ['Online pharmacy', 'Transparent pricing', 'No membership required', 'Mail delivery'],
  },
  {
    id: 'costco',
    name: 'Costco Pharmacy',
    description: 'Low-cost prescriptions - no membership required for pharmacy services',
    storeLocatorUrl: 'https://www.costco.com/warehouse-locations',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.costco.com/warehouse-locations?langId=-1&storeId=10301&catalogId=10701&zipCode=${zip}`,
    priceType: 'discount',
    features: ['No membership for Rx', 'Low prices', 'In-store pickup'],
  },
  {
    id: 'walmart',
    name: 'Walmart Pharmacy',
    description: 'Affordable prescriptions with $4 generic drug program',
    storeLocatorUrl: 'https://www.walmart.com/store/finder',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.walmart.com/store/finder?location=${zip}&distance=50`,
    priceType: 'retail',
    features: ['$4 generics program', 'Widely available', 'In-store pickup', 'Mail delivery'],
  },
  {
    id: 'cvs',
    name: 'CVS Pharmacy',
    description: 'Nationwide pharmacy chain with ExtraCare savings program',
    storeLocatorUrl: 'https://www.cvs.com/store-locator/landing',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.cvs.com/store-locator/cvs-pharmacy-locations?searchQueryType=zip&address=${zip}`,
    priceType: 'retail',
    features: ['ExtraCare savings', 'Widely available', 'MinuteClinic services', 'Mail delivery'],
  },
  {
    id: 'walgreens',
    name: 'Walgreens',
    description: 'Nationwide pharmacy with Prescription Savings Club discounts',
    storeLocatorUrl: 'https://www.walgreens.com/storelocator/find.jsp',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.walgreens.com/storelocator/find.jsp?requestType=locator&zipOrCity=${zip}`,
    priceType: 'retail',
    features: ['Savings Club available', 'Widely available', 'Healthcare services'],
  },
  {
    id: 'riteaid',
    name: 'Rite Aid',
    description: 'Pharmacy chain with wellness+ rewards program',
    storeLocatorUrl: 'https://www.riteaid.com/locations',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.riteaid.com/locations?q=${zip}`,
    priceType: 'retail',
    features: ['wellness+ rewards', 'Immunizations', 'Health screenings'],
  },
];

export function getPharmacyChainById(id: string): PharmacyChain | undefined {
  return pharmacyChains.find(chain => chain.id === id);
}
