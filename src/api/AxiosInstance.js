import axios from "axios";

const AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:3080/',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Get environment variables with fallbacks
const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'authToken';
const USER_DATA_KEY = process.env.REACT_APP_USER_DATA_KEY || 'userData';

AxiosInstance.interceptors.request.use(
    (config) => {
        // Ajouter le token d'authentification aux en-têtes si disponible
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur de réponse pour gérer les erreurs d'authentification globalement
AxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si l'erreur est liée à l'authentification
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Vérifier si nous sommes déjà sur la page de login pour éviter les redirections en boucle
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
                console.log('Token expiré ou invalide, redirection vers la page de connexion');
                
                // Nettoyer le localStorage
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
                
                // Rediriger vers la page de login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance;