module.exports = {
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    status: 401,
    message: 'Facebook access token has expired. Please renew your token.',
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    status: 401,
    message: 'Facebook access token is invalid.',
  },
  FB_API_ERROR: {
    code: 'FB_API_ERROR',
    status: 502,
    message: 'Facebook Graph API returned an error.',
  },
  FB_RATE_LIMIT: {
    code: 'FB_RATE_LIMIT',
    status: 429,
    message: 'Facebook API rate limit exceeded. Please try again later.',
  },
  FB_SERVICE_UNAVAILABLE: {
    code: 'FB_SERVICE_UNAVAILABLE',
    status: 503,
    message: 'Facebook API is temporarily unavailable. Retry policy exhausted.',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
    message: 'Request validation failed.',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: 403,
    message: 'You do not have permission to perform this action.',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: 404,
    message: 'Resource not found.',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Authentication required.',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    status: 500,
    message: 'An internal server error occurred.',
  },
};
