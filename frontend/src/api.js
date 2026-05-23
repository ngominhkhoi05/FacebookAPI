import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

export const postsApi = {
  getPosts: (params) => api.get('/posts', { params }),
  createPost: (data) => api.post('/post', data),
};

export const commentsApi = {
  getComments: (params) => api.get('/comments', { params }),
  replyComment: (commentId, message) =>
    api.post(`/comments/${commentId}/reply`, { message }),
  hideComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export default api;
