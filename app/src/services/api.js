import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://habitharmony.onrender.com/api"

const api = {
    register: async (userData) => {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};

export default api;