/**
 * SplitSync Social — Group Bill Settlement (FM-01)
 *
 * Data models and service stubs for group bill splitting.
 * Integrates with Squad formation funnel and gamification.
 * Full UPI/WhatsApp integration is Phase 2.
 *
 * Per VitalScore v4 Final document.
 */

// ─── Types ──────────────────────────────────────────────────
export interface Split {
    id: string;
    payerUserId: string;
    payerName: string;
    totalAmount: number;
    currency: string;
    description: string;
    merchant?: string;
    participants: SplitParticipant[];
    status: 'PENDING' | 'PARTIAL' | 'SETTLED' | 'TIMEOUT' | 'CANCELLED';
    createdAt: string;
    deadline: string; // 30 min timeout by default
    algoContractId?: string;
    xpRewardPerPerson: number;
}

export interface SplitParticipant {
    userId: string;
    name: string;
    amountOwed: number;
    paidStatus: 'UNPAID' | 'PAID' | 'CONFIRMED';
    paidAt?: string;
}

export interface SplitSyncStats {
    totalSplits: number;
    settledSplits: number;
    onTimeRate: number;
    totalSettled: number;
    splitStreak: number; // consecutive on-time settlements
}

// ─── In-memory store ────────────────────────────────────────
const userSplits: Map<string, Split[]> = new Map();
const userStats: Map<string, SplitSyncStats> = new Map();

/**
 * Create a new split
 */
export function createSplit(
    payerUserId: string,
    payerName: string,
    totalAmount: number,
    description: string,
    participants: Array<{ userId: string; name: string; amount: number }>,
    merchant?: string
): Split {
    const split: Split = {
        id: `split_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        payerUserId,
        payerName,
        totalAmount,
        currency: 'INR',
        description,
        merchant,
        participants: participants.map(p => ({
            userId: p.userId,
            name: p.name,
            amountOwed: p.amount,
            paidStatus: 'UNPAID',
        })),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min timeout
        xpRewardPerPerson: 15,
    };

    // Store for payer
    if (!userSplits.has(payerUserId)) userSplits.set(payerUserId, []);
    userSplits.get(payerUserId)!.push(split);

    // Store for each participant
    for (const p of participants) {
        if (!userSplits.has(p.userId)) userSplits.set(p.userId, []);
        userSplits.get(p.userId)!.push(split);
    }

    return split;
}

/**
 * Record a participant's payment
 */
export function recordPayment(
    splitId: string,
    participantUserId: string
): { success: boolean; split: Split | null; xpEarned: number } {
    // Find the split across all users
    for (const [, splits] of userSplits) {
        const split = splits.find(s => s.id === splitId);
        if (split) {
            const participant = split.participants.find(p => p.userId === participantUserId);
            if (participant && participant.paidStatus === 'UNPAID') {
                participant.paidStatus = 'PAID';
                participant.paidAt = new Date().toISOString();

                // Check if all paid
                const allPaid = split.participants.every(p => p.paidStatus === 'PAID');
                if (allPaid) {
                    split.status = 'SETTLED';
                } else {
                    split.status = 'PARTIAL';
                }

                return { success: true, split, xpEarned: 15 };
            }
        }
    }

    return { success: false, split: null, xpEarned: 0 };
}

/**
 * Get splits for a user
 */
export function getUserSplits(userId: string): Split[] {
    return userSplits.get(userId) || [];
}

/**
 * Get active (pending) splits for a user
 */
export function getActiveSplits(userId: string): Split[] {
    const splits = userSplits.get(userId) || [];
    return splits.filter(s => s.status === 'PENDING' || s.status === 'PARTIAL');
}

/**
 * Get SplitSync stats for a user (used in SBT metadata)
 */
export function getSplitStats(userId: string): SplitSyncStats {
    const splits = userSplits.get(userId) || [];
    const settled = splits.filter(s => s.status === 'SETTLED');
    const totalAmount = settled.reduce((sum, s) => sum + s.totalAmount, 0);

    return {
        totalSplits: splits.length,
        settledSplits: settled.length,
        onTimeRate: splits.length > 0 ? settled.length / splits.length : 1.0,
        totalSettled: totalAmount,
        splitStreak: calculateSplitStreak(splits),
    };
}

function calculateSplitStreak(splits: Split[]): number {
    let streak = 0;
    const sortedSettled = splits
        .filter(s => s.status === 'SETTLED')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const s of sortedSettled) {
        // Check if settled within 24h of creation
        const settleTime = Math.max(
            ...s.participants
                .filter(p => p.paidAt)
                .map(p => new Date(p.paidAt!).getTime())
        );
        const createTime = new Date(s.createdAt).getTime();
        if ((settleTime - createTime) / (1000 * 60 * 60) <= 24) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}
