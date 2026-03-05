import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import logger from '../config/logger';
import { ScoreCalculationService } from '../services/ScoreCalculationService';

export class ScoreController {

    static async getScore(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            // Pull latest from DB, if stale or requested, recalculate
            const latestSnapshot = await pool.query(
                'SELECT * FROM score_snapshots WHERE "userId" = $1 ORDER BY timestamp DESC LIMIT 1',
                [userId]
            );

            res.status(200).json({
                success: true,
                data: latestSnapshot.rows[0] || null
            });
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    static async recalculateScore(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const result = await ScoreCalculationService.calculateVitalScore(userId);

            if (result.status === 'NO_DATA') {
                res.status(400).json({
                    success: false,
                    error: { code: 'INSUFFICIENT_DATA', message: 'Not enough data to calculate score yet.' }
                });
                return;
            }

            // Persist new snapshot
            const snapshotId = uuidv4();
            await pool.query(
                `INSERT INTO score_snapshots ("snapshotId", "userId", timestamp, "periodType", score, band, components)
         VALUES ($1, $2, NOW(), $3, $4, $5, $6)`,
                [snapshotId, userId, 'REALTIME', result.score, result.band, JSON.stringify(result.components)]
            );

            res.status(200).json({
                success: true,
                data: {
                    score: result.score,
                    band: result.band,
                    components: result.components
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    static async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const history = await pool.query(
                'SELECT timestamp, score, band, trajectory FROM score_snapshots WHERE "userId" = $1 ORDER BY timestamp ASC',
                [userId]
            );

            res.status(200).json({ success: true, data: history.rows });
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    static async getForecast(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const forecast = await ScoreCalculationService.generateForecast(userId);
            res.status(200).json({ success: true, data: forecast });
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    static async getBreakdown(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const snapshot = await pool.query(
                'SELECT components FROM score_snapshots WHERE "userId" = $1 ORDER BY timestamp DESC LIMIT 1',
                [userId]
            );

            res.status(200).json({ success: true, data: snapshot.rows[0]?.components });
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    static async toggleEmergency(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            // In reality, updates user profile flag
            res.status(200).json({ success: true, data: { status: 'EMERGENCY_MODE_ACTIVATED' } });
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }
}
