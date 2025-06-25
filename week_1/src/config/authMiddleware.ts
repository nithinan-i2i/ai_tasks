import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';

interface AuthenticatedRequest extends Request {
    user?: object;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }

    req.user = decoded; // Attach decoded payload to the request object
    next();
};