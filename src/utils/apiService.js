import API, { API_ENDPOINTS } from "./api";

// Auth Services
export const authService = {
    login: async (credentials) => {
        try {
            const response = await API.post(API_ENDPOINTS.auth.login, credentials);
            const token = response.data.access_token;
            localStorage.setItem("token", token);
            return response.data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await API.post(API_ENDPOINTS.auth.register, userData);
            if (response.data.access_token) {
                localStorage.setItem("token", response.data.access_token);
            }
            return response.data;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await API.get(API_ENDPOINTS.auth.me);
            return response.data;
        } catch (error) {
            console.error("Get current user error:", error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem("token");
    }
};

// Roadmap Services
export const roadmapService = {
    getAllItems: async (status = "all", search = "") => {
        try {
            const response = await API.get(API_ENDPOINTS.roadmap.getAll, {
                params: { status, search }
            });
            return response.data;
        } catch (error) {
            console.error("Get roadmap items error:", error);
            throw error;
        }
    },

    upvoteItem: async (itemId) => {
        try {
            const response = await API.post(API_ENDPOINTS.roadmap.upvote(itemId));
            return response.data;
        } catch (error) {
            console.error("Upvote error:", error);
            throw error;
        }
    }
};

// Comment Services
export const commentService = {
    getByItem: async (itemId) => {
        try {
            const response = await API.get(API_ENDPOINTS.comments.getByItem(itemId));
            return response.data;
        } catch (error) {
            console.error("Get comments error:", error);
            throw error;
        }
    },

    create: async (itemId, text) => {
        try {
            const response = await API.post(API_ENDPOINTS.comments.create, {
                item_id: itemId,
                text
            });
            return response.data;
        } catch (error) {
            console.error("Create comment error:", error);
            throw error;
        }
    },

    update: async (commentId, text) => {
        try {
            const response = await API.put(API_ENDPOINTS.comments.update(commentId), {
                text
            });
            return response.data;
        } catch (error) {
            console.error("Update comment error:", error);
            throw error;
        }
    },

    delete: async (commentId) => {
        try {
            const response = await API.delete(API_ENDPOINTS.comments.delete(commentId));
            return response.data;
        } catch (error) {
            console.error("Delete comment error:", error);
            throw error;
        }
    }
};

// Reply Services
export const replyService = {
    create: async (commentId, text, depth = 1) => {
        try {
            const response = await API.post(API_ENDPOINTS.replies.create, {
                comment_id: commentId,
                text,
                depth
            });
            return response.data;
        } catch (error) {
            console.error("Create reply error:", error);
            throw error;
        }
    },

    update: async (replyId, text) => {
        try {
            const response = await API.put(API_ENDPOINTS.replies.update(replyId), {
                text
            });
            return response.data;
        } catch (error) {
            console.error("Update reply error:", error);
            throw error;
        }
    },

    delete: async (replyId) => {
        try {
            const response = await API.delete(API_ENDPOINTS.replies.delete(replyId));
            return response.data;
        } catch (error) {
            console.error("Delete reply error:", error);
            throw error;
        }
    }
};

// Combined API Service
export const apiService = {
    auth: authService,
    roadmap: roadmapService,
    comments: commentService,
    replies: replyService
};

export default apiService;