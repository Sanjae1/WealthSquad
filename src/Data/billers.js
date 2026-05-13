// Data/billers.js — Enhanced with Subscriptions & Calendar Support

// ============================================
// JAMAICAN BILLERS (60+ providers)
// ============================================

export const BILLER_CATEGORIES = [
    { id: 'utilities', name: 'Utilities', icon: 'zap', priority: 1 },
    { id: 'telecoms', name: 'Phone & Internet', icon: 'smartphone', priority: 2 },
    { id: 'financial', name: 'Loans & Insurance', icon: 'shield', priority: 3 },
    { id: 'cable', name: 'Cable TV', icon: 'tv', priority: 4 },
    { id: 'government', name: 'Government', icon: 'building', priority: 5 },
    { id: 'education', name: 'School & University', icon: 'graduation-cap', priority: 6 },
    { id: 'security', name: 'Security Services', icon: 'lock', priority: 7 },
    { id: 'strata', name: 'Housing & Strata', icon: 'home', priority: 8 },
    { id: 'entertainment', name: 'Entertainment', icon: 'music', priority: 9 },
    { id: 'charity', name: 'Charity', icon: 'heart', priority: 10 }
];

export const ALL_BILLERS = [
    // === UTILITIES ===
    {
        id: 'jps',
        name: 'Jamaica Public Service Company Ltd',
        shortName: 'JPS',
        category: 'utilities',
        subcategory: 'electricity',
        icon: 'zap',
        brandColor: '#0055A4',
        accountFormat: {
            regex: /^1\d{9}$/,
            mask: '9999999999',
            maxLength: 10,
            helperText: '10 digits starting with 1, found top-right of bill',
            keyboardType: 'numeric'
        },
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 500,
            requiresFullPayment: false,
            gracePeriodDays: 7,
            disconnectionRisk: 'high'
        },
        billComponents: [
            { id: 'energy', label: 'Energy Charge', variable: true },
            { id: 'fuel', label: 'Fuel Rate', variable: true, unit: 'kWh' },
            { id: 'ipp', label: 'IPP Variable Charge', variable: true },
            { id: 'customer', label: 'Customer Charge', fixed: true },
            { id: 'gct', label: 'GCT (7%)', isTax: true }
        ],
        customerService: { phone: '888-225-5577', whatsapp: null, app: 'MyJPS' },
        regulatedBy: 'OUR',
        hasPrepaid: true,
        ussdCode: null
    },
    {
        id: 'nwc',
        name: 'National Water Commission',
        shortName: 'NWC',
        category: 'utilities',
        subcategory: 'water',
        icon: 'droplets',
        brandColor: '#0077B6',
        accountFormat: {
            regex: /^\d{8,10}$/,
            mask: '9999999999',
            maxLength: 10,
            helperText: '8-10 digit account number',
            keyboardType: 'numeric'
        },
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 300,
            gracePeriodDays: 14,
            disconnectionRisk: 'medium'
        },
        customerService: { phone: '888-225-5692', whatsapp: null },
        regulatedBy: 'OUR'
    },
    {
        id: 'rep',
        name: 'Rural Electrification Programme',
        shortName: 'REP',
        category: 'utilities',
        subcategory: 'electricity',
        icon: 'zap',
        brandColor: '#2E7D32',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            gracePeriodDays: 14,
            disconnectionRisk: 'medium'
        }
    },

    // === TELECOMMUNICATIONS ===
    {
        id: 'flow',
        name: 'Flow Jamaica',
        shortName: 'Flow',
        category: 'telecoms',
        subcategory: 'postpaid',
        icon: 'wifi',
        brandColor: '#E31937',
        accountFormat: {
            regex: /^876\d{7}$/,
            mask: '876-999-9999',
            maxLength: 10,
            helperText: 'Your Flow phone number',
            keyboardType: 'phone-pad'
        },
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 3,
            disconnectionRisk: 'high'
        },
        ussdCode: '*120#',
        bundles: ['internet', 'tv', 'phone']
    },
    {
        id: 'digicel',
        name: 'Digicel Jamaica',
        shortName: 'Digicel',
        category: 'telecoms',
        subcategory: 'postpaid',
        icon: 'smartphone',
        brandColor: '#00B0F0',
        accountFormat: {
            regex: /^876\d{7}$/,
            mask: '876-999-9999',
            maxLength: 10,
            helperText: 'Your Digicel phone number',
            keyboardType: 'phone-pad'
        },
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 3,
            disconnectionRisk: 'high'
        },
        ussdCode: '*145#',
        remittanceEnabled: true,
        bossMoney: true
    },
    {
        id: 'lime',
        name: 'LIME (Cable & Wireless) Jamaica',
        shortName: 'LIME',
        category: 'telecoms',
        subcategory: 'landline',
        icon: 'phone',
        brandColor: '#6A1B9A',
        accountFormat: {
            regex: /^876\d{7}$/,
            mask: '876-999-9999',
            maxLength: 10,
            helperText: 'Your LIME phone number',
            keyboardType: 'phone-pad'
        },
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },

    // === CABLE TV ===
    {
        id: 'jamaica_cable_vision',
        name: 'Jamaica Cable Vision',
        shortName: 'JCV',
        category: 'cable',
        subcategory: 'cable',
        icon: 'tv',
        brandColor: '#C62828',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'telstar',
        name: 'Telstar Cable',
        shortName: 'Telstar',
        category: 'cable',
        subcategory: 'cable',
        icon: 'tv',
        brandColor: '#1565C0',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'mars_cable',
        name: 'Mars Cable Vision',
        shortName: 'Mars Cable',
        category: 'cable',
        subcategory: 'cable',
        icon: 'tv',
        brandColor: '#00695C',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'cornwall_communications',
        name: 'Cornwall Communications',
        shortName: 'Cornwall',
        category: 'cable',
        subcategory: 'cable_internet',
        icon: 'tv',
        brandColor: '#E65100',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'combined_communications',
        name: 'Combined Communications',
        shortName: 'Combined',
        category: 'cable',
        subcategory: 'cable_internet',
        icon: 'tv',
        brandColor: '#283593',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },

    // === INTERNET / WIRELESS ===
    {
        id: 'noble_wifi',
        name: 'NOBLE WiFi',
        shortName: 'NOBLE',
        category: 'telecoms',
        subcategory: 'internet',
        icon: 'wifi',
        brandColor: '#7CB342',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'giant_networks',
        name: 'Giant Networks',
        shortName: 'Giant',
        category: 'telecoms',
        subcategory: 'internet',
        icon: 'wifi',
        brandColor: '#00838F',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'citi_wireless',
        name: 'Citi Wireless',
        shortName: 'Citi',
        category: 'telecoms',
        subcategory: 'internet',
        icon: 'wifi',
        brandColor: '#F9A825',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'innovera',
        name: 'Innovera Limited',
        shortName: 'Innovera',
        category: 'telecoms',
        subcategory: 'technology',
        icon: 'wifi',
        brandColor: '#5E35B1',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'dekal_wireless',
        name: 'Dekal Wireless',
        shortName: 'Dekal',
        category: 'telecoms',
        subcategory: 'internet',
        icon: 'wifi',
        brandColor: '#AD1457',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'medium'
        }
    },

    // === FINANCIAL / INSURANCE ===
    {
        id: 'sagicor',
        name: 'Sagicor Life Jamaica',
        shortName: 'Sagicor',
        category: 'financial',
        subcategory: 'insurance',
        icon: 'shield',
        brandColor: '#00897B',
        accountFormat: {
            regex: /^\d{6,10}$/,
            mask: '9999999999',
            maxLength: 10,
            helperText: 'Policy number',
            keyboardType: 'numeric'
        },
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 1000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'sagicor_sigma',
        name: 'Sagicor Sigma',
        shortName: 'Sagicor Sigma',
        category: 'financial',
        subcategory: 'investment',
        icon: 'trending-up',
        brandColor: '#00897B',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 5000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'guardian_life',
        name: 'Guardian Life Limited',
        shortName: 'Guardian',
        category: 'financial',
        subcategory: 'insurance',
        icon: 'shield',
        brandColor: '#1A237E',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 1000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'advantage_general',
        name: 'Advantage General Insurance',
        shortName: 'Advantage',
        category: 'financial',
        subcategory: 'insurance',
        icon: 'shield',
        brandColor: '#BF360C',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 2000,
            gracePeriodDays: 14,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'lasco_financial',
        name: 'LASCO Financial Services',
        shortName: 'LASCO',
        category: 'financial',
        subcategory: 'financial',
        icon: 'credit-card',
        brandColor: '#C2185B',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 500,
            gracePeriodDays: 14,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'access_financial',
        name: 'Access Financial Services',
        shortName: 'Access',
        category: 'financial',
        subcategory: 'microfinance',
        icon: 'credit-card',
        brandColor: '#4527A0',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 1000,
            gracePeriodDays: 7,
            disconnectionRisk: 'high'
        }
    },
    {
        id: 'cok_credit_union',
        name: 'COK Co-operative Credit Union',
        shortName: 'COK',
        category: 'financial',
        subcategory: 'credit_union',
        icon: 'landmark',
        brandColor: '#1565C0',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 1000,
            gracePeriodDays: 14,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'student_loan_bureau',
        name: 'Student Loan Bureau',
        shortName: 'SLB',
        category: 'financial',
        subcategory: 'loan',
        icon: 'graduation-cap',
        brandColor: '#00695C',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 2000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'nht',
        name: 'National Housing Trust',
        shortName: 'NHT',
        category: 'financial',
        subcategory: 'housing',
        icon: 'home',
        brandColor: '#2E7D32',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 1000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },

    // === SECURITY ===
    {
        id: 'king_alarm',
        name: 'King Alarm Systems',
        shortName: 'King Alarm',
        category: 'security',
        subcategory: 'security',
        icon: 'lock',
        brandColor: '#263238',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'high'
        }
    },
    {
        id: 'atlas_protection',
        name: 'Atlas Protection Limited',
        shortName: 'Atlas',
        category: 'security',
        subcategory: 'security',
        icon: 'lock',
        brandColor: '#37474F',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'high'
        }
    },
    {
        id: 'guardsman',
        name: 'Guardsman Communications',
        shortName: 'Guardsman',
        category: 'security',
        subcategory: 'security',
        icon: 'lock',
        brandColor: '#455A64',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'high'
        }
    },
    {
        id: 'hawkeye',
        name: 'Hawkeye Electronic Security',
        shortName: 'Hawkeye',
        category: 'security',
        subcategory: 'security',
        icon: 'lock',
        brandColor: '#546E7A',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'high'
        }
    },

    // === GOVERNMENT ===
    {
        id: 'property_tax',
        name: 'Property Tax',
        shortName: 'Property Tax',
        category: 'government',
        subcategory: 'tax',
        icon: 'building',
        brandColor: '#5D4037',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 90,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'transport_authority',
        name: 'Transport Authority',
        shortName: 'TAJ',
        category: 'government',
        subcategory: 'licensing',
        icon: 'car',
        brandColor: '#4E342E',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 30,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'highway_2000',
        name: 'Highway 2000 (JIO)',
        shortName: 'Highway 2000',
        category: 'government',
        subcategory: 'toll',
        icon: 'road',
        brandColor: '#3E2723',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 500,
            gracePeriodDays: 14,
            disconnectionRisk: 'medium'
        }
    },

    // === EDUCATION ===
    {
        id: 'uwi',
        name: 'University of the West Indies',
        shortName: 'UWI',
        category: 'education',
        subcategory: 'university',
        icon: 'graduation-cap',
        brandColor: '#1B5E20',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 10000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'utech',
        name: 'University of Technology',
        shortName: 'UTECH',
        category: 'education',
        subcategory: 'university',
        icon: 'graduation-cap',
        brandColor: '#33691E',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 10000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'ncu',
        name: 'Northern Caribbean University',
        shortName: 'NCU',
        category: 'education',
        subcategory: 'university',
        icon: 'graduation-cap',
        brandColor: '#827717',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 5000,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },

    // === STRATA / HOUSING ===
    {
        id: 'jacar_homes',
        name: 'JACAR Homes Company Ltd',
        shortName: 'JACAR',
        category: 'strata',
        subcategory: 'housing',
        icon: 'home',
        brandColor: '#880E4F',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 14,
            disconnectionRisk: 'medium'
        }
    },
    {
        id: 'richmond_hoa',
        name: 'Richmond Home Owners Association',
        shortName: 'Richmond HOA',
        category: 'strata',
        subcategory: 'hoa',
        icon: 'home',
        brandColor: '#4A148C',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 14,
            disconnectionRisk: 'medium'
        }
    },

    // === ENTERTAINMENT ===
    {
        id: 'jamaica_observer',
        name: 'Jamaica Observer',
        shortName: 'Observer',
        category: 'entertainment',
        subcategory: 'media',
        icon: 'newspaper',
        brandColor: '#B71C1C',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 7,
            disconnectionRisk: 'low'
        }
    },
    {
        id: 'jacap',
        name: 'Jamaica Association of Composers',
        shortName: 'JACAP',
        category: 'entertainment',
        subcategory: 'music',
        icon: 'music',
        brandColor: '#311B92',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: false,
            requiresFullPayment: true,
            gracePeriodDays: 30,
            disconnectionRisk: 'low'
        }
    },

    // === CHARITY ===
    {
        id: 'jet',
        name: 'Jamaica Environment Trust',
        shortName: 'JET',
        category: 'charity',
        subcategory: 'environment',
        icon: 'heart',
        brandColor: '#1B5E20',
        paymentRules: {
            currency: 'JMD',
            allowsPartialPayment: true,
            minimumPayment: 500,
            gracePeriodDays: 30,
            disconnectionRisk: 'none'
        }
    }
];

