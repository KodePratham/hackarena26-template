import pool from '../config/database';
import logger from '../config/logger';

export interface ScoreResult {
    score: number | null;
    band: string;
    components: any;
    status?: string;
}

export class ScoreCalculationService {

    static classifyBand(score: number): string {
        if (score >= 800) return 'VITAL_ELITE';
        if (score >= 600) return 'VITAL_STRONG';
        if (score >= 400) return 'VITAL_WARNING';
        if (score >= 200) return 'VITAL_CRITICAL';
        return 'VITAL_EMERGENCY';
    }

    static async getOutstandingHighInterestDebt(userId: string): Promise<number> {
        // Hackathon stub: assuming basic query or 0
        return 0;
    }

    static async getCategoryInflationAdjustment(userId: string): Promise<number> {
        // Hackathon stub
        return 0;
    }

    static async calculateStreakBonus(userId: string): Promise<number> {
        const res = await pool.query('SELECT streak_days FROM streak_tracking WHERE "userId" = $1', [userId]);
        const days = res.rows[0]?.streak_days || 0;
        // max +50 derived from months (roughly +10 per month)
        return Math.min(50, Math.floor(days / 30) * 10);
    }

    static async calculateChallengeBonus(userId: string): Promise<number> {
        // Basic logic based on active/completed challenges could go here. Max 30.
        return 15;
    }

    /**
     * Main calculation formula as defined in design.md
     * S' = 60 × (E / E+D) + 40 × (I − (E+D) / I)
     */
    static async calculateVitalScore(userId: string, period: string = 'rolling_3month'): Promise<ScoreResult> {
        try {
            // 1. Fetch data. In a real environment, we compute rolling averages.
            // For immediate stub, fetch sums per category:
            const incomeRes = await pool.query('SELECT "declaredMonthlyIncome" FROM user_profiles WHERE "userId" = $1', [userId]);
            const I = incomeRes.rows[0]?.declaredMonthlyIncome || 0;

            if (I === 0) {
                return { score: null, band: 'UNKNOWN', components: {}, status: 'NO_DATA' };
            }

            const txnsRes = await pool.query(
                'SELECT amount, category FROM transaction_records WHERE "userToken" = (SELECT "userToken" FROM user_tokens WHERE "userId" = $1 LIMIT 1)', // Simplified join mock
                [userId]
            );

            let E = 0;
            let D = 0;

            for (const row of txnsRes.rows) {
                // Simplified parsing
                const parsedCat = typeof row.category === 'string' ? JSON.parse(row.category) : row.category;
                if (parsedCat.primary === 'Essential') {
                    E += parseFloat(row.amount);
                } else if (parsedCat.primary === 'Discretionary') {
                    D += parseFloat(row.amount);
                }
            }

            let necessityRatio = 1.0;
            let savingsRatio = 1.0;

            if (E + D > 0) {
                necessityRatio = E / (E + D);
                savingsRatio = (I - (E + D)) / I;
            }

            // Clamp savings ratio (overspend scenario)
            savingsRatio = Math.max(-0.5, savingsRatio);

            // Base score formula
            const alpha = 0.60;
            const beta = 0.40;
            const rawScore = (alpha * necessityRatio + beta * savingsRatio) * 1000;

            // Penalties & Bonuses
            const debt = await this.getOutstandingHighInterestDebt(userId);
            const debtPenalty = debt > 0 ? Math.min(100, (0.10 * (debt / I)) * 1000) : 0;
            const streakBonus = await this.calculateStreakBonus(userId);
            const challengeBonus = await this.calculateChallengeBonus(userId);
            const inflationAdj = await this.getCategoryInflationAdjustment(userId);

            // Final score calculation
            let finalScore = rawScore - debtPenalty + streakBonus + challengeBonus + inflationAdj;
            finalScore = Math.max(0, Math.min(1000, finalScore)); // Clamp to 0-1000

            const roundedScore = Math.round(finalScore);
            const band = this.classifyBand(roundedScore);

            const components = {
                necessityRatio,
                savingsRatio,
                debtPenalty,
                streakBonus,
                challengeBonus,
                inflationAdjustment: inflationAdj
            };

            return {
                score: roundedScore,
                band,
                components
            };

        } catch (error) {
            logger.error('Score calculation failed', error);
            throw error;
        }
    }

    static async generateForecast(userId: string): Promise<any> {
        // 30 day forecast stub
        return {
            currentPatternDetails: { projectedScore: 720 },
            optimizedScenario: { projectedScore: 755 },
            daysForward: 30
        }
    }
}
