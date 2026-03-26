// Middleware to check if user is authenticated
export const protect = (req, res, next) => {
    const { isLoggedIn, userId } = req.session;
    if (!isLoggedIn || !userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
};
