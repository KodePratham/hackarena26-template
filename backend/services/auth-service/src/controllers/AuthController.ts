import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'vitalscore_super_secret_key_change_in_prod';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'vitalscore_super_refresh_key_change_in_prod';

export class AuthController {

    /**
     * POST /auth/login
     * Validates social login token (e.g. from Web3Auth) and issues internal JWT
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { idToken, provider, email, externalWalletId } = req.body;

            if (!idToken) {
                res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'ID Token is required' }
                });
                return;
            }

            // In a real implementation with Web3Auth:
            // 1. Verify the idToken with Web3Auth JWKS
            // 2. Extract user info

            // Mock validation for hackathon:
            let userId;
            let role = 'USER';

            // Find or create user based on email or externalWalletId
            const userResult = await pool.query('SELECT * FROM user_profiles WHERE "algorandAddress" = $1 OR "kycStatus" = $2', [externalWalletId || 'NONE', 'PENDING']);

            if (userResult.rows.length === 0) {
                userId = uuidv4();
                // Here we'd typically trigger an async profile creation or create the base record
                logger.info(`New user authenticated via ${provider}: ${userId}`);
            } else {
                userId = userResult.rows[0].userId;
                logger.info(`Existing user logged in: ${userId}`);
            }

            // Generate Tokens
            const accessToken = jwt.sign(
                { userId, role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const refreshToken = jwt.sign(
                { userId, role, type: 'refresh' },
                REFRESH_SECRET,
                { expiresIn: '30d' }
            );

            res.status(200).json({
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                    expiresIn: 86400, // 24 hours in seconds
                    user: {
                        userId,
                        role
                    }
                },
                meta: { timestamp: new Date().toISOString() }
            });
        } catch (error) {
            logger.error('Login error', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to process login' }
            });
        }
    }

    /**
     * POST /auth/refresh
     * Generates a new access token using a valid refresh token
     */
    static async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Refresh Token is required' }
                });
                return;
            }

            // Verify refresh token
            try {
                const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as any;

                if (decoded.type !== 'refresh') {
                    throw new Error('Invalid token type');
                }

                // Generate new access token
                const accessToken = jwt.sign(
                    { userId: decoded.userId, role: decoded.role },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(200).json({
                    success: true,
                    data: {
                        accessToken,
                        expiresIn: 86400
                    },
                    meta: { timestamp: new Date().toISOString() }
                });
            } catch (err) {
                res.status(401).json({
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' }
                });
            }
        } catch (error) {
            logger.error('Refresh token error', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to refresh token' }
            });
        }
    }

    /**
     * POST /auth/logout
     * Invalidates session
     */
    static async logout(req: Request, res: Response): Promise<void> {
        try {
            // In a real implementation with redis, we'd add the token to a deny list
            // For now, client-side token deletion is expected

            res.status(200).json({
                success: true,
                data: { message: 'Logged out successfully' },
                meta: { timestamp: new Date().toISOString() }
            });
        } catch (error) {
            logger.error('Logout error', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to logout' }
            });
        }
    }
}
