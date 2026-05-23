const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/role.middleware');
const {
  getPosts,
  createPost,
  getComments,
  replyComment,
  hideComment,
} = require('../controllers/facebook.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/posts', getPosts);

router.post('/post', requireAdmin, createPost);

router.get('/comments', getComments);

router.post('/comments/:commentId/reply', requireAdmin, replyComment);

router.delete('/comments/:commentId', requireAdmin, hideComment);

module.exports = router;
