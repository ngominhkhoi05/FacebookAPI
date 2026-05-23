const facebookService = require('../services/facebook.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../config/logger');

async function getPosts(req, res, next) {
  try {
    const { limit = 10, after } = req.query;
    const result = await facebookService.getPosts({ limit: parseInt(limit), after });

    const posts = (result.data || []).map((post) => ({
      id: post.id,
      message: post.message || '',
      created_time: post.created_time,
      permalink_url: post.permalink_url,
      full_picture: post.full_picture,
      shares: post.shares?.count || 0,
      likes: post.reactions?.summary?.total_count || 0,
    }));

    res.json(
      ApiResponse.paginated(posts, {
        paging: result.paging || null,
      })
    );
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { message, link, published = true } = req.body;

    if (!message && !link) {
      return res.status(400).json(
        ApiResponse.error('VALIDATION_ERROR', 'Either message or link is required.', 400)
      );
    }

    const result = await facebookService.createPost({ message, link, published });

    logger.info(`[POST] New post created by ${req.user.email} — post_id=${result.id}`);

    res.status(201).json(
      ApiResponse.success({ post_id: result.id, message: 'Post created successfully.' })
    );
  } catch (err) {
    next(err);
  }
}

async function getComments(req, res, next) {
  try {
    const { post_id, limit = 20, after } = req.query;

    if (!post_id) {
      return res.status(400).json(
        ApiResponse.error('VALIDATION_ERROR', 'post_id is required.', 400)
      );
    }

    const result = await facebookService.getComments(post_id, {
      limit: parseInt(limit),
      after,
    });

    const comments = (result.data || []).map((comment) => ({
      id: comment.id,
      message: comment.message,
      from: comment.from,
      created_time: comment.created_time,
      like_count: comment.like_count || 0,
      can_reply: comment.can_reply,
    }));

    res.json(
      ApiResponse.paginated(comments, {
        paging: result.paging || null,
      })
    );
  } catch (err) {
    next(err);
  }
}

async function replyComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json(
        ApiResponse.error('VALIDATION_ERROR', 'message is required.', 400)
      );
    }

    const result = await facebookService.replyComment(commentId, message);

    logger.info(`[COMMENT] Reply sent by ${req.user.email} — comment_id=${result.id}`);

    res.status(201).json(
      ApiResponse.success({ comment_id: result.id, message: 'Reply sent successfully.' })
    );
  } catch (err) {
    next(err);
  }
}

async function hideComment(req, res, next) {
  try {
    const { commentId } = req.params;
    await facebookService.hideComment(commentId);

    logger.info(`[COMMENT] Hidden by ${req.user.email} — comment_id=${commentId}`);

    res.json(ApiResponse.success({ message: 'Comment hidden successfully.' }));
  } catch (err) {
    next(err);
  }
}

module.exports = { getPosts, createPost, getComments, replyComment, hideComment };
