import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Matches the secret established in routes/auth.js and .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_vampire_vault_key_2024');
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
