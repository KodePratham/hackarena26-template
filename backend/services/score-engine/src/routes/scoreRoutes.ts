import { Router } from 'express';
import { ScoreController } from '../controllers/ScoreController';

const router = Router();

router.get('/:userId', ScoreController.getScore);
router.get('/:userId/history', ScoreController.getHistory);
router.get('/:userId/forecast', ScoreController.getForecast);
router.get('/:userId/breakdown', ScoreController.getBreakdown);
router.post('/:userId/recalculate', ScoreController.recalculateScore);
router.post('/:userId/emergency', ScoreController.toggleEmergency);

export default router;
