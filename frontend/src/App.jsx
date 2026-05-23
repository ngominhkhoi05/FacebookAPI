import React, { useState, useEffect } from 'react';
import { authApi, postsApi, commentsApi } from './api';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        onLogin(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Facebook Dashboard</h2>
        <p>Sign in to manage your Page</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function PostItem({ post, onViewComments, user }) {
  const date = new Date(post.created_time).toLocaleString('vi-VN');

  return (
    <div className="post-item">
      <div className="post-message">{post.message || '(No text content)'}</div>
      <div className="post-meta">
        <span>Posted: {date}</span>
        {post.shares > 0 && <span>Shares: {post.shares}</span>}
        {post.likes > 0 && <span>Reactions: {post.likes}</span>}
      </div>
      <div className="post-actions">
        <button className="btn btn-secondary" onClick={() => onViewComments(post)}>
          View Comments
        </button>
        {post.permalink_url && (
          <a
            href={post.permalink_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            View on Facebook
          </a>
        )}
      </div>
    </div>
  );
}

function CommentSection({ post, onClose, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadComments();
  }, [post.id]);

  async function loadComments() {
    setLoading(true);
    setError('');
    try {
      const res = await commentsApi.getComments({ post_id: post.id, limit: 20 });
      setComments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(commentId) {
    const message = replyText[commentId];
    if (!message?.trim()) return;
    setActionLoading((prev) => ({ ...prev, [commentId]: true }));
    setActionMsg('');
    try {
      await commentsApi.replyComment(commentId, message);
      setReplyText((prev) => ({ ...prev, [commentId]: '' }));
      setActionMsg('Reply sent successfully!');
      setTimeout(() => setActionMsg(''), 3000);
      loadComments();
    } catch (err) {
      setActionMsg(err.response?.data?.error?.message || 'Failed to send reply.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  }

  async function handleHide(commentId) {
    if (!confirm('Hide this comment?')) return;
    setActionLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      await commentsApi.hideComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to hide comment.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Comments on post</h3>
        <p style={{ fontSize: 13, color: '#65676b', marginBottom: 16 }}>
          {post.message?.slice(0, 80) || '(No text)'}
          {(post.message?.length || 0) > 80 ? '...' : ''}
        </p>
        {actionMsg && <div className="success-msg">{actionMsg}</div>}
        {loading ? (
          <div className="loading">Loading comments...</div>
        ) : error ? (
          <div className="error-msg">{error}</div>
        ) : comments.length === 0 ? (
          <div className="empty">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">
                  {comment.from?.name || 'Unknown'}
                </span>
                <span className="comment-time">
                  {new Date(comment.created_time).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="comment-body">{comment.message}</div>
              {user.role === 'admin' && (
                <div className="comment-actions">
                  <div className="reply-form" style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyText[comment.id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleReply(comment.id);
                      }}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleReply(comment.id)}
                      disabled={actionLoading[comment.id]}
                    >
                      Reply
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleHide(comment.id)}
                      disabled={actionLoading[comment.id]}
                    >
                      Hide
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ message: '', link: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setError('');
    try {
      const res = await postsApi.getPosts({ limit: 20 });
      setPosts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!createData.message && !createData.link) return;
    setCreateLoading(true);
    setCreateMsg({ type: '', text: '' });
    try {
      await postsApi.createPost(createData);
      setCreateMsg({ type: 'success', text: 'Post created successfully!' });
      setCreateData({ message: '', link: '' });
      setShowCreateModal(false);
      setTimeout(loadPosts, 500);
    } catch (err) {
      setCreateMsg({ type: 'error', text: err.response?.data?.error?.message || 'Failed to create post.' });
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Facebook Page Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14 }}>{user.email}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        {error && <div className="error-msg">{error}</div>}

        {user.role === 'admin' && (
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Quick Actions</h3>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowCreateModal(true)}>
                + Create Post
              </button>
            </div>
          </div>
        )}

        <div className="section">
          <h3>Recent Posts</h3>
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="empty">No posts found.</div>
          ) : (
            posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onViewComments={setSelectedPost}
                user={user}
              />
            ))
          )}
          {!loading && posts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={loadPosts}>
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <CommentSection
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          user={user}
        />
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Post</h3>
            {createMsg.text && (
              <div className={createMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows={4}
                  value={createData.message}
                  onChange={(e) => setCreateData((p) => ({ ...p, message: e.target.value }))}
                  placeholder="What do you want to share?"
                />
              </div>
              <div className="form-group">
                <label>Link (optional)</label>
                <input
                  type="url"
                  value={createData.link}
                  onChange={(e) => setCreateData((p) => ({ ...p, link: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved && token) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  function handleLogin(data) {
    setUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
