import cron from 'node-cron';
import { Subscription } from '../models/Subscription.js';
import { sendEmailNotification } from '../utils/emailService.js';
import { sendWhatsAppNotification } from '../utils/whatsappService.js';

// Calculate days difference (ignoring time)
const getDaysDifference = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billing = new Date(targetDate);
    billing.setHours(0, 0, 0, 0);
    const diffTime = billing - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const startNotificationJob = () => {
    // Run every day at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('⏰ Running daily subscription notification job...');
        try {
            // Find subscriptions where notifyBefore is true
            // Also explicitly populate the user details
            const subscriptions = await Subscription.find({ notifyBefore: true }).populate('userId');

            for (const sub of subscriptions) {
                if (!sub.userId) continue; // Skip if user was deleted

                const daysLeft = getDaysDifference(sub.billingDate);

                // User requested trigger on 5, 3, and 1 days before expiry
                if (daysLeft === 5 || daysLeft === 3 || daysLeft === 1) {
                    const user = sub.userId;

                    const subject = `Reminder: Your ${sub.subscriptionName} subscription is renewing soon!`;
                    const message = `Hi ${user.name},\n\nYour subscription to **${sub.subscriptionName}** is going to finish in ${daysLeft} days.\n\nDo you want to renew it? If you want to renew or already renewed, please ignore this message. If you don't wish to renew, please update your preferences on our website.\n\nCancel Autopay / Manage Subscriptions: http://localhost:3000\n\nThank you for choosing Vampire Vault!`;
                    const htmlMessage = `
                        <h3>Hi ${user.name},</h3>
                        <p>Your subscription to <strong>${sub.subscriptionName}</strong> is going to finish in <strong>${daysLeft} days</strong>.</p>
                        <p>Do you want to renew it? If you want to renew or already renewed, please ignore this message. If you don't wish to renew, please update your preferences on our website.</p>
                        <a href="http://localhost:3000" style="display:inline-block;padding:10px 20px;background-color:#e11d48;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">Manage or Cancel Subscription</a>
                        <br/><br/>
                        <p>Thank you for choosing Vampire Vault!</p>
                    `;

                    // Send Email
                    await sendEmailNotification(user.email, subject, message, htmlMessage);

                    // Send WhatsApp
                    await sendWhatsAppNotification(user.mobile, message);
                }
            }
            console.log('✅ Daily notification job completed.');
        } catch (error) {
            console.error('❌ Error running notification cron job:', error);
        }
    });

    console.log('📅 Notification cron job initialized (Runs daily at 08:00 AM)');
};