// ============================================
// SUBSCRIPTION PRESETS (Popular in Jamaica)
// ============================================

export const SUBSCRIPTION_PRESETS = [
    // Streaming
    { id: 'netflix', name: 'Netflix', category: 'streaming', brandColor: '#E50914', icon: 'tv', defaultAmount: 2200, currency: 'JMD', originalCurrency: 'USD', originalAmount: 15.49 },
    { id: 'spotify', name: 'Spotify', category: 'music', brandColor: '#1DB954', icon: 'music', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 9.99 },
    { id: 'youtube_premium', name: 'YouTube Premium', category: 'streaming', brandColor: '#FF0000', icon: 'play', defaultAmount: 1800, currency: 'JMD', originalCurrency: 'USD', originalAmount: 11.99 },
    { id: 'amazon_prime', name: 'Amazon Prime', category: 'streaming', brandColor: '#FF9900', icon: 'package', defaultAmount: 1500, currency: 'JMD', originalCurrency: 'USD', originalAmount: 14.99 },
    { id: 'disney_plus', name: 'Disney+', category: 'streaming', brandColor: '#113CCF', icon: 'film', defaultAmount: 1200, currency: 'JMD', originalCurrency: 'USD', originalAmount: 7.99 },
    { id: 'apple_tv', name: 'Apple TV+', category: 'streaming', brandColor: '#000000', icon: 'apple', defaultAmount: 1000, currency: 'JMD', originalCurrency: 'USD', originalAmount: 6.99 },

    // Music
    { id: 'apple_music', name: 'Apple Music', category: 'music', brandColor: '#FA243C', icon: 'music', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 9.99 },
    { id: 'tidal', name: 'Tidal', category: 'music', brandColor: '#000000', icon: 'music', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 9.99 },
    { id: 'audiomack_premium', name: 'Audiomack Premium', category: 'music', brandColor: '#FFA200', icon: 'music', defaultAmount: 700, currency: 'JMD', originalCurrency: 'USD', originalAmount: 4.99 },

    // Cloud
    { id: 'icloud', name: 'iCloud+', category: 'cloud', brandColor: '#000000', icon: 'cloud', defaultAmount: 500, currency: 'JMD', originalCurrency: 'USD', originalAmount: 0.99 },
    { id: 'google_one', name: 'Google One', category: 'cloud', brandColor: '#4285F4', icon: 'cloud', defaultAmount: 700, currency: 'JMD', originalCurrency: 'USD', originalAmount: 1.99 },
    { id: 'dropbox', name: 'Dropbox', category: 'cloud', brandColor: '#0061FF', icon: 'cloud', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 9.99 },

    // Software
    { id: 'adobe_cc', name: 'Adobe Creative Cloud', category: 'software', brandColor: '#FF0000', icon: 'pen-tool', defaultAmount: 7800, currency: 'JMD', originalCurrency: 'USD', originalAmount: 54.99 },
    { id: 'microsoft_365', name: 'Microsoft 365', category: 'software', brandColor: '#D83B01', icon: 'file-text', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 9.99 },
    { id: 'canva_pro', name: 'Canva Pro', category: 'software', brandColor: '#00C4CC', icon: 'layout', defaultAmount: 1800, currency: 'JMD', originalCurrency: 'USD', originalAmount: 12.99 },
    { id: 'notion', name: 'Notion', category: 'software', brandColor: '#000000', icon: 'file-text', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 8.00 },

    // Fitness
    { id: 'gym_membership', name: 'Gym Membership', category: 'fitness', brandColor: '#00C853', icon: 'dumbbell', defaultAmount: 8000, currency: 'JMD' },
    { id: 'peloton', name: 'Peloton', category: 'fitness', brandColor: '#FF5F38', icon: 'bike', defaultAmount: 6000, currency: 'JMD', originalCurrency: 'USD', originalAmount: 44.00 },
    { id: 'nike_training', name: 'Nike Training Club', category: 'fitness', brandColor: '#000000', icon: 'activity', defaultAmount: 0, currency: 'JMD' },

    // News
    { id: 'gleaner_digital', name: 'Jamaica Gleaner Digital', category: 'news', brandColor: '#1A237E', icon: 'newspaper', defaultAmount: 1500, currency: 'JMD' },
    { id: 'observer_digital', name: 'Jamaica Observer Digital', category: 'news', brandColor: '#B71C1C', icon: 'newspaper', defaultAmount: 1500, currency: 'JMD' },

    // Education
    { id: 'udemy', name: 'Udemy', category: 'education', brandColor: '#A435F0', icon: 'book-open', defaultAmount: 0, currency: 'JMD' }, // Per course
    { id: 'coursera', name: 'Coursera Plus', category: 'education', brandColor: '#0056D2', icon: 'book-open', defaultAmount: 8500, currency: 'JMD', originalCurrency: 'USD', originalAmount: 59.00 },
    { id: 'skillshare', name: 'Skillshare', category: 'education', brandColor: '#00FF84', icon: 'book-open', defaultAmount: 2100, currency: 'JMD', originalCurrency: 'USD', originalAmount: 13.75 },

    // Other
    { id: 'ps_plus', name: 'PlayStation Plus', category: 'other', brandColor: '#003791', icon: 'gamepad', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 9.99 },
    { id: 'xbox_game_pass', name: 'Xbox Game Pass', category: 'other', brandColor: '#107C10', icon: 'gamepad', defaultAmount: 1400, currency: 'JMD', originalCurrency: 'USD', originalAmount: 9.99 },
    { id: 'nintendo_online', name: 'Nintendo Switch Online', category: 'other', brandColor: '#E60012', icon: 'gamepad', defaultAmount: 500, currency: 'JMD', originalCurrency: 'USD', originalAmount: 3.99 }
];

