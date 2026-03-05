import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vampire_vault_key_2024';

// Nodemailer Transporter Configuration
// Note: We use ethereal for testing if no real credentials are provided, 
// but we'll set it up to accept a real Gmail/App password via ENV vars.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to send email
const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Vampire Vault" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Vampire Vault OTP Verification Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">Vampire Vault Verification</h2>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            Here is your One-Time Password to access the Vault. It will expire in 10 minutes.
          </p>
          <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #ffffff;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Zero-Persistence Protocol Active. We do not store financial data.
          </p>
        </div>
      `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email}`);
        } else {
            console.log(`\n============================`);
            console.log(`🔒 EMAIL CREDENTIALS NOT SET`);
            console.log(`🔒 MOCK OTP FOR ${email}: ${otp}`);
            console.log(`============================\n`);
        }
    } catch (error) {
        console.error("Error sending email:", error);
        // Even if email fails, we might want to log it in console so dev can continue
        console.log(`\n[FALLBACK] OTP FOR ${email}: ${otp}\n`);
    }
};

// Route 1: Signup -> Generate OTP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, dob, password, mobile } = req.body;

        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ error: 'User already exists and is verified.' });
            }
            // If user exists but is not verified, we'll just update their info and send a new OTP
        } else {
            user = new User({
                name,
                email,
                dob,
                password, // In production, hash with bcrypt!
                mobile
            });
        }

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 mins

        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();

        // Send OTP via email
        await sendOTPEmail(email, otp);

        res.status(200).json({ message: 'OTP sent successfully. Please check your email.', email });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ error: 'No OTP generated for this email' });
        }

        // Check expiry
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ error: 'OTP has expired. Please sign up again.' });
        }

        // Check OTP match
        if (user.otp === otp.toString()) {
            user.isVerified = true;
            user.otp = null;
            user.otpExpiry = null;
            await user.save();

            // Generate JWT so user is immediately logged in after OTP verification
            const payload = {
                user: { id: user._id }
            };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({
                message: 'OTP verified successfully.',
                token,
                user: { name: user.name, email: user.email }
            });
        } else {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route 3: Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email via OTP first' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const payload = {
            user: {
                id: user._id
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { name: user.name, email: user.email }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
