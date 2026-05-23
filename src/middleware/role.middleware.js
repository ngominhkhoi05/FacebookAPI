const logger = require('../config/logger');

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.', status: 401 },
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`[AUTH] Non-admin user "${req.user.email}" attempted admin action: ${req.method} ${req.originalUrl}`);
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin privileges required.', status: 403 },
    });
  }

  next();
}

module.exports = requireAdmin;