export const SUBSCRIPTION_CATEGORIES = [
    { id: 'streaming', name: 'Streaming & Entertainment', icon: 'play', color: '#E50914' },
    { id: 'music', name: 'Music & Audio', icon: 'music', color: '#1DB954' },
    { id: 'cloud', name: 'Cloud Storage', icon: 'cloud', color: '#4285F4' },
    { id: 'software', name: 'Software & Tools', icon: 'Code', color: '#FF0000' },
    { id: 'fitness', name: 'Fitness & Health', icon: 'dumbbell', color: '#00C853' },
    { id: 'news', name: 'News & Media', icon: 'Newspaper', color: '#FF6F00' },
    { id: 'food', name: 'Food & Grocery', icon: 'Utensils', color: '#FF9800' },
    { id: 'transport', name: 'Transport', icon: 'Car', color: '#000000' },
    { id: 'education', name: 'Learning', icon: 'book-open', color: '#7B1FA2' },
    { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#757575' }
];

export const SUBSCRIPTION_BILLING_CYCLES = {
    weekly: { label: 'Weekly', days: 7, multiplier: 52 },
    biweekly: { label: 'Bi-Weekly', days: 14, multiplier: 26 },
    monthly: { label: 'Monthly', days: 30, multiplier: 12 },
    quarterly: { label: 'Quarterly', days: 90, multiplier: 4 },
    biannual: { label: 'Bi-Annual', days: 180, multiplier: 2 },
    annual: { label: 'Annual', days: 365, multiplier: 1 }
};

// ============================================
// PAYMENT METHODS (Jamaica-Realistic)
// ============================================

export const PAYMENT_METHODS = [
    {
        id: 'lynk',
        type: 'mobile_wallet',
        name: 'Lynk Wallet',
        provider: 'TFOB (2021) Ltd',
        icon: 'wallet',
        supportsAutopay: true,
        balance: 15000,
        currency: 'JMD'
    },
    {
        id: 'jnpay',
        type: 'bank_wallet',
        name: 'JN Pay',
        provider: 'JN Bank',
        icon: 'landmark',
        supportsAutopay: true
    },
    {
        id: 'mycash',
        type: 'agent_wallet',
        name: 'MyCash',
        provider: 'Paymaster',
        icon: 'store',
        supportsAutopay: false,
        agentLocations: 150
    },
    {
        id: 'lasco_gold',
        type: 'prepaid_card',
        name: 'LASCO Gold',
        provider: 'LASCO Financial',
        icon: 'credit-card',
        supportsAutopay: true
    },
    {
        id: 'gk_one',
        type: 'prepaid_card',
        name: 'GK One',
        provider: 'GraceKennedy',
        icon: 'credit-card',
        supportsAutopay: true
    },
    {
        id: 'card_visa',
        type: 'card',
        name: 'Visa Debit',
        last4: '4242',
        expiry: '12/27',
        bank: 'NCB',
        icon: 'credit-card',
        supportsAutopay: true
    },
    {
        id: 'card_mastercard',
        type: 'card',
        name: 'Mastercard',
        last4: '8888',
        expiry: '11/28',
        bank: 'Scotiabank',
        icon: 'credit-card',
        supportsAutopay: true
    },
    {
        id: 'agent_paymaster',
        type: 'agent',
        name: 'Paymaster Agent',
        location: 'Find nearest location',
        icon: 'map-pin',
        supportsAutopay: false,
        cashAccepted: true
    },
    {
        id: 'agent_bill_express',
        type: 'agent',
        name: 'Bill Express',
        icon: 'map-pin',
        supportsAutopay: false,
        cashAccepted: true
    },
    {
        id: 'ussd_flow',
        type: 'ussd',
        name: 'Flow USSD',
        code: '*120#',
        icon: 'hash',
        supportsAutopay: false,
        noDataNeeded: true
    },
    {
        id: 'ussd_digicel',
        type: 'ussd',
        name: 'Digicel USSD',
        code: '*145#',
        icon: 'hash',
        supportsAutopay: false,
        noDataNeeded: true
    }
];

// ============================================
// SAMPLE DATA (For Development)
// ============================================

export const SAMPLE_BILLS = [
    {
        id: 'bill_001',
        billerId: 'jps',
        accountNumber: '1234567890',
        nickname: 'Home Electricity',
        amount: 12500,
        currency: 'JMD',
        billingPeriodStart: '2026-04-01',
        billingPeriodEnd: '2026-04-30',
        issueDate: '2026-05-05',
        dueDate: '2026-05-20',
        status: 'paid',
        payments: [
            {
                id: 'pay_001',
                amount: 12500,
                date: '2026-05-18',
                method: 'lynk',
                methodName: 'Lynk Wallet',
                status: 'completed',
                reference: 'RCP-20260518-001',
                receiptUrl: 'https://api.app/receipts/RCP-20260518-001.pdf',
                processedAt: '2026-05-18T14:32:00Z'
            }
        ],
        amountPaid: 12500,
        amountDue: 0,
        breakdown: {
            energyCharge: 5240,
            fuelRate: 26.852,
            fuelCharge: 3120,
            ippCharge: 1890,
            customerCharge: 450,
            gctRate: 0.07,
            gctAmount: 755,
            total: 12500
        },
        autopay: false,
        notificationsEnabled: true,
        reminderDays: 3,
        createdAt: '2026-05-05',
        updatedAt: '2026-05-18'
    },
    {
        id: 'bill_002',
        billerId: 'nwc',
        accountNumber: '87654321',
        nickname: 'Home Water',
        amount: 4500,
        currency: 'JMD',
        billingPeriodStart: '2026-04-01',
        billingPeriodEnd: '2026-04-30',
        issueDate: '2026-05-03',
        dueDate: '2026-05-25',
        status: 'unpaid',
        payments: [],
        amountPaid: 0,
        amountDue: 4500,
        autopay: false,
        notificationsEnabled: true,
        reminderDays: 3,
        createdAt: '2026-05-03',
        updatedAt: '2026-05-03'
    },
    {
        id: 'bill_003',
        billerId: 'flow',
        accountNumber: '8765550199',
        nickname: 'Home Internet',
        amount: 8500,
        currency: 'JMD',
        billingPeriodStart: '2026-04-15',
        billingPeriodEnd: '2026-05-14',
        issueDate: '2026-05-15',
        dueDate: '2026-05-22',
        status: 'unpaid',
        payments: [],
        amountPaid: 0,
        amountDue: 8500,
        autopay: true,
        autopayMethod: 'card_visa',
        notificationsEnabled: true,
        reminderDays: 1,
        createdAt: '2026-05-15',
        updatedAt: '2026-05-15'
    },
    {
        id: 'bill_004',
        billerId: 'digicel',
        accountNumber: '8765550188',
        nickname: 'Dad Phone',
        amount: 3500,
        currency: 'JMD',
        billingPeriodStart: '2026-04-15',
        billingPeriodEnd: '2026-05-14',
        issueDate: '2026-05-15',
        dueDate: '2026-05-22',
        status: 'paid',
        payments: [
            {
                id: 'pay_002',
                amount: 3500,
                date: '2026-05-16',
                method: 'agent_paymaster',
                methodName: 'Paymaster Agent',
                status: 'completed',
                reference: 'PM-20260516-002',
                agentLocation: {
                    name: 'Paymaster — Half Way Tree',
                    address: '14-16 Constant Spring Road',
                    receiptNumber: 'PM-20260516-002'
                },
                receiptImage: 'file://receipts/PM-20260516-002.jpg',
                processedAt: '2026-05-16T10:15:00Z'
            }
        ],
        amountPaid: 3500,
        amountDue: 0,
        autopay: false,
        notificationsEnabled: true,
        reminderDays: 3,
        createdAt: '2026-05-15',
        updatedAt: '2026-05-16'
    },
    {
        id: 'bill_005',
        billerId: 'jps',
        accountNumber: '1234567890',
        nickname: 'Home Electricity',
        amount: 9800,
        currency: 'JMD',
        billingPeriodStart: '2026-03-01',
        billingPeriodEnd: '2026-03-31',
        issueDate: '2026-04-05',
        dueDate: '2026-04-20',
        status: 'paid',
        payments: [
            {
                id: 'pay_003',
                amount: 9800,
                date: '2026-04-18',
                method: 'card_visa',
                methodName: 'Visa Debit •••• 4242',
                status: 'completed',
                reference: 'RCP-20260418-003',
                processedAt: '2026-04-18T09:20:00Z'
            }
        ],
        amountPaid: 9800,
        amountDue: 0,
        autopay: false,
        notificationsEnabled: true,
        reminderDays: 3,
        createdAt: '2026-04-05',
        updatedAt: '2026-04-18'
    }
];

export const SAMPLE_SUBSCRIPTIONS = [
    {
        id: 'sub_001',
        name: 'Netflix',
        category: 'streaming',
        icon: 'tv',
        brandColor: '#E50914',
        amount: 2200,
        currency: 'JMD',
        originalCurrency: 'USD',
        originalAmount: 15.49,
        exchangeRate: 142.0,
        exchangeRateDate: '2026-05-01',
        billingCycle: 'monthly',
        nextBillingDate: '2026-06-15',
        status: 'active',
        autoRenew: true,
        reminderDays: 3,
        reminderChannel: 'push',
        paymentMethod: {
            type: 'card',
            last4: '4242',
            expiry: '12/27'
        },
        paymentHistory: [
            {
                id: 'spay_001',
                date: '2026-05-15',
                amount: 2200,
                status: 'paid',
                method: 'card_visa_4242',
                reference: 'NETFLIX-20260515'
            },
            {
                id: 'spay_002',
                date: '2026-04-15',
                amount: 2200,
                status: 'paid',
                method: 'card_visa_4242',
                reference: 'NETFLIX-20260415'
            }
        ],
        createdAt: '2025-01-15',
        updatedAt: '2026-05-15'
    },
    {
        id: 'sub_002',
        name: 'Spotify',
        category: 'music',
        icon: 'music',
        brandColor: '#1DB954',
        amount: 1400,
        currency: 'JMD',
        originalCurrency: 'USD',
        originalAmount: 9.99,
        exchangeRate: 140.14,
        exchangeRateDate: '2026-05-01',
        billingCycle: 'monthly',
        nextBillingDate: '2026-06-10',
        status: 'active',
        autoRenew: true,
        reminderDays: 3,
        reminderChannel: 'push',
        paymentMethod: {
            type: 'card',
            last4: '4242',
            expiry: '12/27'
        },
        paymentHistory: [
            {
                id: 'spay_003',
                date: '2026-05-10',
                amount: 1400,
                status: 'paid',
                method: 'card_visa_4242',
                reference: 'SPOTIFY-20260510'
            }
        ],
        createdAt: '2025-03-20',
        updatedAt: '2026-05-10'
    },
    {
        id: 'sub_003',
        name: 'iCloud+',
        category: 'cloud',
        icon: 'cloud',
        brandColor: '#000000',
        amount: 500,
        currency: 'JMD',
        originalCurrency: 'USD',
        originalAmount: 0.99,
        exchangeRate: 142.0,
        exchangeRateDate: '2026-05-01',
        billingCycle: 'monthly',
        nextBillingDate: '2026-06-01',
        status: 'active',
        autoRenew: true,
        reminderDays: 1,
        reminderChannel: 'push',
        paymentMethod: {
            type: 'card',
            last4: '8888',
            expiry: '11/28'
        },
        paymentHistory: [
            {
                id: 'spay_004',
                date: '2026-05-01',
                amount: 500,
                status: 'paid',
                method: 'card_mastercard_8888',
                reference: 'APPLE-20260501'
            }
        ],
        createdAt: '2024-06-01',
        updatedAt: '2026-05-01'
    },
    {
        id: 'sub_004',
        name: 'Gym Membership',
        category: 'fitness',
        icon: 'dumbbell',
        brandColor: '#00C853',
        amount: 8000,
        currency: 'JMD',
        billingCycle: 'monthly',
        nextBillingDate: '2026-06-01',
        status: 'active',
        autoRenew: true,
        reminderDays: 3,
        reminderChannel: 'sms',
        paymentMethod: {
            type: 'lynk',
            name: 'Lynk Wallet'
        },
        paymentHistory: [
            {
                id: 'spay_005',
                date: '2026-05-01',
                amount: 8000,
                status: 'paid',
                method: 'lynk_wallet',
                reference: 'GYM-20260501'
            }
        ],
        createdAt: '2025-01-01',
        updatedAt: '2026-05-01'
    },
    {
        id: 'sub_005',
        name: 'YouTube Premium',
        category: 'streaming',
        icon: 'play',
        brandColor: '#FF0000',
        amount: 1800,
        currency: 'JMD',
        originalCurrency: 'USD',
        originalAmount: 11.99,
        exchangeRate: 150.13,
        exchangeRateDate: '2026-04-01',
        billingCycle: 'monthly',
        nextBillingDate: '2026-06-05',
        status: 'active',
        autoRenew: true,
        reminderDays: 3,
        reminderChannel: 'push',
        paymentMethod: {
            type: 'card',
            last4: '4242',
            expiry: '12/27'
        },
        paymentHistory: [
            {
                id: 'spay_006',
                date: '2026-05-05',
                amount: 1800,
                status: 'paid',
                method: 'card_visa_4242',
                reference: 'YOUTUBE-20260505'
            }
        ],
        createdAt: '2025-06-05',
        updatedAt: '2026-05-05'
    }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getBillerById = (id) => ALL_BILLERS.find(b => b.id === id);

export const getBillersByCategory = (categoryId) =>
    ALL_BILLERS.filter(b => b.category === categoryId);

export const getBillersBySubcategory = (subcategoryId) =>
    ALL_BILLERS.filter(b => b.subcategory === subcategoryId);

export const searchBillers = (query) => {
    const q = query.toLowerCase();
    return ALL_BILLERS.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.subcategory?.toLowerCase().includes(q)
    );
};

export const getPopularBillers = () => {
    return ['jps', 'flow', 'nwc', 'digicel'].map(id => getBillerById(id)).filter(Boolean);
};

export const getSubscriptionPresetById = (id) =>
    SUBSCRIPTION_PRESETS.find(s => s.id === id);

export const searchSubscriptionPresets = (query) => {
    const q = query.toLowerCase();
    return SUBSCRIPTION_PRESETS.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
};

export const getSubscriptionsByCategory = (categoryId) =>
    SUBSCRIPTION_PRESETS.filter(s => s.category === categoryId);

// Currency formatting
export const formatJMD = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'JM$0';
    const rounded = Math.round(amount);
    return `JM$${rounded.toLocaleString('en-JM')}`;
};

