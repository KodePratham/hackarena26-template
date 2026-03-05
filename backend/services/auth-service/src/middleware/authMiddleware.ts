import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'vitalscore_super_secret_key_change_in_prod';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Authentication token is required' }
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        if (decoded.type === 'refresh') {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Cannot use refresh token for API access' }
            });
            return;
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' }
            });
            return;
        }

        res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Invalid token' }
        });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
            });
            return;
        }

        next();
    };
};
