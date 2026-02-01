// Use relative URL in development for proxying, absolute URL in production
export const BASE_URL = import.meta.env.MODE === 'development'
    ? ''
    : (import.meta.env.VITE_API_URL || 'https://odoo-cafe-pos-h0wl.onrender.com');
const API_URL = `${BASE_URL}/api`;

export const authApi = {
    register: async (userData: any) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                signal: controller.signal
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            return data;
        } finally {
            clearTimeout(timeoutId);
        }
    },

    login: async (credentials: any) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                signal: controller.signal
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            return data;
        } finally {
            clearTimeout(timeoutId);
        }
    },
};
