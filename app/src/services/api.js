import axios from 'axios';

// Define the API base URL, attempting to read from Vite environment variables first,
// then falling back to a default URL.
const API_URL = 'https://habitharmony.onrender.com/api';

// Create an Axios instance for API calls that require authentication
// or benefit from a base URL.
const instance = axios.create({
    baseURL: API_URL, // Use the resolved API_URL
});

// Add a request interceptor to the instance to automatically attach the JWT token to headers.
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("Axios request interceptor error:", error);
        return Promise.reject(error);
    }
);

const api = {
    /**
     * Registers a new user.
     * @param {object} userData - User registration data (e.g., name, email, password).
     * @returns {Promise<object>} The response data from the API.
     */
    register: async (userData) => {
        try {
            console.log("[API Register] Attempting registration with data:", userData);
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            console.log("[API Register] Response:", response);
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log("[API Register] Token stored successfully.");
            } else {
                console.warn("[API Register] Registration response received, but no token found:", response.data);
            }
            return response.data;
        } catch (error) {
            console.error("[API Register] Error:", error.response || error.message || error);
            if (error.response) {
                console.error("[API Register] Error data:", error.response.data);
                console.error("[API Register] Error status:", error.response.status);
                throw {
                    message: error.response.data?.message || "Registration failed",
                    status: error.response.status,
                    data: error.response.data
                };
            } else if (error.request) {
                console.error("[API Register] No response received:", error.request);
                throw new Error("No response from server during registration.");
            } else {
                throw new Error(error.message || "An unexpected error occurred during registration.");
            }
        }
    },

    /**
     * Logs in an existing user.
     * @param {object} credentials - User login credentials (e.g., email, password).
     * @returns {Promise<object>} The response data from the API.
     */
    login: async (credentials) => {
        try {
            console.log("[API Login] Attempting login with credentials:", credentials);
            console.log("[API Login] Using API URL:", API_URL);
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            console.log("[API Login] Response:", response);

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log("[API Login] Token stored successfully.");
            } else {
                console.warn("[API Login] Login response received, but no token found:", response.data);
            }
            return response.data;
        } catch (error) {
            console.error("[API Login] Error:", error);
            if (error.response) {
                console.error("[API Login] Error response data:", error.response.data);
                console.error("[API Login] Error response status:", error.response.status);
                throw {
                    message: error.response.data?.message || "Login failed",
                    status: error.response.status,
                    data: error.response.data
                };
            } else if (error.request) {
                console.error("[API Login] No response received. Request details:", error.request);
                throw new Error("No response from server. Check network or server status.");
            } else {
                console.error("[API Login] Error setting up request:", error.message);
                throw new Error(error.message || "An unexpected error occurred during login.");
            }
        }
    },

    /**
     * Logs out the current user by removing the token from localStorage.
     */
    logout: () => {
        console.log("[API Logout] Logging out and removing token.");
        localStorage.removeItem('token');
    },

    /**
     * Fetches the profile of the currently authenticated user.
     * Uses the configured 'instance' which includes the Authorization header.
     * @returns {Promise<object>} The user profile data.
     */
    getProfile: async () => {
        try {
            console.log("[API GetProfile] Attempting to fetch profile.");
            const response = await instance.get('/profile'); // Assuming '/profile' is relative
            console.log("[API GetProfile] Response:", response);
            return response.data;
        } catch (error) {
            console.error("[API GetProfile] Error:", error.response || error.message || error);
            if (error.response) {
                console.error("[API GetProfile] Error data:", error.response.data);
                console.error("[API GetProfile] Error status:", error.response.status);
                throw {
                    message: error.response.data?.message || "Failed to fetch profile",
                    status: error.response.status,
                    data: error.response.data
                };
            } else if (error.request) {
                console.error("[API GetProfile] No response received:", error.request);
                throw new Error("No response from server for getProfile.");
            } else {
                throw new Error(error.message || "An unexpected error occurred while fetching profile.");
            }
        }
    },
};

export default api;
export { instance as apiInstance };
