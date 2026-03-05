import express from 'express';
import { Subscription } from '../models/Subscription.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply verifyToken middleware to all routes in this file
router.use(verifyToken);

// Create a new subscription
router.post('/', async (req, res) => {
    try {
        const {
            subscriptionName, amount, billingDate, recurrenceInterval,
            recurrenceType, paymentAccount, currency, notifyBefore, icon, color
        } = req.body;

        const newSub = new Subscription({
            userId: req.user.id,
            subscriptionName,
            amount: parseFloat(amount),
            billingDate,
            recurrenceInterval: parseInt(recurrenceInterval) || 1,
            recurrenceType,
            paymentAccount,
            currency,
            notifyBefore,
            icon,
            color
        });

        const savedSub = await newSub.save();
        res.status(201).json(savedSub);
    } catch (error) {
        console.error("Add Subscription Error:", error);
        res.status(500).json({ error: 'Failed to add subscription' });
    }
});

// Get all subscriptions for the logged-in user
router.get('/', async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user.id }).sort({ billingDate: 1 });
        res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Get Subscriptions Error:", error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Delete a subscription
router.delete('/:id', async (req, res) => {
    try {
        const subId = req.params.id;
        // Ensure the subscription belongs to the user securely
        const deletedSub = await Subscription.findOneAndDelete({ _id: subId, userId: req.user.id });

        if (!deletedSub) {
            return res.status(404).json({ error: 'Subscription not found or unauthorized' });
        }

        res.status(200).json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error("Delete Subscription Error:", error);
        res.status(500).json({ error: 'Failed to delete subscription' });
    }
});

export default router;
