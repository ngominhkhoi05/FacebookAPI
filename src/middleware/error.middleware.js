const logger = require('../config/logger');
const ApiResponse = require('../utils/apiResponse');
const errorCodes = require('../utils/errorCodes');

function errorHandler(err, req, res, next) {
  logger.error(`[ERROR] ${err.message}`, { stack: err.stack });

  if (err.isApiError) {
    return res.status(err.status).json(err.toJSON ? err.toJSON() : ApiResponse.error(err.code, err.message, err.status));
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json(ApiResponse.error('VALIDATION_ERROR', err.message, 400, err.details));
  }

  if (err.response?.data?.error?.code === 190) {
    return res.status(401).json(ApiResponse.error('TOKEN_EXPIRED', 'Facebook token has expired. Please renew.', 401));
  }

  if (err.response?.status === 400) {
    const fbError = err.response?.data?.error?.message || 'Invalid request to Facebook API.';
    return res.status(502).json(ApiResponse.error('FB_API_ERROR', fbError, 502));
  }

  if (err.response?.status === 429) {
    return res.status(429).json(ApiResponse.error('FB_RATE_LIMIT', 'Facebook API rate limit exceeded.', 429));
  }

  if (err.response?.status >= 500) {
    return res.status(502).json(ApiResponse.error('FB_SERVICE_UNAVAILABLE', 'Facebook API is temporarily unavailable.', 503));
  }

  res.status(500).json(ApiResponse.error('INTERNAL_ERROR', 'An internal server error occurred.', 500));
}

module.exports = errorHandler;
