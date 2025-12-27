export interface PharmacyChain {
  id: string;
  name: string;
  logo?: string;
  description: string;
  storeLocatorUrl: string;
  getStoreLocatorWithZip: (zip: string) => string;
  badge: string;
  badgeColor: 'green' | 'blue' | 'purple' | 'orange';
  features: string[];
}

export const pharmacyChains: PharmacyChain[] = [
  {
    id: 'costplus',
    name: 'Cost Plus Drugs',
    description: 'Mark Cuban\'s transparent pricing - manufacturer cost + 15% + $5 pharmacy fee',
    storeLocatorUrl: 'https://costplusdrugs.com',
    getStoreLocatorWithZip: () => 'https://costplusdrugs.com',
    badge: 'Online Only',
    badgeColor: 'purple',
    features: ['Transparent pricing', 'No insurance needed', 'Mail delivery'],
  },
  {
    id: 'costco',
    name: 'Costco Pharmacy',
    description: 'Often the lowest prices - no Costco membership required for pharmacy',
    storeLocatorUrl: 'https://www.costco.com/warehouse-locations',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.costco.com/warehouse-locations?langId=-1&storeId=10301&catalogId=10701&zipCode=${zip}`,
    badge: 'No Membership Req.',
    badgeColor: 'green',
    features: ['Very low prices', 'No membership for Rx', 'In-store pickup'],
  },
  {
    id: 'walmart',
    name: 'Walmart Pharmacy',
    description: '$4 generics program - hundreds of common medications for $4/month',
    storeLocatorUrl: 'https://www.walmart.com/store/finder',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.walmart.com/store/finder?location=${zip}&distance=50`,
    badge: '$4 Generics',
    badgeColor: 'blue',
    features: ['$4/month generics', '5,000+ locations', 'In-store & mail delivery'],
  },
  {
    id: 'cvs',
    name: 'CVS Pharmacy',
    description: 'Nationwide with 9,000+ locations - accepts most insurance plans',
    storeLocatorUrl: 'https://www.cvs.com/store-locator/landing',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.cvs.com/store-locator/cvs-pharmacy-locations?searchQueryType=zip&address=${zip}`,
    badge: 'Most Locations',
    badgeColor: 'orange',
    features: ['9,000+ stores', 'MinuteClinic', '24-hour locations'],
  },
  {
    id: 'walgreens',
    name: 'Walgreens',
    description: 'Prescription Savings Club - $20/year for discounts on generics',
    storeLocatorUrl: 'https://www.walgreens.com/storelocator/find.jsp',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.walgreens.com/storelocator/find.jsp?requestType=locator&zipOrCity=${zip}`,
    badge: 'Savings Club',
    badgeColor: 'blue',
    features: ['$20/yr savings club', '8,000+ stores', 'Healthcare clinics'],
  },
  {
    id: 'riteaid',
    name: 'Rite Aid',
    description: 'Rx Savings Program - free enrollment for prescription discounts',
    storeLocatorUrl: 'https://www.riteaid.com/locations',
    getStoreLocatorWithZip: (zip: string) =>
      `https://www.riteaid.com/locations?q=${zip}`,
    badge: 'Free Savings Program',
    badgeColor: 'green',
    features: ['Free Rx savings', 'Immunizations', 'Health screenings'],
  },
];

export function getPharmacyChainById(id: string): PharmacyChain | undefined {
  return pharmacyChains.find(chain => chain.id === id);
}
