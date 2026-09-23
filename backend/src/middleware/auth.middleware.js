const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing'));
  }
  try {
    const decoded = verifyAccessToken(header.slice(7));
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = { requireAuth };
