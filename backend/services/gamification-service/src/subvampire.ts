/**
 * SubVampire — Ghost Subscription Tracker (FM-02)
 *
 * Identifies ghost subscriptions by analyzing spending patterns.
 * Three-Layer Detection: Rule-based pattern → Groq LLM ghost classifier → User confirmation.
 * Gamification: −3 point penalty per active ghost sub, +3 bonus + 30 XP on cancel.
 *
 * Per VitalScore v4 Final document.
 */
import axios from 'axios';

// ─── Types ──────────────────────────────────────────────────
export interface RecurringPattern {
    id: string;
    merchant: string;
    avgAmount: number;
    intervalDays: number;
    lastDate: string;
    transactionCount: number;
    confidence: number;
    category: string;
}

export interface GhostSubscription {
    id: string;
    merchant: string;
    monthlyAmount: number;
    annualWaste: number;
    ghostScore: number;         // 0 to 100 — higher = more likely ghost
    lastUsedDaysAgo: number;
    status: 'DETECTED' | 'CONFIRMED_GHOST' | 'STILL_USING' | 'CANCELLED' | 'SNOOZED';
    detectedAt: string;
    cancelUrl?: string;
    cancelEmailTemplate?: string;
    scorePenalty: number;       // -3 per active ghost per month
    xpRewardOnCancel: number;  // +30 XP
}

export interface SubVampireResult {
    ghostSubscriptions: GhostSubscription[];
    totalMonthlyWaste: number;
    totalAnnualWaste: number;
    ghostCount: number;
    ghostFreeDays: number;
}

// ─── Known Subscription Merchants (India) ────────────────────
const SUBSCRIPTION_MERCHANTS: Record<string, { cancelUrl?: string; category: string }> = {
    'NETFLIX': { cancelUrl: 'https://www.netflix.com/cancelplan', category: 'Entertainment' },
    'SPOTIFY': { cancelUrl: 'https://accounts.spotify.com/subscription', category: 'Entertainment' },
    'YOUTUBE PREMIUM': { cancelUrl: 'https://myaccount.google.com/subscriptions', category: 'Entertainment' },
    'AMAZON PRIME': { cancelUrl: 'https://www.amazon.in/manageprime', category: 'Entertainment' },
    'DISNEY HOTSTAR': { cancelUrl: 'https://www.hotstar.com/in/account/subscription', category: 'Entertainment' },
    'SONYLIV': { category: 'Entertainment' },
    'ZEE5': { category: 'Entertainment' },
    'JIOCINEMA': { category: 'Entertainment' },
    'APPLE ONE': { category: 'Entertainment' },
    'APPLE MUSIC': { category: 'Entertainment' },
    'GOOGLE ONE': { category: 'Cloud' },
    'ICLOUD': { category: 'Cloud' },
    'DROPBOX': { category: 'Cloud' },
    'LINKEDIN': { cancelUrl: 'https://www.linkedin.com/psettings/manage-premium', category: 'Professional' },
    'CULT.FIT': { category: 'Fitness' },
    'FITTR': { category: 'Fitness' },
    'HEADSPACE': { category: 'Wellness' },
    'CALM': { category: 'Wellness' },
    'CURIOSITY STREAM': { category: 'Education' },
    'SKILLSHARE': { category: 'Education' },
    'AUDIBLE': { category: 'Education' },
    'ADOBE': { category: 'Software' },
    'CANVA': { category: 'Software' },
    'NOTION': { category: 'Software' },
    'TINDER': { category: 'Social' },
    'BUMBLE': { category: 'Social' },
};

// ─── In-memory store ────────────────────────────────────────
const userGhosts: Map<string, GhostSubscription[]> = new Map();

/**
 * Layer 1: Rule-Based Recurring Pattern Extractor
 * Identifies recurring transactions: same merchant, similar amount, regular interval.
 */
export function detectRecurringPatterns(
    transactions: Array<{
        merchant: string;
        amount: number;
        date: string;
        category: string;
    }>
): RecurringPattern[] {
    const patterns: RecurringPattern[] = [];

    // Group transactions by normalized merchant name
    const groups: Map<string, typeof transactions> = new Map();
    for (const txn of transactions) {
        const key = txn.merchant.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 15);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(txn);
    }

    for (const [merchantKey, txnGroup] of groups.entries()) {
        if (txnGroup.length < 2) continue;

        // Sort by date
        txnGroup.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Compute intervals
        const intervals: number[] = [];
        for (let i = 1; i < txnGroup.length; i++) {
            const daysDiff = (new Date(txnGroup[i].date).getTime() - new Date(txnGroup[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);
            intervals.push(Math.round(daysDiff));
        }

        // Check amount variance
        const amounts = txnGroup.map(t => t.amount);
        const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const stddev = Math.sqrt(amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length);
        const amountVariance = stddev / mean;

        // Check if interval is recurring (7, 14, 28, 30, 365 days — ±3 day tolerance)
        const recurringIntervals = [7, 14, 28, 30, 31, 90, 365];
        const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
        const isRecurring = recurringIntervals.some(ri => Math.abs(avgInterval - ri) <= 3);

        if (amountVariance < 0.15 && isRecurring) {
            patterns.push({
                id: `rec_${merchantKey}_${Date.now()}`,
                merchant: txnGroup[0].merchant,
                avgAmount: Math.round(mean),
                intervalDays: Math.round(avgInterval),
                lastDate: txnGroup[txnGroup.length - 1].date,
                transactionCount: txnGroup.length,
                confidence: 0.80,
                category: txnGroup[0].category,
            });
        }
    }

    return patterns;
}

/**
 * Layer 2: Ghost Classifier (Groq LLM)
 * Returns ghost_probability 0.0–1.0
 */
async function classifyGhostGroq(pattern: RecurringPattern, userProfile?: any): Promise<number> {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        // Fallback: simple heuristic based on days since last use
        const daysSinceLast = (Date.now() - new Date(pattern.lastDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLast > 60) return 0.85;
        if (daysSinceLast > 30) return 0.60;
        return 0.30;
    }

    try {
        const prompt = `Subscription: ${pattern.merchant}
Monthly cost: ₹${pattern.avgAmount}
Last charged: ${pattern.lastDate}
Charging frequency: Every ${pattern.intervalDays} days
Category: ${pattern.category}
Transaction count: ${pattern.transactionCount}

Rate the probability (0.0-1.0) that this is a "ghost" subscription the user is paying for but not actively using.
Consider: subscriptions charged monthly but last used 30+ days ago are likely ghosts.
Respond with ONLY a number between 0.0 and 1.0.`;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 10,
                temperature: 0.1
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 2000
            }
        );

        const content = response.data?.choices?.[0]?.message?.content?.trim();
        const score = parseFloat(content || '0.5');
        return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
    } catch {
        // Fallback heuristic
        const daysSinceLast = (Date.now() - new Date(pattern.lastDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLast > 60) return 0.85;
        if (daysSinceLast > 30) return 0.60;
        return 0.30;
    }
}

