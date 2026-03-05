/**
 * Layer 1 — Known Merchant Database
 * Curated database of Indian merchants mapped to categories.
 * Uses: exact VPA match, fuzzy merchant name, MCC code lookup.
 * Confidence: 0.95–0.99
 */
import stringSimilarity from 'string-similarity';

export interface ClassificationResult {
    category: string;
    confidence: number;
    method: string;
    layer: number;
}

interface MerchantEntry {
    pattern: string;
    category: string;
    vpa?: string[];
    mcc?: string[];
}

// ─── 100+ Indian Merchant Database ───────────────────────────
const MERCHANT_DB: MerchantEntry[] = [
    // ─── Essential: Groceries ─────────────────────────
    { pattern: 'BIGBASKET', category: 'Essential.Groceries', vpa: ['bigbasket@ybl', 'bigbasket@paytm'] },
    { pattern: 'BLINKIT', category: 'Essential.Groceries', vpa: ['blinkit@icici', 'grofers@ybl'] },
    { pattern: 'INSTAMART', category: 'Essential.Groceries', vpa: ['instamart@ybl'] },
    { pattern: 'DMART', category: 'Essential.Groceries', vpa: ['dmart@icici'] },
    { pattern: 'ZEPTO', category: 'Essential.Groceries', vpa: ['zepto@ybl'] },
    { pattern: 'JIOMART', category: 'Essential.Groceries', vpa: ['jiomart@hdfcbank'] },
    { pattern: 'MORE RETAIL', category: 'Essential.Groceries' },
    { pattern: 'RELIANCE FRESH', category: 'Essential.Groceries' },
    { pattern: 'NATURE BASKET', category: 'Essential.Groceries' },
    { pattern: 'SPENCER', category: 'Essential.Groceries' },
    { pattern: 'STAR BAZAAR', category: 'Essential.Groceries' },
    { pattern: 'SWIGGY_GROCERY', category: 'Essential.Groceries' },
    { pattern: 'SWIGGY INSTAMART', category: 'Essential.Groceries' },
    { pattern: 'COUNTRY DELIGHT', category: 'Essential.Groceries', vpa: ['countrydelight@ybl'] },
    { pattern: 'MILKBASKET', category: 'Essential.Groceries' },

    // ─── Essential: Utilities & Bills ─────────────────
    { pattern: 'BSES', category: 'Essential.Utilities', mcc: ['4900'] },
    { pattern: 'BESCOM', category: 'Essential.Utilities' },
    { pattern: 'TATA POWER', category: 'Essential.Utilities' },
    { pattern: 'MAHANAGAR GAS', category: 'Essential.Utilities' },
    { pattern: 'INDRAPRASTHA GAS', category: 'Essential.Utilities' },
    { pattern: 'JIO', category: 'Essential.Utilities', vpa: ['jio@axisbank'] },
    { pattern: 'AIRTEL', category: 'Essential.Utilities', vpa: ['airtel@icici', 'airtel@ybl'] },
    { pattern: 'VI VODAFONE', category: 'Essential.Utilities' },
    { pattern: 'BSNL', category: 'Essential.Utilities' },
    { pattern: 'ACT FIBERNET', category: 'Essential.Utilities' },
    { pattern: 'HATHWAY', category: 'Essential.Utilities' },
    { pattern: 'DEN NETWORKS', category: 'Essential.Utilities' },
    { pattern: 'TATA SKY', category: 'Essential.Utilities' },
    { pattern: 'DISH TV', category: 'Essential.Utilities' },
    { pattern: 'WATERWORKS', category: 'Essential.Utilities' },

    // ─── Essential: Transport ─────────────────────────
    { pattern: 'UBER', category: 'Essential.Transportation', vpa: ['uber@axisbank'] },
    { pattern: 'OLA', category: 'Essential.Transportation', vpa: ['olacabs@ybl', 'olamoney@ybl'] },
    { pattern: 'RAPIDO', category: 'Essential.Transportation', vpa: ['rapido@ybl'] },
    { pattern: 'IRCTC', category: 'Essential.Transportation', vpa: ['irctcewallet@sbi'], mcc: ['4112'] },
    { pattern: 'METRO RAIL', category: 'Essential.Transportation' },
    { pattern: 'DMRC', category: 'Essential.Transportation' },
    { pattern: 'NAMMA METRO', category: 'Essential.Transportation' },
    { pattern: 'FASTAG', category: 'Essential.Transportation' },
    { pattern: 'INDIAN OIL', category: 'Essential.Transportation', vpa: ['iocl@icici'], mcc: ['5541'] },
    { pattern: 'BHARAT PETROLEUM', category: 'Essential.Transportation', mcc: ['5541'] },
    { pattern: 'HP PETROL', category: 'Essential.Transportation', mcc: ['5541'] },

    // ─── Essential: Healthcare ────────────────────────
    { pattern: 'APOLLO PHARMACY', category: 'Essential.Healthcare', vpa: ['apollopharmacy@ybl'] },
    { pattern: 'MEDPLUS', category: 'Essential.Healthcare' },
    { pattern: 'NETMEDS', category: 'Essential.Healthcare', vpa: ['netmeds@ybl'] },
    { pattern: 'PHARMEASY', category: 'Essential.Healthcare', vpa: ['pharmeasy@ybl'] },
    { pattern: 'PRACTO', category: 'Essential.Healthcare', vpa: ['practo@icici'] },
    { pattern: '1MG', category: 'Essential.Healthcare', vpa: ['1mg@ybl'] },
    { pattern: 'FORTIS', category: 'Essential.Healthcare' },
    { pattern: 'MAX HOSPITAL', category: 'Essential.Healthcare' },
    { pattern: 'MANIPAL HOSPITAL', category: 'Essential.Healthcare' },
    { pattern: 'HOSPITAL', category: 'Essential.Healthcare' },
    { pattern: 'CLINIC', category: 'Essential.Healthcare' },

    // ─── Essential: Education ─────────────────────────
    { pattern: 'BYJU', category: 'Essential.Education', vpa: ['byjus@ybl'] },
    { pattern: 'UNACADEMY', category: 'Essential.Education' },
    { pattern: 'VEDANTU', category: 'Essential.Education' },
    { pattern: 'SCHOOL FEE', category: 'Essential.Education' },
    { pattern: 'COLLEGE FEE', category: 'Essential.Education' },
    { pattern: 'UNIVERSITY', category: 'Essential.Education' },
    { pattern: 'COACHING', category: 'Essential.Education' },
    { pattern: 'TUITION', category: 'Essential.Education' },

    // ─── Essential: Housing ───────────────────────────
    { pattern: 'RENT', category: 'Essential.Housing', mcc: ['6513'] },
    { pattern: 'SOCIETY MAINTENANCE', category: 'Essential.Housing' },
    { pattern: 'NOBROKER', category: 'Essential.Housing', vpa: ['nobroker@ybl'] },
    { pattern: 'HOUSING.COM', category: 'Essential.Housing' },

    // ─── Essential: Insurance ─────────────────────────
    { pattern: 'LIC', category: 'Essential.Insurance', vpa: ['lic@sbi'] },
    { pattern: 'HDFC ERGO', category: 'Essential.Insurance' },
    { pattern: 'ICICI LOMBARD', category: 'Essential.Insurance' },
    { pattern: 'STAR HEALTH', category: 'Essential.Insurance' },
    { pattern: 'MAX LIFE', category: 'Essential.Insurance' },
    { pattern: 'POLICY BAZAAR', category: 'Essential.Insurance', vpa: ['policybazaar@ybl'] },
    { pattern: 'DIGIT INSURANCE', category: 'Essential.Insurance' },

    // ─── Essential: EMI / Loans ───────────────────────
    { pattern: 'HDFC EMI', category: 'Essential.EMI', mcc: ['6012'] },
    { pattern: 'SBI EMI', category: 'Essential.EMI' },
    { pattern: 'BAJAJ FINANCE', category: 'Essential.EMI', vpa: ['bajajfinance@icici'] },

    // ─── Discretionary: Dining Out ────────────────────
    { pattern: 'ZOMATO', category: 'Discretionary.DiningOut', vpa: ['zomato@ybl', 'zomato@icici', 'zomato.rzp@icici'] },
    { pattern: 'SWIGGY', category: 'Discretionary.DiningOut', vpa: ['swiggy@ybl', 'swiggy@icici'] },
    { pattern: 'DOMINO', category: 'Discretionary.DiningOut', vpa: ['dominos@ybl'] },
    { pattern: 'MCDONALDS', category: 'Discretionary.DiningOut' },
    { pattern: 'BURGER KING', category: 'Discretionary.DiningOut' },
    { pattern: 'KFC', category: 'Discretionary.DiningOut' },
    { pattern: 'PIZZA HUT', category: 'Discretionary.DiningOut' },
    { pattern: 'STARBUCKS', category: 'Discretionary.DiningOut', vpa: ['starbucks@icici'] },
    { pattern: 'CCD', category: 'Discretionary.DiningOut' },
    { pattern: 'THIRD WAVE', category: 'Discretionary.DiningOut' },
    { pattern: 'CHAAYOS', category: 'Discretionary.DiningOut' },
    { pattern: 'HALDIRAM', category: 'Discretionary.DiningOut' },
    { pattern: 'BARBEQUE NATION', category: 'Discretionary.DiningOut' },
    { pattern: 'DUNZO', category: 'Discretionary.DiningOut', vpa: ['dunzo@ybl'] },

    // ─── Discretionary: Entertainment ─────────────────
    { pattern: 'NETFLIX', category: 'Discretionary.Entertainment', vpa: ['netflix@icici'] },
    { pattern: 'AMAZON PRIME', category: 'Discretionary.Entertainment' },
    { pattern: 'DISNEY HOTSTAR', category: 'Discretionary.Entertainment', vpa: ['hotstar@ybl'] },
    { pattern: 'SPOTIFY', category: 'Discretionary.Entertainment', vpa: ['spotify@icici'] },
    { pattern: 'YOUTUBE PREMIUM', category: 'Discretionary.Entertainment' },
    { pattern: 'GOOGLE PLAY', category: 'Discretionary.Entertainment' },
    { pattern: 'APPLE.COM', category: 'Discretionary.Entertainment' },
    { pattern: 'BOOKMYSHOW', category: 'Discretionary.Entertainment', vpa: ['bookmyshow@ybl'] },
    { pattern: 'PVR', category: 'Discretionary.Entertainment', vpa: ['pvr@icici'] },
    { pattern: 'INOX', category: 'Discretionary.Entertainment' },
    { pattern: 'SONYLIV', category: 'Discretionary.Entertainment' },
    { pattern: 'ZEE5', category: 'Discretionary.Entertainment' },
    { pattern: 'JIOCINEMA', category: 'Discretionary.Entertainment' },

    // ─── Discretionary: Shopping ──────────────────────
    { pattern: 'AMAZON', category: 'Discretionary.Shopping', vpa: ['amazon@apl', 'amazonpay@ybl'] },
    { pattern: 'FLIPKART', category: 'Discretionary.Shopping', vpa: ['flipkart@ybl', 'flipkart@axisbank'] },
    { pattern: 'MYNTRA', category: 'Discretionary.Shopping', vpa: ['myntra@ybl'] },
    { pattern: 'AJIO', category: 'Discretionary.Shopping', vpa: ['ajio@icici'] },
    { pattern: 'NYKAA', category: 'Discretionary.Shopping', vpa: ['nykaa@icici'] },
    { pattern: 'MEESHO', category: 'Discretionary.Shopping' },
    { pattern: 'SNAPDEAL', category: 'Discretionary.Shopping' },
    { pattern: 'CROMA', category: 'Discretionary.Shopping', vpa: ['croma@ybl'] },
    { pattern: 'RELIANCE DIGITAL', category: 'Discretionary.Shopping' },
    { pattern: 'DECATHLON', category: 'Discretionary.Shopping', vpa: ['decathlon.rzp@icici'] },
    { pattern: 'LIFESTYLE', category: 'Discretionary.Shopping' },
    { pattern: 'SHOPPERS STOP', category: 'Discretionary.Shopping' },
    { pattern: 'PANTALOONS', category: 'Discretionary.Shopping' },
    { pattern: 'WESTSIDE', category: 'Discretionary.Shopping' },
    { pattern: 'H&M', category: 'Discretionary.Shopping' },
    { pattern: 'ZARA', category: 'Discretionary.Shopping' },

    // ─── Discretionary: Personal Care ─────────────────
    { pattern: 'URBAN COMPANY', category: 'Discretionary.PersonalCare', vpa: ['urbancompany@ybl'] },
    { pattern: 'LAKME', category: 'Discretionary.PersonalCare' },
    { pattern: 'SALON', category: 'Discretionary.PersonalCare' },
    { pattern: 'SPA', category: 'Discretionary.PersonalCare' },

    // ─── Discretionary: Travel ────────────────────────
    { pattern: 'MAKEMYTRIP', category: 'Discretionary.Travel', vpa: ['makemytrip@ybl'] },
    { pattern: 'GOIBIBO', category: 'Discretionary.Travel' },
    { pattern: 'CLEARTRIP', category: 'Discretionary.Travel' },
    { pattern: 'YATRA', category: 'Discretionary.Travel' },
    { pattern: 'OYO', category: 'Discretionary.Travel', vpa: ['oyorooms@ybl'] },
    { pattern: 'INDIGO', category: 'Discretionary.Travel', vpa: ['indigo@icici'] },
    { pattern: 'SPICEJET', category: 'Discretionary.Travel' },
    { pattern: 'AIR INDIA', category: 'Discretionary.Travel' },
    { pattern: 'VISTARA', category: 'Discretionary.Travel' },

    // ─── Discretionary: Fitness ───────────────────────
    { pattern: 'CULT.FIT', category: 'Discretionary.Fitness', vpa: ['cultfit@ybl'] },
    { pattern: 'FITTR', category: 'Discretionary.Fitness' },
    { pattern: 'GYM', category: 'Discretionary.Fitness' },

    // ─── Savings: Investment ──────────────────────────
    { pattern: 'ZERODHA', category: 'Savings.Investment', vpa: ['zerodha@kotak', 'zerodha@ybl'] },
    { pattern: 'GROWW', category: 'Savings.Investment', vpa: ['groww@axisbank'] },
    { pattern: 'KUVERA', category: 'Savings.Investment', vpa: ['kuvera@yesbank'] },
    { pattern: 'COIN BY ZERODHA', category: 'Savings.Investment' },
    { pattern: 'ET MONEY', category: 'Savings.Investment', vpa: ['etmoney@ybl'] },
    { pattern: 'PAYTM MONEY', category: 'Savings.Investment', vpa: ['paytmmoney@paytm'] },
    { pattern: 'MOTILAL OSWAL', category: 'Savings.Investment', vpa: ['motilaloswal@'] },
    { pattern: 'ANGEL ONE', category: 'Savings.Investment', vpa: ['angelone@'] },
    { pattern: 'UPSTOX', category: 'Savings.Investment' },
    { pattern: 'MUTUAL FUND', category: 'Savings.Investment' },
    { pattern: 'SIP', category: 'Savings.Investment' },
    { pattern: 'PPF', category: 'Savings.Investment' },
    { pattern: 'NPS', category: 'Savings.Investment' },

    // ─── BNPL Providers ──────────────────────────────
    { pattern: 'LAZYPAY', category: 'Obligation.BNPL', vpa: ['lazypay@ybl'] },
    { pattern: 'SIMPL', category: 'Obligation.BNPL' },
    { pattern: 'SLICE', category: 'Obligation.BNPL', vpa: ['slice@ybl'] },
    { pattern: 'ZESTMONEY', category: 'Obligation.BNPL' },
    { pattern: 'UNI CARD', category: 'Obligation.BNPL' },
];

