// Use relative URL in development for proxying, absolute URL in production
export const BASE_URL = import.meta.env.MODE === 'development'
    ? ''
    : (import.meta.env.VITE_API_URL || 'https://odoo-cafe-pos-h0wl.onrender.com');
const API_URL = `${BASE_URL}/api`;

export const authApi = {
    register: async (userData: any) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }
        return data;
    },

    login: async (credentials: any) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        return data;
    },
};
