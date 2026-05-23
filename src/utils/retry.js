const logger = require('../config/logger');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 3, baseDelayMs = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isRetryable =
        error.response?.status >= 500 ||
        error.response?.status === 429 ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms. Error: ${error.message}`);

      if (attempt >= 2) {
        console.warn(`[RETRY WARNING] Attempt ${attempt}/${maxRetries} for operation`);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

module.exports = { retryWithBackoff };