export const formatUSD = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'USD $0.00';
    return `USD $${amount.toFixed(2)}`;
};

export const formatCurrency = (amount, currency = 'JMD') => {
    if (currency === 'USD') return formatUSD(amount);
    return formatJMD(amount);
};

// Date formatting (Jamaican style)
export const formatJamaicanDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-JM', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatJamaicanDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-JM', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Calendar helpers
export const getDaysUntil = (dateString) => {
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
};

export const isOverdue = (dateString) => {
    return getDaysUntil(dateString) < 0;
};

export const getUrgencyLevel = (dateString) => {
    const days = getDaysUntil(dateString);
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'soon';
    return 'normal';
};

// Payment history helpers
export const getTotalPaidThisMonth = (payments) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return payments
        .filter(p => new Date(p.date) >= startOfMonth)
        .reduce((sum, p) => sum + p.amount, 0);
};

export const getTotalPaidThisYear = (payments) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return payments
        .filter(p => new Date(p.date) >= startOfYear)
        .reduce((sum, p) => sum + p.amount, 0);
};

export const getPaymentHistoryByBiller = (payments, billerId) =>
    payments.filter(p => p.billerId === billerId);

export const getPaymentHistoryByMethod = (payments, methodId) =>
    payments.filter(p => p.method === methodId);

