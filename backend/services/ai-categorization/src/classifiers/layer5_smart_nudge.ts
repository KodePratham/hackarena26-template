/**
 * Layer 5 — Smart Nudge: Transaction-Triggered
 * Fired when confidence < 0.88 after all layers.
 * Generates a pre-answered nudge with the model's best guess.
 * User confirms with one tap (+12 XP for Accuracy Streak).
 */
import { ClassificationResult } from './layer1_merchant_db';

export interface SmartNudge {
    transactionId: string;
    merchantName: string;
    amount: number;
    suggestedCategory: string;
    suggestedConfidence: number;
    alternativeCategories: string[];
    createdAt: string;
    expiresAt: string;
    xpReward: number;
    status: 'PENDING' | 'CONFIRMED' | 'CORRECTED' | 'EXPIRED';
}

// In-memory nudge store (would be Redis/DB in production)
const pendingNudges: Map<string, SmartNudge[]> = new Map();

// Common categories for the tag grid
const CATEGORY_OPTIONS = [
    'Essential.Housing', 'Essential.Groceries', 'Essential.Utilities',
    'Essential.Transportation', 'Essential.Healthcare', 'Essential.Education',
    'Essential.Insurance', 'Essential.EMI',
    'Discretionary.DiningOut', 'Discretionary.Shopping', 'Discretionary.Entertainment',
    'Discretionary.Travel', 'Discretionary.PersonalCare', 'Discretionary.Fitness',
    'Savings.Investment', 'Obligation.BNPL', 'Other.Donation', 'Other.Transfer',
];

/**
 * Layer 5: Generate a Smart Nudge for user confirmation
 * Called when all layers return confidence < 0.88
 */
export function layer5GenerateNudge(
    userId: string,
    transactionId: string,
    merchantName: string,
    amount: number,
    bestGuess?: ClassificationResult | null
): SmartNudge {
    // Generate pre-answered suggestion
    const suggestedCategory = bestGuess?.category || 'Uncategorized';
    const suggestedConfidence = bestGuess?.confidence || 0;

    // Build alternative categories list (top 5 most likely, excluding the suggestion)
    const alternatives = selectAlternatives(suggestedCategory, amount);

    const nudge: SmartNudge = {
        transactionId,
        merchantName,
        amount,
        suggestedCategory,
        suggestedConfidence,
        alternativeCategories: alternatives,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2-hour window
        xpReward: 12, // +12 XP per confirmation
        status: 'PENDING',
    };

    // Store nudge for the user
    if (!pendingNudges.has(userId)) {
        pendingNudges.set(userId, []);
    }
    pendingNudges.get(userId)!.push(nudge);

    return nudge;
}

/**
 * Select alternative categories based on amount heuristics
 */
function selectAlternatives(suggestedCategory: string, amount: number): string[] {
    const alts: string[] = [];

    if (amount > 10000) {
        alts.push('Essential.Housing', 'Savings.Investment', 'Essential.EMI');
    } else if (amount > 2000) {
        alts.push('Essential.Groceries', 'Discretionary.Shopping', 'Essential.Utilities');
    } else if (amount > 500) {
        alts.push('Discretionary.DiningOut', 'Essential.Transportation', 'Discretionary.Entertainment');
    } else {
        alts.push('Essential.Groceries', 'Discretionary.DiningOut', 'Essential.Transportation');
    }

    // Filter out the suggested category and return unique top 5
    return [...new Set(alts.filter(a => a !== suggestedCategory))].slice(0, 5);
}

/**
 * Get all pending nudges for a user
 */
export function getPendingNudges(userId: string): SmartNudge[] {
    const nudges = pendingNudges.get(userId) || [];
    return nudges.filter(n => n.status === 'PENDING');
}

/**
 * Resolve a nudge (user confirmed or corrected)
 */
export function resolveNudge(
    userId: string,
    transactionId: string,
    confirmedCategory: string,
    isCorrection: boolean
): { xpEarned: number; isStreakActive: boolean } {
    const nudges = pendingNudges.get(userId) || [];
    const nudge = nudges.find(n => n.transactionId === transactionId);

    if (nudge) {
        nudge.status = isCorrection ? 'CORRECTED' : 'CONFIRMED';
    }

    return {
        xpEarned: 12,
        isStreakActive: true // Accuracy Streak: 7-day streak earns "Sharp Eye" badge
    };
}

/**
 * Get nudge stats for a user
 */
export function getNudgeStats(userId: string): {
    totalNudges: number;
    confirmed: number;
    corrected: number;
    pending: number;
    accuracyStreak: number;
} {
    const nudges = pendingNudges.get(userId) || [];
    return {
        totalNudges: nudges.length,
        confirmed: nudges.filter(n => n.status === 'CONFIRMED').length,
        corrected: nudges.filter(n => n.status === 'CORRECTED').length,
        pending: nudges.filter(n => n.status === 'PENDING').length,
        accuracyStreak: calculateAccuracyStreak(nudges),
    };
}

function calculateAccuracyStreak(nudges: SmartNudge[]): number {
    let streak = 0;
    const resolved = nudges
        .filter(n => n.status !== 'PENDING')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const n of resolved) {
        const ageHours = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60);
        if (ageHours <= 2) { // Confirmed within 2 hours
            streak++;
        } else {
            break;
        }
    }
    return streak;
}
