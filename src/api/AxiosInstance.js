import axios from "axios";

const AxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:3080/',
    headers: {
        "Content-Type": "application/json",
    },
});

AxiosInstance.interceptors.request.use(
    (config) => {
        // Ajouter le token d'authentification aux en-têtes si disponible
        const token = localStorage.getItem('authToken');
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
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                
                // Rediriger vers la page de login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance;