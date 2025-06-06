import axios from 'axios';

// We need a way to get the access token and potentially the logout function.
// Directly importing useAuth here is not ideal as this is not a React component/hook.
// Instead, AuthContext could expose the token or a method to get it,
// or this api instance could be configured/updated from AuthContext.

// For now, we'll retrieve the token from localStorage directly,
// assuming AuthContext keeps it in sync there.
// A more robust solution might involve a state manager or event emitter if localStorage sync is not guaranteed.

const api = axios.create({
    baseURL: '/api', // Adjust if your API is hosted elsewhere or has a different prefix
    // timeout: 10000, // Optional: Add a timeout
    // headers: { 'Content-Type': 'application/json' } // Default, can be overridden
});

// Request Interceptor: To add the Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); // Get token from localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: (Optional Enhancement - for automatic token refresh)
// The commented out section from the prompt will be omitted for now.
// It can be added later if token refresh is implemented.

export default api;
