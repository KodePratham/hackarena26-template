import { Router } from 'express';
import { CategorizationController } from '../controllers/CategorizationController';

const router = Router();

router.post('/categorize', CategorizationController.categorize);
router.post('/categorize/batch', CategorizationController.categorizeBatch);
router.post('/federated/sync/:userId', CategorizationController.syncFederated);

export default router;
