import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';

const router = Router();

router.post('/connections', TransactionController.createConnection);
router.get('/connections/:userId', TransactionController.getConnections);
router.post('/manual', TransactionController.addManualTransaction);
router.get('/:userId', TransactionController.getTransactions);
router.patch('/:txnId/category', TransactionController.overrideCategory);

export default router;
