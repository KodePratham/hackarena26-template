/**
 * Layer 4 — Behavioural Memory Engine
 * A user's past behaviour with the same merchant is the strongest predictor.
 * Uses Personal Merchant Dictionary built from user confirmations.
 * Trust threshold: ≥3 confirmations AND last seen within 90 days.
 * Confidence: 0.93–0.96
 */
import { ClassificationResult } from './layer1_merchant_db';

// ─── In-Memory Personal Merchant Dictionary ─────────────────
// In production, this would be backed by PostgreSQL/Redis.
// For now, we use an in-memory store per-process.

interface PersonalMerchantEntry {
    category: string;
    confirmationCount: number;
    lastSeenDate: Date;
    createdAt: Date;
}

interface AmountPattern {
    category: string;
    amountMin: number;
    amountMax: number;
    vpaPrefix?: string;
    dayOfMonth?: number;
    confirmationCount: number;
}

// userId → normalized_merchant_key → entry
const personalDictionary: Map<string, Map<string, PersonalMerchantEntry>> = new Map();
// userId → amount patterns
const amountPatterns: Map<string, AmountPattern[]> = new Map();

/**
 * Normalize merchant key for consistent lookup
 */
function normalizeMerchantKey(merchantName: string, vpa?: string): string {
    const namePart = merchantName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 20);
    const vpaPart = vpa ? vpa.split('@')[0].toLowerCase() : '';
    return `${namePart}__${vpaPart}`;
}

/**
 * Record a user's category confirmation (called when user confirms/overrides)
 */
export function recordConfirmation(
    userId: string,
    merchantName: string,
    category: string,
    amount: number,
    vpa?: string,
    dayOfMonth?: number
): void {
    const key = normalizeMerchantKey(merchantName, vpa);

    if (!personalDictionary.has(userId)) {
        personalDictionary.set(userId, new Map());
    }
    const userDict = personalDictionary.get(userId)!;

    if (userDict.has(key)) {
        const entry = userDict.get(key)!;
        entry.category = category;
        entry.confirmationCount++;
        entry.lastSeenDate = new Date();
    } else {
        userDict.set(key, {
            category,
            confirmationCount: 1,
            lastSeenDate: new Date(),
            createdAt: new Date()
        });
    }

    // Also build amount patterns for recurrent transfers
    if (!amountPatterns.has(userId)) {
        amountPatterns.set(userId, []);
    }
    const patterns = amountPatterns.get(userId)!;

    // Check if we already have a pattern for this amount range + VPA
    const existing = patterns.find(p =>
        Math.abs(p.amountMin - amount) / amount < 0.15 &&
        p.vpaPrefix === (vpa ? vpa.split('@')[0] : undefined) &&
        p.category === category
    );

    if (existing) {
        existing.confirmationCount++;
        existing.amountMin = Math.min(existing.amountMin, amount * 0.85);
        existing.amountMax = Math.max(existing.amountMax, amount * 1.15);
    } else {
        patterns.push({
            category,
            amountMin: amount * 0.85,
            amountMax: amount * 1.15,
            vpaPrefix: vpa ? vpa.split('@')[0] : undefined,
            dayOfMonth,
            confirmationCount: 1
        });
    }
}

/**
 * Layer 4: Behavioural Memory Lookup
 */
export function layer4Memory(
    userId: string,
    merchantName: string,
    amount: number,
    vpa?: string,
    dayOfMonth?: number
): ClassificationResult | null {
    // Step 1: Personal Merchant Dictionary lookup
    if (personalDictionary.has(userId)) {
        const userDict = personalDictionary.get(userId)!;
        const key = normalizeMerchantKey(merchantName, vpa);

        if (userDict.has(key)) {
            const entry = userDict.get(key)!;
            const daysSinceLastSeen = (Date.now() - entry.lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);

            // Only trust if confirmed ≥3 times AND last seen within 90 days
            if (entry.confirmationCount >= 3 && daysSinceLastSeen < 90) {
                return {
                    category: entry.category,
                    confidence: 0.96,
                    method: 'personal_memory',
                    layer: 4
                };
            }
            // Lower confidence if fewer confirmations but still recent
            if (entry.confirmationCount >= 1 && daysSinceLastSeen < 30) {
                return {
                    category: entry.category,
                    confidence: 0.88,
                    method: 'personal_memory_weak',
                    layer: 4
                };
            }
        }
    }

    // Step 2: Amount-bracket pattern memory
    if (amountPatterns.has(userId)) {
        const patterns = amountPatterns.get(userId)!;
        for (const pattern of patterns) {
            const amountMatches = amount >= pattern.amountMin && amount <= pattern.amountMax;
            const vpaMatches = !pattern.vpaPrefix || (vpa && vpa.startsWith(pattern.vpaPrefix));
            const dayMatches = !pattern.dayOfMonth || pattern.dayOfMonth === dayOfMonth;

            if (amountMatches && vpaMatches && dayMatches && pattern.confirmationCount >= 2) {
                return {
                    category: pattern.category,
                    confidence: 0.93,
                    method: 'amount_pattern_memory',
                    layer: 4
                };
            }
        }
    }

    return null; // Pass to Layer 5 — Smart Nudge
}

/**
 * Get user's personal dictionary stats (for debugging/admin)
 */
export function getUserDictionaryStats(userId: string): {
    merchantCount: number;
    patternCount: number;
    topMerchants: Array<{ key: string; category: string; count: number }>;
} {
    const userDict = personalDictionary.get(userId);
    const patterns = amountPatterns.get(userId) || [];

    if (!userDict) {
        return { merchantCount: 0, patternCount: patterns.length, topMerchants: [] };
    }

    const topMerchants = Array.from(userDict.entries())
        .map(([key, entry]) => ({ key, category: entry.category, count: entry.confirmationCount }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        merchantCount: userDict.size,
        patternCount: patterns.length,
        topMerchants
    };
}
