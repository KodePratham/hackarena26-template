import crypto from 'crypto';
import stringSimilarity from 'string-similarity';

// Task 6.1.1 & 6.1.2: Rule-based categories
const MERCHANT_RULES: Record<string, string> = {
    // Essential merchants
    "SWIGGY_GROCERY": "Essential.Groceries",
    "BIGBASKET": "Essential.Groceries",
    "BSES": "Essential.Utilities",
    "MAHANAGAR_GAS": "Essential.Utilities",
    "IRCTC": "Essential.Transport",
    "HDFC_EMI": "Essential.EMI",

    // Discretionary merchants
    "SWIGGY": "Discretionary.DiningOut",
    "ZOMATO": "Discretionary.DiningOut",
    "NETFLIX": "Discretionary.Subscriptions",
    "SPOTIFY": "Discretionary.Subscriptions",
    "MYNTRA": "Discretionary.Shopping",
    "BOOKMYSHOW": "Discretionary.Entertainment",
};

export class NormalizationService {

    /**
     * Generates a deterministic hash for deduplication
     */
    static generateDeduplicationHash(amount: number, merchantInfo: string, date: string): string {
        const data = `${amount}_${merchantInfo}_${date}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Tokenizes PII (e.g. replacing names/accounts). Simple placeholder implementation.
     */
    static tokenizePII(userId: string): string {
        return crypto.createHash('sha256').update(userId).digest('hex');
    }

    /**
     * Normalizes raw merchant string using string similarity or regex.
     */
    static normalizeMerchantName(rawMerchant: string): string {
        let normalized = rawMerchant.toUpperCase().replace(/[^A-Z0-9 ]/g, '');

        // Quick heuristic matching
        const knownMerchants = Object.keys(MERCHANT_RULES);
        if (knownMerchants.length > 0) {
            const match = stringSimilarity.findBestMatch(normalized, knownMerchants);
            if (match.bestMatch.rating > 0.8) {
                return match.bestMatch.target;
            }
        }

        return normalized.split(' ')[0] || 'UNKNOWN'; // Take first word as simple fallback
    }

    /**
     * Rule-based category assignment corresponding strictly to Phase 1 & 6.1
     */
    static classifyRuleBased(merchantNormalized: string): { category: any, confidence: number } {
        for (const [pattern, categoryStr] of Object.entries(MERCHANT_RULES)) {
            if (merchantNormalized.includes(pattern)) {
                const parts = categoryStr.split('.');
                return {
                    category: {
                        primary: parts[0],
                        secondary: parts[1],
                        confidence: 0.95,
                        source: 'RULE_BASED'
                    },
                    confidence: 0.95
                };
            }
        }

        // Default unconfident fallback until ML overlay kicks in
        return {
            category: {
                primary: 'Discretionary',
                secondary: 'Other',
                confidence: 0.30,
                source: 'UNKNOWN'
            },
            confidence: 0.30
        };
    }
}