// Subscription insights
export const getMonthlySubscriptionCost = (subscriptions) => {
    return subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
            const cycle = SUBSCRIPTION_BILLING_CYCLES[s.billingCycle];
            const monthly = cycle ? (s.amount * cycle.multiplier / 12) : s.amount;
            return sum + monthly;
        }, 0);
};

export const getAnnualSubscriptionCost = (subscriptions) => {
    return subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
            const cycle = SUBSCRIPTION_BILLING_CYCLES[s.billingCycle];
            const annual = cycle ? (s.amount * cycle.multiplier) : s.amount * 12;
            return sum + annual;
        }, 0);
};

export const getSubscriptionCategoryBreakdown = (subscriptions) => {
    const active = subscriptions.filter(s => s.status === 'active');
    const breakdown = {};

    active.forEach(sub => {
        const cycle = SUBSCRIPTION_BILLING_CYCLES[sub.billingCycle];
        const monthly = cycle ? (sub.amount * cycle.multiplier / 12) : sub.amount;

        if (!breakdown[sub.category]) {
            breakdown[sub.category] = { monthly: 0, annual: 0, count: 0 };
        }
        breakdown[sub.category].monthly += monthly;
        breakdown[sub.category].annual += monthly * 12;
        breakdown[sub.category].count += 1;
    });

    return breakdown;
};

