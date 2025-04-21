


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated, redirect to login or return unauthorized response
        // return res.redirect('/login');
        return res.status(401).json({ error: "Unauthorized" });
    }
}


function authRole(requiredRoles) {
    return function (req, res, next) {
        if (req.session.user && Array.isArray(req.session.user.role) &&
            req.session.user.role.some(role => requiredRoles.includes(role))) {
        return next();
      } else if (req.session.user && !Array.isArray(req.session.user.role) &&
            requiredRoles.includes(req.session.user.role)) {
        return next();
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }
    };
}
  



module.exports = {
    isAuthenticated,
    authRole
} 