// ─── MCC Code Mapping ────────────────────────────────────────
const MCC_MAP: Record<string, string> = {
    '4112': 'Essential.Transportation',  // Passenger Railways
    '4121': 'Essential.Transportation',  // Taxi/Rideshare
    '4131': 'Essential.Transportation',  // Bus Lines
    '4900': 'Essential.Utilities',       // Utility - Electric/Gas/Water
    '5411': 'Essential.Groceries',       // Supermarkets
    '5422': 'Essential.Groceries',       // Meat / Frozen Food
    '5541': 'Essential.Transportation',  // Service Stations / Fuel
    '5812': 'Discretionary.DiningOut',   // Eating Places / Restaurants
    '5813': 'Discretionary.DiningOut',   // Drinking Places / Bars
    '5912': 'Essential.Healthcare',      // Drug Stores / Pharmacies
    '5942': 'Discretionary.Shopping',    // Book Stores
    '5944': 'Discretionary.Shopping',    // Jewelry Stores
    '5999': 'Discretionary.Shopping',    // Miscellaneous Retail
    '6012': 'Essential.EMI',             // Financial Institutions – Merchandise
    '6513': 'Essential.Housing',         // Real Estate Agents
    '7011': 'Discretionary.Travel',      // Hotels / Motels
    '7832': 'Discretionary.Entertainment', // Motion Picture Theaters
    '7922': 'Discretionary.Entertainment', // Theatrical Events
    '7941': 'Discretionary.Entertainment', // Sports Clubs
    '8011': 'Essential.Healthcare',      // Doctors
    '8021': 'Essential.Healthcare',      // Dentists
    '8062': 'Essential.Healthcare',      // Hospitals
    '8211': 'Essential.Education',       // Elementary/Secondary Schools
    '8220': 'Essential.Education',       // Colleges/Universities
    '8299': 'Essential.Education',       // Schools/Educational Services
};

