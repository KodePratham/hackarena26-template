import { Router } from 'express';
import { GamificationController } from '../controllers/GamificationController';

const router = Router();

// Challenges
router.get('/challenges/:userId', GamificationController.getChallenges);
router.post('/challenges/:userId/:challengeId/stake', GamificationController.stakeChallenge);
router.get('/challenges/:userId/history', GamificationController.getChallengeHistory);

// Squads
router.post('/squads', GamificationController.createSquad);
router.post('/squads/:squadId/join', GamificationController.joinSquad);
router.get('/squads/:squadId', GamificationController.getSquad);

// Leagues & Badges (Stubs)
router.get('/leagues/:userId', GamificationController.getLeague);
router.get('/badges/:userId', GamificationController.getBadges);

// Streaks
router.get('/streaks/:userId', GamificationController.getStreaks);
router.post('/streaks/:userId/freeze', GamificationController.freezeStreak);

export default router;
