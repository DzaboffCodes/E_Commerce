// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ 
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
    });
};

// Optional authentication (doesn't block if not authenticated)
const optionalAuth = (req, res, next) => {
    // Just proceed - req.user will be populated if authenticated
    next();
};

// Admin role check (extend this based on your user roles)
const requireAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            message: 'Authentication required',
            error: 'UNAUTHORIZED'
        });
    }
    
    // Add admin role check logic here if you have user roles
    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({ 
    //         message: 'Admin privileges required',
    //         error: 'FORBIDDEN'
    //     });
    // }
    
    next();
};

module.exports = {
    isAuthenticated,
    optionalAuth,
    requireAdmin
};