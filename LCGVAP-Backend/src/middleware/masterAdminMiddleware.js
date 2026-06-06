const isMasterAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'master_admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Master Admin privileges required' });
    }
};

module.exports = isMasterAdmin;
