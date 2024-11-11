// src/services/apiService.js

import axios from 'axios';

// Configurer l'instance Axios de base
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // URL de l'API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ajouter un interceptors pour ajouter le token d'authentification
apiClient.interceptors.request.use(
    (config) => {
        // Récupère le token (supposé être stocké dans le localStorage par exemple)
        const token = localStorage.getItem('token');
        if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
    (response) => {
        console.log(response.data);
        return response.data;
    },
    (error) => {
        const data = error.response.data;
        if (data && data.redirect) {
            window.location.href = data.redirect;
            return;
        }
        console.log(error.response);
        return Promise.reject(error);
    }
);

// Service pour les différentes requêtes API
export const apiService = {
    get: (url, params) => apiClient.get(url, { params }),

    post: (url, data) => apiClient.post(url, data),

    put: (url, data) => apiClient.put(url, data),

    delete: (url) => apiClient.delete(url),
};

// list of all the routes
export const apiRoutes = {
    login: () => '/login',
    users: () => '/protected/user',
    user: (id) => `/protected/user/${id}`,
    workspaces: () => '/protected/workspace',
    workspace: (id) => `/protected/workspace/${id}`,
    invitations: () => '/protected/invitation',
    invitation: (id) => `/protected/invitation/${id}`,
    acceptInvitation: (id) => `/protected/invitation/accept/${id}`,
    rejectInvitation: (id) => `/protected/invitation/reject/${id}`,
    roles: () => '/protected/role',
    role: (id) => `/protected/role/${id}`,
    userRoles: () => '/protected/user_role',
    userRole: (id) => `/protected/user_role/${id}`,
};