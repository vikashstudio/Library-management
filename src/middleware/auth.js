// Protect routes - User must be logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({
    status: 'error',
    message: 'Unauthorized: Please log in to access this resource'
  });
};

// Restrict to Admin role
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    status: 'error',
    message: 'Forbidden: Admin access required'
  });
};

module.exports = { isAuthenticated, isAdmin };
