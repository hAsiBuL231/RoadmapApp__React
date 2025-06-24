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

export default API;