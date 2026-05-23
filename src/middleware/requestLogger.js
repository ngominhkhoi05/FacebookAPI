const logger = require('../config/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userInfo = req.user ? `[user: ${req.user.email}]` : '[user: anonymous]';
    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${userInfo}`;
    if (res.statusCode >= 500) {
      logger.error(msg);
    } else if (res.statusCode >= 400) {
      logger.warn(msg);
    } else {
      logger.info(msg);
    }
  });

  next();
}

module.exports = requestLogger;
