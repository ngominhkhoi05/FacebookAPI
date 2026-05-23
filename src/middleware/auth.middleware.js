const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`[AUTH] Missing or invalid Authorization header from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token required.', status: 401 },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn(`[AUTH] Token expired for request from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Session expired. Please login again.', status: 401 },
      });
    }
    logger.warn(`[AUTH] Invalid token from IP: ${req.ip} — ${err.message}`);
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token.', status: 401 },
    });
  }
}

module.exports = authMiddleware;
