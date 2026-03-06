import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const client = accountSid && accountSid.startsWith('AC') && authToken ? twilio(accountSid, authToken) : null;

export const sendWhatsAppNotification = async (to, message) => {
    // Basic phone number formatting assuming India or format it properly
    // Twilio WhatsApp numbers must be in the format 'whatsapp:+1234567890'
    let formattedTo = to.startsWith('+') ? to : `+91${to}`; // Defaulting to +91 if no code provided
    if (!formattedTo.startsWith('whatsapp:')) {
        formattedTo = `whatsapp:${formattedTo}`;
    }

    try {
        if (!client) {
            console.warn(`⚠️ Twilio credentials missing in .env! Cannot send WhatsApp to ${formattedTo}. Message: ${message}`);
            return false;
        }

        // The trailing || '+14155238886' fallback provides a known Twilio Sandbox Number
        // We strip '+' from env provided number and unconditionally append 'whatsapp:+' 
        // Twilio numbers must be explicit for whatsapp
        let envNumber = process.env.TWILIO_WHATSAPP_NUMBER?.replace(/[^0-9+]/g, '') || '+14155238886';
        if (!envNumber.startsWith('+')) envNumber = `+${envNumber}`;
        const twilioFrom = `whatsapp:${envNumber}`;

        // For testing during Twilio sandbox restrictions, we have to use pre-approved templates
        // This bypasses the 24-hour business window restriction for outbound messages.
        // The exact template given to user in dashboard: "Your appointment is coming up on {{1}} at {{2}}. If you need to change it, please reply back and let us know."
        const testTemplate = `Thank you for choosing Vampire Vault!\n You will be notified a few days ago before your plan expires`;

        await client.messages.create({
            body: testTemplate,
            from: twilioFrom,
            to: formattedTo
        });

        console.log(`🟢 WhatsApp sent to ${formattedTo}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending WhatsApp to ${formattedTo}:`, error.message);
        return false;
    }
};
