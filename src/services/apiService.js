// src/services/apiService.js

import { handleRequest } from "@/utils/api/RequestUtils";

const baseURL = process.env.NEXT_PUBLIC_API_URL; // URL de l'API

const handleResponse = async (response) => {
    const body = await handleRequest(response);

    console.log(body);

    if (!response.ok) {
        if (body && body.redirect) {
            window.location.href = body.redirect;
            return;
        }
        return Promise.reject(response, body);
    }
    return { response, body };
};

export const apiService = {
    get: async (url, params) => {
        const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
        const response = await fetch(`${baseURL}${url}${queryString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return handleResponse(response);
    },

    post: async (url, data) => {
        const response = await fetch(`${baseURL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    put: async (url, data) => {
        const response = await fetch(`${baseURL}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    delete: async (url) => {
        const response = await fetch(`${baseURL}${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return handleResponse(response);
    },
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