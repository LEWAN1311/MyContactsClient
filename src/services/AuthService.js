import AxiosInstance from "../api/AxiosInstance";

// Get environment variables with fallbacks
const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'authToken';
const USER_DATA_KEY = process.env.REACT_APP_USER_DATA_KEY || 'userData';

const AuthService = {
    login: async (credentials) => {
        try {
            const response = await AxiosInstance.post('/auth/login', credentials);

            // Stockage automatique du token si présent
            if (response.data.token) {
                localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
                if (response.data.user) {
                    localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
                }
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await AxiosInstance.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(AUTH_TOKEN_KEY);
    },

    getCurrentUser: () => {
        const userData = localStorage.getItem(USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
    }
}

export default AuthService;