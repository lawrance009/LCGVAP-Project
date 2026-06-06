const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'master_admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Admin privileges required' });
    }
};

module.exports = isAdmin;
