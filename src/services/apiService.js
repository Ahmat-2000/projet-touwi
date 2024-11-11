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
  (response) => response,
  (error) => {
    console.error('Erreur API:', error.response || error.message);
    return Promise.reject(error);
  }
);

// Service pour les différentes requêtes API
const apiService = {
  get: (url, params) => apiClient.get(url, { params }),

  post: (url, data) => apiClient.post(url, data),

  put: (url, data) => apiClient.put(url, data),

  delete: (url) => apiClient.delete(url),
};

export default apiService;
