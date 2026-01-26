import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export const protect = (req: Request, res: Response, next: NextFunction) => {
    const {isLoggedIn, userId} = req.session;
    if (!isLoggedIn || !userId) {   
        return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
};