export const getUpcomingRenewals = (subscriptions, days = 7) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return subscriptions
        .filter(s => s.status === 'active')
        .filter(s => {
            const nextDate = new Date(s.nextBillingDate);
            return nextDate >= now && nextDate <= cutoff;
        })
        .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
};

// Calendar event generation
export const generateCalendarEvents = (bills, subscriptions) => {
    const events = [];

    // Bill events
    bills.forEach(bill => {
        // Due date
        events.push({
            id: `evt_bill_due_${bill.id}`,
            type: 'bill_due',
            sourceType: 'bill',
            sourceId: bill.id,
            date: bill.dueDate,
            title: `${getBillerById(bill.billerId)?.shortName || 'Bill'} Due`,
            subtitle: formatJMD(bill.amountDue || bill.amount),
            description: `${bill.nickname} — ${bill.accountNumber}`,
            color: isOverdue(bill.dueDate) ? '#E53935' : '#E67E22',
            icon: getBillerById(bill.billerId)?.icon || 'file-text',
            status: bill.status === 'paid' ? 'completed' : isOverdue(bill.dueDate) ? 'overdue' : 'upcoming'
        });

        // Payment events
        bill.payments?.forEach(payment => {
            events.push({
                id: `evt_bill_paid_${payment.id}`,
                type: 'bill_paid',
                sourceType: 'bill',
                sourceId: bill.id,
                date: payment.date,
                title: `Paid ${getBillerById(bill.billerId)?.shortName || 'Bill'}`,
                subtitle: formatJMD(payment.amount),
                description: `Via ${payment.methodName}`,
                color: '#43A047',
                icon: 'check-circle',
                status: 'completed'
            });
        });

        // Issue date
        if (bill.issueDate) {
            events.push({
                id: `evt_bill_issued_${bill.id}`,
                type: 'bill_issued',
                sourceType: 'bill',
                sourceId: bill.id,
                date: bill.issueDate,
                title: `${getBillerById(bill.billerId)?.shortName || 'Bill'} Bill Issued`,
                subtitle: formatJMD(bill.amount),
                description: `For period ${formatJamaicanDate(bill.billingPeriodStart)} — ${formatJamaicanDate(bill.billingPeriodEnd)}`,
                color: '#1E88E5',
                icon: 'file-text',
                status: 'completed'
            });
        }
    });

    // Subscription events
    subscriptions.forEach(sub => {
        // Next billing
        events.push({
            id: `evt_sub_due_${sub.id}`,
            type: 'subscription_due',
            sourceType: 'subscription',
            sourceId: sub.id,
            date: sub.nextBillingDate,
            title: `${sub.name} Renews`,
            subtitle: formatJMD(sub.amount),
            description: `${SUBSCRIPTION_BILLING_CYCLES[sub.billingCycle]?.label || 'Monthly'} subscription`,
            color: '#FDD835',
            icon: sub.icon || 'refresh-cw',
            status: sub.status === 'active' ? 'upcoming' : 'cancelled'
        });

        // Payment history
        sub.paymentHistory?.forEach(payment => {
            events.push({
                id: `evt_sub_paid_${payment.id}`,
                type: 'subscription_paid',
                sourceType: 'subscription',
                sourceId: sub.id,
                date: payment.date,
                title: `Paid ${sub.name}`,
                subtitle: formatJMD(payment.amount),
                description: `Via ${payment.method}`,
                color: '#43A047',
                icon: 'check-circle',
                status: 'completed'
            });
        });
    });

    // Sort by date
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getEventsForDate = (events, dateString) => {
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);

    return events.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === target.getTime();
    });
};

export const getEventsForMonth = (events, year, month) => {
    return events.filter(e => {
        const date = new Date(e.date);
        return date.getFullYear() === year && date.getMonth() === month;
    });
};
