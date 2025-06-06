import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api.js'; // Import the centralized API instance

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null); // Load token from localStorage
    const [loading, setLoading] = useState(false); // For UI feedback
    const [error, setError] = useState(null); // For displaying auth errors

    // The local Axios instance and its interceptor are removed.
    // The centralized 'api' from '../services/api.js' will be used directly.
    // It already has a request interceptor to add the token from localStorage.

    // Effect to check if user is already logged in (e.g. on page refresh if token is in localstorage)
    // This is a simplified version. A robust solution might involve a '/me' endpoint
    // to verify token and fetch user details on initial load.
    useEffect(() => {
        if (accessToken) {
            // Try to fetch user data or set a placeholder user if token exists
            // For now, if there's a token, we assume the user is "logged in" at a basic level.
            // A backend call to verify token and get user details would be better here.
            // E.g., api.get('/auth/me').then(response => setUser(response.data)).catch(() => logout());
            // For this iteration, we'll just set a dummy user if token exists.
            // This part will be improved when we have a /me endpoint or similar.
            // Ensure logout is defined before being called in catch block if token is invalid
            const attemptLogout = () => {
                setUser(null);
                setAccessToken(null);
                localStorage.removeItem('accessToken');
                // No need to call api.post('/auth/logout') here as this is a local cleanup for an invalid token.
            };

             try {
                const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
                // Basic validation of decoded token structure (exp, id) could be added here
                setUser({ id: decodedToken.id, username: decodedToken.username || 'User' }); // Assuming username is in token, or use a generic
            } catch (e) {
                // Invalid token, clear it
                console.error("Invalid token on initial load:", e);
                attemptLogout();
            }
        }
    }, [accessToken]); // Removed 'logout' from dependency array as it causes re-run issues; use local 'attemptLogout'


    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.data && response.data.accessToken) {
                setAccessToken(response.data.accessToken);
                setUser({ _id: response.data._id, username: response.data.username }); // Adjust based on actual user object from backend
                localStorage.setItem('accessToken', response.data.accessToken); // Persist token
            } else {
                 throw new Error('Login failed: No access token received');
            }
            setLoading(false);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed';
            setError(message);
            setLoading(false);
            throw new Error(message);
        }
    };

    const register = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/register', { username, password });
            setLoading(false);
            // Typically, after registration, user is redirected to login
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Registration failed';
            setError(message);
            setLoading(false);
            throw new Error(message);
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        // No need to setLoading(true) for the local cleanup part of logout
        // setLoading(true) should be for the API call if it's expected to take time

        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');

        try {
            setLoading(true); // Set loading true for the API call
            // Inform the backend to invalidate the refresh token
            await api.post('/auth/logout');
            // Backend handles HttpOnly cookie removal
        } catch (err) {
            // Log error if backend call fails, but client-side logout is already done
            console.error("Backend logout API call failed:", err);
            // setError might be set here if important to show user, but often not for logout.
        } finally {
            setLoading(false); // Ensure loading is set to false after API call
        }
    };

    const value = {
        user,
        accessToken,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!accessToken && !!user // Derived state for convenience
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
