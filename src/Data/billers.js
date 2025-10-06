// Jamaican Biller Categories & Seed Data
export const BILLER_CATEGORIES = [
  { id: 'utilities', name: 'Utilities (Electricity & Water)', icon: 'flash' },
  { id: 'telecoms', name: 'Telecoms (Phone, Internet, Cable)', icon: 'access-point-network' },
  { id: 'financial', name: 'Financial Services (Credit Cards & Loans)', icon: 'credit-card' },
  { id: 'government', name: 'Government & Statutory Bodies', icon: 'office-building' },
  { id: 'insurance', name: 'Insurance', icon: 'shield-check' },
];

export const BILLERS = [
  // Utilities
  { id: 'jps', name: 'Jamaica Public Service (JPS)', shortName: 'JPS', category: 'utilities', logo: null },
  { id: 'nwc', name: 'National Water Commission (NWC)', shortName: 'NWC', category: 'utilities', logo: null },

  // Telecoms
  { id: 'flow', name: 'Flow', shortName: 'Flow', category: 'telecoms', logo: null },
  { id: 'digicel', name: 'Digicel', shortName: 'Digicel', category: 'telecoms', logo: null },

  // Financial Services
  { id: 'ncb', name: 'National Commercial Bank (NCB)', shortName: 'NCB', category: 'financial', logo: require('../assets/Logos/Scotia-Logo.png') },
  { id: 'scotia', name: 'Scotiabank Jamaica', shortName: 'Scotiabank', category: 'financial', logo: require('../assets/Logos/Scotia-Logo.png') },
  { id: 'sagicor-bank', name: 'Sagicor Bank', shortName: 'Sagicor Bank', category: 'financial', logo: null },
  { id: 'jn-bank', name: 'JN Bank', shortName: 'JN Bank', category: 'financial', logo: require('../assets/Logos/JN-Logo.png') },

  // Government & Statutory
  { id: 'nht', name: 'National Housing Trust (NHT)', shortName: 'NHT', category: 'government', logo: null },
  { id: 'taj', name: 'Tax Administration Jamaica (TAJ)', shortName: 'TAJ', category: 'government', logo: null },
  { id: 'nis', name: 'National Insurance Scheme (NIS)', shortName: 'NIS', category: 'government', logo: null },

  // Insurance
  { id: 'sagicor-life', name: 'Sagicor Life', shortName: 'Sagicor Life', category: 'insurance', logo: null },
  { id: 'guardian-life', name: 'Guardian Life', shortName: 'Guardian Life', category: 'insurance', logo: null },
  { id: 'icwi', name: 'ICWI', shortName: 'ICWI', category: 'insurance', logo: null },
];

export const POPULAR_BILLERS = ['jps', 'flow', 'nwc'];

export function getBillerById(id) {
  return BILLERS.find(b => b.id === id);
}

export function getBillersByCategory(categoryId) {
  return BILLERS.filter(b => b.category === categoryId);
}

