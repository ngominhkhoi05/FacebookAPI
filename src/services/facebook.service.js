const axios = require('axios');
const config = require('../config');
const logger = require('../config/logger');
const { retryWithBackoff } = require('../utils/retry');

const FB_BASE = config.facebook.graphApiBase;

function fbErrorToCode(error) {
  const fbError = error?.response?.data?.error;
  if (!fbError) return null;

  const fbCode = fbError.code;
  if (fbCode === 190) return 'TOKEN_EXPIRED';
  if (fbCode === 100 || fbCode === 368) return 'VALIDATION_ERROR';
  return 'FB_API_ERROR';
}

function mapFbError(error) {
  const fbError = error?.response?.data?.error;
  if (!fbError) return error;

  const mapped = new Error(fbError.message || 'Facebook API error');
  mapped.code = fbErrorToCode(error);
  mapped.fbCode = fbError.code;
  mapped.response = error.response;
  return mapped;
}

async function fbGet(endpoint, params = {}) {
  const url = `${FB_BASE}/${endpoint}`;
  logger.info(`FB_REQUEST [GET] ${endpoint}`);

  return retryWithBackoff(async () => {
    const start = Date.now();
    try {
      const response = await axios.get(url, {
        params: { ...params, access_token: config.facebook.accessToken },
        timeout: 10000,
      });
      const duration = Date.now() - start;
      logger.info(`FB_RESPONSE [200] ${endpoint} duration=${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - start;
      const status = error.response?.status || 'NETWORK';
      logger.error(`FB_ERROR [${status}] ${endpoint} duration=${duration}ms — ${error.message}`);
      throw mapFbError(error);
    }
  });
}

async function fbPost(endpoint, data = {}) {
  const url = `${FB_BASE}/${endpoint}`;
  logger.info(`FB_REQUEST [POST] ${endpoint}`);

  return retryWithBackoff(async () => {
    const start = Date.now();
    try {
      const response = await axios.post(url, { ...data, access_token: config.facebook.accessToken }, { timeout: 10000 });
      const duration = Date.now() - start;
      logger.info(`FB_RESPONSE [200] ${endpoint} duration=${duration}ms — post_id=${response.data.id}`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - start;
      const status = error.response?.status || 'NETWORK';
      logger.error(`FB_ERROR [${status}] ${endpoint} duration=${duration}ms — ${error.message}`);
      throw mapFbError(error);
    }
  });
}

async function fbDelete(endpoint) {
  const url = `${FB_BASE}/${endpoint}`;
  logger.info(`FB_REQUEST [DELETE] ${endpoint}`);

  return retryWithBackoff(async () => {
    const start = Date.now();
    try {
      const response = await axios.delete(url, {
        params: { access_token: config.facebook.accessToken },
        timeout: 10000,
      });
      const duration = Date.now() - start;
      logger.info(`FB_RESPONSE [200] ${endpoint} duration=${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - start;
      const status = error.response?.status || 'NETWORK';
      logger.error(`FB_ERROR [${status}] ${endpoint} duration=${duration}ms — ${error.message}`);
      throw mapFbError(error);
    }
  });
}

async function getPosts({ limit = 10, after = null } = {}) {
  const params = { limit };
  if (after) params.after = after;
  return fbGet(`${config.facebook.pageId}/posts`, params);
}

async function createPost({ message, link = null, published = true }) {
  const data = { message, published };
  if (link) data.link = link;
  return fbPost(`${config.facebook.pageId}/feed`, data);
}

async function getComments(postId, { limit = 20, after = null } = {}) {
  const params = { limit };
  if (after) params.after = after;
  return fbGet(`${postId}/comments`, params);
}

async function replyComment(commentId, message) {
  return fbPost(`${commentId}/comments`, { message });
}

async function hideComment(commentId) {
  return fbDelete(`${commentId}`);
}

module.exports = { getPosts, createPost, getComments, replyComment, hideComment };