/**
 * Run SubVampire analysis for a user
 */
export async function analyzeGhostSubscriptions(
    userId: string,
    transactions: Array<{ merchant: string; amount: number; date: string; category: string }>
): Promise<SubVampireResult> {
    // Step 1: Detect recurring patterns
    const patterns = detectRecurringPatterns(transactions);

    // Step 2: Classify each pattern for ghost probability
    const ghosts: GhostSubscription[] = [];

    for (const pattern of patterns) {
        const ghostScore = await classifyGhostGroq(pattern);
        const daysSinceLast = Math.round(
            (Date.now() - new Date(pattern.lastDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (ghostScore >= 0.50) {
            const knownSub = Object.entries(SUBSCRIPTION_MERCHANTS).find(
                ([key]) => pattern.merchant.toUpperCase().includes(key)
            );

            const monthlyAmount = pattern.intervalDays <= 31
                ? pattern.avgAmount
                : Math.round(pattern.avgAmount * (30 / pattern.intervalDays));

            ghosts.push({
                id: pattern.id,
                merchant: pattern.merchant,
                monthlyAmount,
                annualWaste: monthlyAmount * 12,
                ghostScore: Math.round(ghostScore * 100),
                lastUsedDaysAgo: daysSinceLast,
                status: ghostScore >= 0.70 ? 'DETECTED' : 'DETECTED',
                detectedAt: new Date().toISOString(),
                cancelUrl: knownSub?.[1]?.cancelUrl,
                cancelEmailTemplate: generateCancelEmail(pattern.merchant),
                scorePenalty: -3, // per month per active ghost
                xpRewardOnCancel: 30,
            });
        }
    }

    // Store for the user
    userGhosts.set(userId, ghosts);

    const totalMonthly = ghosts.reduce((s, g) => s + g.monthlyAmount, 0);

    return {
        ghostSubscriptions: ghosts.sort((a, b) => b.ghostScore - a.ghostScore),
        totalMonthlyWaste: totalMonthly,
        totalAnnualWaste: totalMonthly * 12,
        ghostCount: ghosts.length,
        ghostFreeDays: calculateGhostFreeDays(userId),
    };
}

/**
 * Handle user action on a ghost subscription
 */
export function handleGhostAction(
    userId: string,
    ghostId: string,
    action: 'CANCEL' | 'STILL_USING' | 'SNOOZE'
): { xpEarned: number; scoreBonus: number; annualSaved: number } {
    const ghosts = userGhosts.get(userId) || [];
    const ghost = ghosts.find(g => g.id === ghostId);

    if (!ghost) return { xpEarned: 0, scoreBonus: 0, annualSaved: 0 };

    switch (action) {
        case 'CANCEL':
            ghost.status = 'CANCELLED';
            return {
                xpEarned: 30,
                scoreBonus: 3, // +3 immediate bonus
                annualSaved: ghost.annualWaste
            };
        case 'STILL_USING':
            ghost.status = 'STILL_USING';
            return { xpEarned: 0, scoreBonus: 0, annualSaved: 0 };
        case 'SNOOZE':
            ghost.status = 'SNOOZED';
            return { xpEarned: 0, scoreBonus: 0, annualSaved: 0 };
    }
}

/**
 * Get ghost subscriptions for a user
 */
export function getUserGhosts(userId: string): GhostSubscription[] {
    return userGhosts.get(userId) || [];
}

function generateCancelEmail(merchant: string): string {
    return `Subject: Cancellation Request — ${merchant} Subscription

Dear ${merchant} Support,

I would like to cancel my subscription effective immediately. Please confirm the cancellation and ensure no further charges are made to my account.

Thank you.`;
}

function calculateGhostFreeDays(userId: string): number {
    const ghosts = userGhosts.get(userId) || [];
    const activeGhosts = ghosts.filter(g => g.status === 'DETECTED' || g.status === 'SNOOZED');
    return activeGhosts.length === 0 ? 30 : 0; // Simplified — would track actual streak in production
}
