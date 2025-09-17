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

export default AxiosInstance;