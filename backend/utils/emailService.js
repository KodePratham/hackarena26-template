import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if you use another provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmailNotification = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"Vampire Vault" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.response}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error);
        return false;
    }
};
