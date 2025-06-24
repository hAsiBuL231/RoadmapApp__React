import API, { API_ENDPOINTS } from "./api";

// Login
export const login = async (email_pass) => {
    try {
        const response = await API.post(API_ENDPOINTS.auth.login, email_pass, { headers: { 'Content-Type': 'application/json' } });
        console.log(response);
        const token = response.data.access_token;
        console.log(token);
        localStorage.setItem("token", token);
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

// Register
export const register = async (email_pass) => {
    try {
        const response = await API.post(API_ENDPOINTS.auth.register, email_pass, { headers: { 'Content-Type': 'application/json' } });
        return response.data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

// Protected API call
export const fetchUserData = async () => {
    try {
        const response = await API.get("/user/profile");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user data:", error);
        throw error;
    }
};