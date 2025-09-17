import AxiosInstance from "../api/AxiosInstance";

const AuthService = {
    // Connexion
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

    // Inscription
    register: async (userData) => {
        try {
            const response = await AxiosInstance.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Vérifier si l'utilisateur est connecté
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },

    // Obtenir les données utilisateur
    getCurrentUser: () => {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    // Déconnexion
    logout: async () => {
        try {
            await AxiosInstance.post('/auth/logout');
            
            // Supprimer les données d'authentification du localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            return { success: true, message: 'Déconnexion réussie' };
        } catch (error) {
            // Même en cas d'erreur serveur, on supprime les données locales
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            console.error('Erreur lors de la déconnexion:', error);
            return { success: true, message: 'Déconnexion locale réussie' };
        }
    }
}

export default AuthService;