// ─── Build VPA lookup index for O(1) exact match ─────────────
const VPA_INDEX: Map<string, { category: string; pattern: string }> = new Map();
for (const entry of MERCHANT_DB) {
    if (entry.vpa) {
        for (const v of entry.vpa) {
            VPA_INDEX.set(v.toLowerCase(), { category: entry.category, pattern: entry.pattern });
        }
    }
}

/**
 * Layer 1: Known Merchant Database Lookup
 * Resolution order: Exact VPA → Fuzzy merchant name → MCC code
 */
export function layer1Lookup(
    merchantNameRaw: string,
    vpa?: string,
    mcc?: string
): ClassificationResult | null {
    // Step 1: Exact VPA match (highest precision → confidence 0.99)
    if (vpa) {
        const vpaLower = vpa.toLowerCase();
        // Direct lookup
        if (VPA_INDEX.has(vpaLower)) {
            const match = VPA_INDEX.get(vpaLower)!;
            return { category: match.category, confidence: 0.99, method: 'exact_vpa', layer: 1 };
        }
        // Partial VPA match (prefix match)
        for (const [indexedVpa, match] of VPA_INDEX.entries()) {
            if (vpaLower.startsWith(indexedVpa) || indexedVpa.startsWith(vpaLower.split('@')[0])) {
                return { category: match.category, confidence: 0.97, method: 'partial_vpa', layer: 1 };
            }
        }
    }

    // Step 2: Exact + fuzzy merchant name match
    const merchantUpper = merchantNameRaw.toUpperCase().trim();

    // Exact substring match first
    for (const entry of MERCHANT_DB) {
        if (merchantUpper.includes(entry.pattern)) {
            return { category: entry.category, confidence: 0.95, method: 'exact_name', layer: 1 };
        }
    }

    // Fuzzy match using Jaro-Winkler (via string-similarity) — threshold 0.85
    const allPatterns = MERCHANT_DB.map(e => e.pattern);
    const bestMatch = stringSimilarity.findBestMatch(merchantUpper, allPatterns);
    if (bestMatch.bestMatch.rating >= 0.85) {
        const matchedEntry = MERCHANT_DB.find(e => e.pattern === bestMatch.bestMatch.target);
        if (matchedEntry) {
            return {
                category: matchedEntry.category,
                confidence: Math.min(0.95, bestMatch.bestMatch.rating),
                method: 'fuzzy_name',
                layer: 1
            };
        }
    }

    // Step 3: MCC code lookup (if provided)
    if (mcc && MCC_MAP[mcc]) {
        return { category: MCC_MAP[mcc], confidence: 0.97, method: 'mcc', layer: 1 };
    }

    return null; // Pass to Layer 2
}

export { MERCHANT_DB, MCC_MAP };
