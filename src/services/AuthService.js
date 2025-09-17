import AxiosInstance from "../api/AxiosInstance";

const AuthService = {
    login: async (credentials) => {
        try {
            const response = await AxiosInstance.post('/auth/login', credentials);

            // Stockage automatique du token si présent
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('userData', JSON.stringify(response.data.user));
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
        return !!localStorage.getItem('authToken');
    },

    getCurrentUser: () => {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }
}

export default AuthService;