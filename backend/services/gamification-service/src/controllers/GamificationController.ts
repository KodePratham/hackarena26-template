import { Request, Response } from 'express';
import logger from '../config/logger';
import { ChallengeService } from '../services/ChallengeService';
import { SquadService } from '../services/SquadService';

export class GamificationController {

    // -- Challenges --
    static async getChallenges(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const challenges = await ChallengeService.getChallengesForUser(userId);
            res.status(200).json({ success: true, data: challenges });
        } catch (error) {
            logger.error('Error fetching challenges', error);
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    static async stakeChallenge(req: Request, res: Response): Promise<void> {
        try {
            const { userId, challengeId } = req.params;
            const { amount } = req.body;
            const result = await ChallengeService.stakeOnChallenge(userId, challengeId, amount);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            logger.error('Error staking on challenge', error);
            res.status(400).json({ success: false, error: { message: error.message || 'INTERNAL_ERROR' } });
        }
    }

    static async getChallengeHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const history = await ChallengeService.getHistory(userId);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            logger.error('Error fetching challenge history', error);
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    // -- Squads --
    static async createSquad(req: Request, res: Response): Promise<void> {
        try {
            const { creatorId, name, description, goalAmount, weeklyContribution, seasonDurationDays } = req.body;
            const result = await SquadService.createSquad(creatorId, name, description, goalAmount, weeklyContribution, seasonDurationDays);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            logger.error('Error creating squad', error);
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
        }
    }

    static async joinSquad(req: Request, res: Response): Promise<void> {
        try {
            const { squadId } = req.params;
            const { userId } = req.body;
            const result = await SquadService.joinSquad(squadId, userId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            logger.error('Error joining squad', error);
            res.status(400).json({ success: false, error: { message: error.message || 'INTERNAL_ERROR' } });
        }
    }

    static async getSquad(req: Request, res: Response): Promise<void> {
        try {
            const { squadId } = req.params;
            const result = await SquadService.getSquadDetails(squadId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            logger.error('Error fetching squad details', error);
            res.status(404).json({ success: false, error: { message: error.message || 'NOT_FOUND' } });
        }
    }

    // -- Stubs for Leagues, Badges, Streaks --
    static async getLeague(req: Request, res: Response): Promise<void> {
        // 8.5.1 Mocked League logic
        res.status(200).json({
            success: true,
            data: {
                leagueName: 'Gold Tier',
                rank: 12,
                totalParticipants: 100,
                weeklyPoints: 450
            }
        });
    }

    static async getBadges(req: Request, res: Response): Promise<void> {
        // 8.1.8 Mocked Badges
        res.status(200).json({
            success: true,
            data: [
                { badgeId: 'vital_elite_w1', name: 'Vital Elite - Week 1', earnedAt: new Date().toISOString() },
                { badgeId: 'first_squad', name: 'Team Player', earnedAt: new Date().toISOString() }
            ]
        });
    }

    static async getStreaks(req: Request, res: Response): Promise<void> {
        // 8.1.9 Mocked Streaks 
        res.status(200).json({
            success: true,
            data: {
                currentStreakDays: 14,
                longestStreakDays: 21,
                freezesAvailable: 1
            }
        });
    }

    static async freezeStreak(req: Request, res: Response): Promise<void> {
        // 8.1.10 Mocked Freeze
        res.status(200).json({
            success: true,
            data: { status: 'FROZEN', freezesRemaining: 0, activeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
        });
    }
}
