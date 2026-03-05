import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import { EscrowService } from './EscrowService';

export class ChallengeService {

    /**
     * 8.1.1 GET /challenges/{userId}
     * 8.2 Weekly challenge generation logic
     */
    static async getChallengesForUser(userId: string) {
        const res = await pool.query('SELECT * FROM challenges WHERE "userId" = $1 AND status = \'ACTIVE\'', [userId]);

        if (res.rows.length === 0) {
            return await this.generateWeeklyChallenges(userId);
        }
        return res.rows;
    }

    static async generateWeeklyChallenges(userId: string) {
        logger.info(`Generating personalized weekly challenges for ${userId}`);
        // 8.2.1 Generate exactly 3 personalized challenges
        // 8.2.3 REDUCE_CATEGORY, 8.2.4 SAVINGS_VELOCITY, 8.2.5 BUILD_EMERGENCY_FUND

        const newChallenges = [
            {
                challengeId: uuidv4(),
                userId,
                type: 'REDUCE_CATEGORY',
                difficulty: 'Medium',
                targetValue: 20, // 20% reduction target
                details: JSON.stringify({ category: 'Discretionary.DiningOut' }),
                status: 'ACTIVE',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                challengeId: uuidv4(),
                userId,
                type: 'SAVINGS_VELOCITY',
                difficulty: 'Easy',
                targetValue: 10,
                details: JSON.stringify({}),
                status: 'ACTIVE',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                challengeId: uuidv4(),
                userId,
                type: 'BUILD_EMERGENCY_FUND',
                difficulty: 'Hard',
                targetValue: 1000,
                details: JSON.stringify({}),
                status: 'ACTIVE',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        for (const c of newChallenges) {
            await pool.query(
                'INSERT INTO challenges ("challengeId", "userId", type, difficulty, "targetValue", details, status, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [c.challengeId, c.userId, c.type, c.difficulty, c.targetValue, c.details, c.status, c.deadline]
            );
        }

        return newChallenges;
    }

    /**
     * 8.1.2 & 8.4 POST /challenges/{userId}/stake
     */
    static async stakeOnChallenge(userId: string, challengeId: string, amount: number) {
        if (amount < 50 || amount > 1000) {
            throw new Error('Stake must be between ₹50 and ₹1000');
        }

        const challengeRes = await pool.query('SELECT status FROM challenges WHERE "challengeId" = $1 AND "userId" = $2', [challengeId, userId]);
        if (challengeRes.rows.length === 0 || challengeRes.rows[0].status !== 'ACTIVE') {
            throw new Error('Challenge not active or not found');
        }

        const txId = await EscrowService.lockStake(userId, challengeId, amount);

        await pool.query(
            'UPDATE challenges SET "stakeAmount" = $1, "updatedAt" = NOW() WHERE "challengeId" = $2 AND "userId" = $3',
            [amount, challengeId, userId]
        );

        return { status: 'STAKED', txId, amount };
    }

    /**
     * 8.1.3 GET /challenges/{userId}/history
     */
    static async getHistory(userId: string) {
        const res = await pool.query('SELECT * FROM challenges WHERE "userId" = $1 AND status != \'ACTIVE\' ORDER BY deadline DESC', [userId]);
        return res.rows;
    }

    /**
     * Mock utility to resolve a challenge
     */
    static async resolveChallenge(userId: string, challengeId: string, success: boolean) {
        const res = await pool.query('SELECT "stakeAmount" FROM challenges WHERE "challengeId" = $1 AND "userId" = $2', [challengeId, userId]);
        if (res.rows.length === 0) return null;

        const stakeAmount = res.rows[0].stakeAmount || 0;

        let payout = {};
        if (stakeAmount > 0) {
            payout = await EscrowService.unlockStake(userId, challengeId, success, stakeAmount);
        }

        const newStatus = success ? 'COMPLETED' : 'FAILED';
        const pointsAwarded = success ? 50 : 0;

        await pool.query(
            'UPDATE challenges SET status = $1, "pointsAwarded" = $2, "updatedAt" = NOW() WHERE "challengeId" = $3 AND "userId" = $4',
            [newStatus, pointsAwarded, challengeId, userId]
        );

        return { status: newStatus, payout, pointsAwarded };
    }
}
