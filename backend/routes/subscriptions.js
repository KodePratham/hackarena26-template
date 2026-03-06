import express from 'express';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { sendEmailNotification } from '../utils/emailService.js';
import { sendWhatsAppNotification } from '../utils/whatsappService.js';

const router = express.Router();

// Apply verifyToken middleware to all routes in this file
router.use(verifyToken);

// Create a new subscription
router.post('/', async (req, res) => {
    try {
        const {
            subscriptionName, amount, billingDate, recurrenceInterval,
            recurrenceType, paymentAccount, currency, notifyBefore, icon, color,
            hasFreeTrial, freeTrialEndDate
        } = req.body;

        const newSub = new Subscription({
            userId: req.user.id,
            subscriptionName,
            amount: parseFloat(amount),
            billingDate,
            recurrenceInterval: parseInt(recurrenceInterval) || 1,
            recurrenceType,
            paymentAccount,
            currency: currency || 'INR (₹)',
            notifyBefore,
            icon,
            color,
            hasFreeTrial: hasFreeTrial || false,
            freeTrialEndDate: freeTrialEndDate || null
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

// Toggle notify status
router.patch('/:id/toggle-notify', async (req, res) => {
    try {
        const subId = req.params.id;
        const { notifyBefore } = req.body;

        const updatedSub = await Subscription.findOneAndUpdate(
            { _id: subId, userId: req.user.id },
            { notifyBefore },
            { new: true }
        );

        if (!updatedSub) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.status(200).json(updatedSub);
    } catch (error) {
        console.error("Toggle Notify Error:", error);
        res.status(500).json({ error: 'Failed to update notification preferences' });
    }
});

// Test notification
router.post('/:id/test-notification', async (req, res) => {
    try {
        const subId = req.params.id;
        const sub = await Subscription.findOne({ _id: subId, userId: req.user.id });
        if (!sub) return res.status(404).json({ error: 'Subscription not found' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const daysLeft = 3; // Mocking 3 days for the test notification

        const subject = `Test Reminder: Your ${sub.subscriptionName} subscription is renewing soon!`;
        const message = `Thank you for choosing Vampire Vault!\nYou will be notified a few days before your plan expires.`;
        const htmlMessage = `
            <h3>Hi ${user.name},</h3>
            <p><strong>Thank you for choosing Vampire Vault!</strong></p>
            <p>You will be notified a few days before your plan expires.</p>
        `;

        const emailSent = await sendEmailNotification(user.email, subject, message, htmlMessage);
        const whatsappSent = await sendWhatsAppNotification(user.mobile, message);

        res.status(200).json({
            message: 'Test notifications triggered',
            details: { emailSent, whatsappSent }
        });
    } catch (error) {
        console.error("Test Notification Error:", error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

export default router;
