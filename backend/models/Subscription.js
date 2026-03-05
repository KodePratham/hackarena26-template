import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionName: { type: String, required: true },
    amount: { type: Number, required: true },
    billingDate: { type: Date, required: true },
    recurrenceInterval: { type: Number, default: 1 },
    recurrenceType: { type: String, required: true }, // e.g. "days", "months"
    paymentAccount: { type: String },
    currency: { type: String, default: 'USD ($)' },
    notifyBefore: { type: Boolean, default: false },
    // Optional style fields
    icon: { type: String, default: 'calendar' },
    color: { type: String, default: '#20c997' }
}, { timestamps: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
