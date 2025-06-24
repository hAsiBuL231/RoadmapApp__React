import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
});

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  roadmap: {
    getAll: "/roadmap",
    upvote: (itemId) => `/upvote/${itemId}`,
  },
  comments: {
    getByItem: (itemId) => `/comments/${itemId}`,
    create: "/comment",
    update: (commentId) => `/comments/${commentId}`,
    delete: (commentId) => `/comments/${commentId}`,
  },
  replies: {
    create: "/reply",
    update: (replyId) => `/replies/${replyId}`,
    delete: (replyId) => `/replies/${replyId}`,
  },
};

// Request interceptor for adding token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor
API.interceptors.response.use(
  (response) => {
    // Store token if it's returned in auth responses
    if ([API_ENDPOINTS.auth.login, API_ENDPOINTS.auth.register].includes(response.config.url)) {
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (token expired, invalid, etc.)
      localStorage.removeItem("token");
      // Optionally redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper functions for common operations
export const apiHelper = {
  // Auth
  login: (credentials) => API.post(API_ENDPOINTS.auth.login, credentials),
  register: (userData) => API.post(API_ENDPOINTS.auth.register, userData),
  getCurrentUser: () => API.get(API_ENDPOINTS.auth.me),

  // Roadmap
  getRoadmapItems: (status = "all", search = "") =>
    API.get(API_ENDPOINTS.roadmap.getAll, { params: { status, search } }),
  upvoteItem: (itemId) => API.post(API_ENDPOINTS.roadmap.upvote(itemId)),

  // Comments
  getComments: (itemId) => API.get(API_ENDPOINTS.comments.getByItem(itemId)),
  createComment: (itemId, text) =>
    API.post(API_ENDPOINTS.comments.create, { item_id: itemId, text }),
  updateComment: (commentId, text) =>
    API.put(API_ENDPOINTS.comments.update(commentId), { text }),
  deleteComment: (commentId) =>
    API.delete(API_ENDPOINTS.comments.delete(commentId)),

  // Replies
  createReply: (commentId, text, depth = 1) =>
    API.post(API_ENDPOINTS.replies.create, { comment_id: commentId, text, depth }),
  updateReply: (replyId, text) =>
    API.put(API_ENDPOINTS.replies.update(replyId), { text }),
  deleteReply: (replyId) =>
    API.delete(API_ENDPOINTS.replies.delete(replyId)),
};

export default API;