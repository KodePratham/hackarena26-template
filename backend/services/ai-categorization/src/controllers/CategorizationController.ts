import { Request, Response } from 'express';
import logger from '../config/logger';
import { CategorizationService } from '../services/CategorizationService';

export class CategorizationController {

    static async categorize(req: Request, res: Response): Promise<void> {
        try {
            const { description, amount, userId } = req.body;

            if (!description || typeof amount !== 'number') {
                res.status(400).json({ success: false, error: { message: 'Missing description or amount' } });
                return;
            }

            const result = await CategorizationService.categorizeTransaction(description, amount, userId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            logger.error('Error categorizing transaction', error);
            res.status(500).json({ success: false, error: { message: 'INTERNAL_ERROR' } });
        }
    }

    static async categorizeBatch(req: Request, res: Response): Promise<void> {
        try {
            const { transactions } = req.body;
            if (!Array.isArray(transactions)) {
                res.status(400).json({ success: false, error: { message: 'Transactions must be an array' } });
                return;
            }

            const results = await Promise.all(
                transactions.map(t => CategorizationService.categorizeTransaction(t.description, t.amount, t.userId))
            );

            res.status(200).json({ success: true, data: results });
        } catch (error: any) {
            logger.error('Error in batch categorization', error);
            res.status(500).json({ success: false, error: { message: 'INTERNAL_ERROR' } });
        }
    }

    static async syncFederated(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { weights } = req.body;

            const result = await CategorizationService.syncFederatedWeights(userId, weights);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            logger.error('Error syncing federated data', error);
            res.status(500).json({ success: false, error: { message: 'INTERNAL_ERROR' } });
        }
    }
}
